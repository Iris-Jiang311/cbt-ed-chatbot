require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const natural = require("natural");
const fs = require("fs");
const path = require("path");
const vader = require("vader-sentiment");
const admin = require("firebase-admin");

// ✅ Firebase 初始化
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error("❌ Missing FIREBASE_SERVICE_ACCOUNT environment variable.");
  process.exit(1);
}
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch (error) {
  console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:", error);
  process.exit(1);
}
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// ✅ OpenAI 初始化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Express 设置
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: ["http://localhost:3000", "https://ccbt-chatbot.netlify.app"],
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

// ✅ 匹配函数
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

// ✅ 系统提示生成
function generateSystemPrompt(style) {
  const base = `You are an empathetic and supportive CBT chatbot named BloomBud. `;
  if (style === "direct") {
    return base + "Respond in a clear, structured, and direct manner. Provide actionable guidance quickly. Use complete sentences and always finish your thoughts. The response must be within 50 words. Reply more like a human being and like a conversation.";
  } else if (style === "gentle") {
    return base + "Respond in a soft, nurturing, and emotionally supportive tone. Validate feelings and respond with empathy. Use complete sentences and always finish your thoughts. The response must be within 50 words. Reply more like a human being and like a conversation.";
  } else {
    return base + "Respond warmly and positively. Help challenge negative thoughts with constructive and encouraging guidance. Always use complete sentences. The response must be within 50 words. Reply more like a human being and like a conversation.";
  }
}

// ✅ 获取/更新用户状态
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

// ✅ 获取历史对话
async function getRecentChatHistory(userId, limit = 6) {
  const snapshot = await db.collection("users").doc(userId).collection("chat_logs")
    .orderBy("timestamp", "desc")
    .limit(limit)
    .get();

  const history = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    history.unshift({ user: data.user_input, bot: data.bot_response });
  });
  return history;
}

// ✅ 主聊天接口
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

  if (bestMatch && highestScore >= 0.78) {
    responseText = bestMatch.bot_response;
    responseSource = "Knowledge Base";
    cbtCategory = bestMatch.cbt_category || "N/A";
  } else {
    try {
      const history = await getRecentChatHistory(userId);
      const messages = [
        { role: "system", content: generateSystemPrompt(currentStyle) },
        ...history.flatMap(pair => [
          { role: "user", content: pair.user },
          { role: "assistant", content: pair.bot }
        ]),
        { role: "user", content: message }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        max_tokens: 80,
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

  // ✅ 存储聊天记录
  await db.collection("users").doc(userId).collection("chat_logs").add({
    user_input: message,
    bot_response: responseText,
    source: responseSource,
    cbt_category: cbtCategory,
    sentiment_score: sentimentScore,
    chat_style: currentStyle,
    timestamp: new Date()
  });

  // ✅ 更新状态
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
