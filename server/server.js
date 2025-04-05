require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const natural = require("natural");
const fs = require("fs");
const path = require("path");
const vader = require("vader-sentiment");
const admin = require("firebase-admin");

// ✅ 检查 Firebase 环境变量
["FIREBASE_PROJECT_ID", "FIREBASE_PRIVATE_KEY_ID", "FIREBASE_PRIVATE_KEY", "FIREBASE_CLIENT_EMAIL", "FIREBASE_CLIENT_ID"].forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required env var: ${key}`);
    process.exit(1);
  }
});

// ✅ 清理私钥格式
let rawKey = process.env.FIREBASE_PRIVATE_KEY;
if (rawKey.startsWith('"') && rawKey.endsWith('"')) {
  rawKey = rawKey.slice(1, -1);
}
const cleanPrivateKey = rawKey.replace(/\\n/g, '\n');

// ✅ 构建 serviceAccount 对象
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: cleanPrivateKey,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`
};

// ✅ 写入临时 JSON 文件以供 Firebase Admin 使用
const tempPath = path.join(__dirname, "tmp");
const keyPath = path.join(tempPath, "firebase-key.json");

if (!fs.existsSync(tempPath)) fs.mkdirSync(tempPath);
fs.writeFileSync(keyPath, JSON.stringify(serviceAccount, null, 2));

// ✅ 初始化 Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(require(keyPath)),
});
const db = admin.firestore();

// ✅ 初始化 OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Express 设置
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: ["http://localhost:3000", "https://merry-gecko-690ad7.netlify.app"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));
app.use(express.json());

// ✅ 加载 CBT 数据集
let cbtData = [];
try {
  const data = fs.readFileSync("./cbt_dataset.json", "utf-8");
  cbtData = JSON.parse(data).filter(entry => entry.user_input && typeof entry.user_input === "string");
  console.log(`✅ Loaded ${cbtData.length} valid CBT records.`);
} catch (error) {
  console.error("❌ Error loading CBT dataset:", error);
}

// ✅ 匹配用户输入与数据集
const compareSimilarity = (input, dataset) => {
  let bestMatch = null;
  let highestScore = 0.0;
  dataset.forEach(entry => {
    const score = natural.JaroWinklerDistance(input.toLowerCase(), entry.user_input.toLowerCase());
    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  });
  return { bestMatch, highestScore };
};

// ✅ GPT 回应样式
function generateSystemPrompt(style) {
  const base = `You are an empathetic and supportive CBT chatbot named BloomBud. `;
  if (style === "direct") {
    return base + "Respond in a clear, structured, and direct manner. Provide actionable guidance quickly. Use complete sentences and always finish your thoughts.";
  } else if (style === "gentle") {
    return base + "Respond in a soft, nurturing, and emotionally supportive tone. Validate feelings and respond with empathy. Use complete sentences and always finish your thoughts.";
  } else {
    return base + "Respond warmly and positively. Help challenge negative thoughts with constructive and encouraging guidance. Always use complete sentences.";
  }
}

// ✅ 获取用户状态
async function getUserChatState(userId) {
  const docRef = db.collection("users").doc(userId).collection("meta").doc("chat_state");
  const doc = await docRef.get();
  return doc.exists
    ? doc.data()
    : { current_chat_style: "direct", consecutive_negative_count: 0, escalation_triggered: false };
}

async function updateUserChatState(userId, newState) {
  const docRef = db.collection("users").doc(userId).collection("meta").doc("chat_state");
  await docRef.set(newState, { merge: true });
}

// ✅ 聊天主接口
app.post("/chatbot", async (req, res) => {
  const { message, username, chatStyle, source } = req.body;
  const userId = username || "guest@chat.com";

  if (!message) return res.status(400).json({ error: "Missing 'message' field." });

  let userState = await getUserChatState(userId);
  if (!userState.manual_selected && chatStyle) {
    userState.current_chat_style = chatStyle;
    userState.manual_selected = true;
  }

  let currentStyle = userState.current_chat_style || "direct";
  let negativeCount = userState.consecutive_negative_count || 0;
  let escalation = userState.escalation_triggered || false;

  const sentiment = vader.SentimentIntensityAnalyzer.polarity_scores(message);
  const sentimentScore = sentiment.compound;
  const isNegative = sentimentScore <= -0.05;

  if (isNegative) {
    negativeCount++;
    if (currentStyle === "direct" && negativeCount === 3) {
      currentStyle = "gentle";
      negativeCount = 0;
    } else if (currentStyle === "gentle" && negativeCount >= 3) {
      escalation = true;
    } else if (currentStyle !== "gentle" && negativeCount >= 5) {
      escalation = true;
    }
  } else {
    negativeCount = 0;
  }

  const { bestMatch, highestScore } = compareSimilarity(message, cbtData);
  let responseText = "";
  let responseSource = "";
  let cbtCategory = "N/A";

  if (bestMatch && highestScore >= 0.9) {
    responseText = bestMatch.bot_response;
    responseSource = "Knowledge Base";
    cbtCategory = bestMatch.cbt_category || "N/A";
  } else {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: generateSystemPrompt(currentStyle) },
          { role: "user", content: message }
        ],
        max_tokens: 60,
        temperature: 0.8,
        top_p: 0.9
      });
      responseText = response.choices[0].message.content;
      responseSource = "GPT";
    } catch (error) {
      console.error("❌ OpenAI API Error:", error);
      return res.json({
        response: "Sorry, something went wrong. Please try again later.",
        source: "Error",
        sentiment_score: sentimentScore
      });
    }
  }

  if (escalation) {
    responseText += "\n\n💬 It seems you're going through a tough time. Consider seeking professional support. You can click the 💡 floating widget at the bottom right for help.";
  }

  // 储存聊天记录（如有需要可取消注释）
  /*
  await db.collection("users").doc(userId).collection("chat_logs").add({
    user_input: message,
    bot_response: responseText,
    source: responseSource,
    cbt_category: cbtCategory,
    sentiment_score: sentimentScore,
    chat_style: currentStyle,
    timestamp: new Date()
  });
  */

  await updateUserChatState(userId, {
    current_chat_style: currentStyle,
    consecutive_negative_count: negativeCount,
    escalation_triggered: escalation
  });

  res.json({
    response: responseText,
    source: responseSource,
    sentiment_score: sentimentScore,
    current_chat_style: currentStyle,
    escalation_triggered: escalation
  });
});

// ✅ 启动服务
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
