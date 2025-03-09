require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const natural = require("natural");
const fs = require("fs");
const admin = require("firebase-admin");

// ✅ OpenAI 初始化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

const serviceAccount = require("./firebaseServiceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 5001;

console.log("🔍 Checking OpenAI API Key:", process.env.OPENAI_API_KEY ? "✅ Loaded" : "❌ Missing");

app.use(cors({
    origin: ["http://localhost:3000", "https://merry-gecko-690ad7.netlify.app"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true
}));
app.use(express.json());

// ✅ 加载 CBT 语料库 JSON
let cbtData = [];
try {
    const data = fs.readFileSync("./cbt_dataset.json", "utf-8");
    cbtData = JSON.parse(data);

    // 🔍 **数据清理：移除没有 `user_input` 的条目**
    cbtData = cbtData.filter(entry => entry.user_input && typeof entry.user_input === "string");

    console.log(`✅ Loaded ${cbtData.length} valid CBT records.`);
} catch (error) {
    console.error("❌ Error loading CBT dataset:", error);
}

// ✅ **相似度匹配，确保 `user_input` 不是 undefined**
const compareSimilarity = (input, dataset) => {
    let bestMatch = null;
    let highestScore = 0.0;

    dataset.forEach(entry => {
        if (!entry.user_input) return; // 跳过无效数据
        const score = natural.JaroWinklerDistance(input.toLowerCase(), entry.user_input.toLowerCase());
        if (score > highestScore) {
            highestScore = score;
            bestMatch = entry;
        }
    });

    return { bestMatch, highestScore };
};

// **🔹 处理 Chatbot API 请求**
app.post("/chatbot", async (req, res) => {
    const { message, username } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Missing 'message' field." });
    }
    const userName = username || "dear"; 

    // **🔹 先尝试从 Knowledge Base 匹配**
    const { bestMatch, highestScore } = compareSimilarity(message, cbtData);

    let responseText = "";
    let responseSource = "";
    let cbtCategory = "N/A"; // 默认分类为空

    if (bestMatch && highestScore >= 0.90) {  // ✅ 匹配度 >= 0.90
        responseText = bestMatch.bot_response;
        responseSource = "Knowledge Base";
        cbtCategory = bestMatch.cbt_category || "N/A";  // ✅ 存储 CBT 分类
    } else {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: `You are an empathetic and supportive CBT chatbot named BloomBud. 
                        The user’s name is ${userName}. You should be warm, friendly, and encouraging. 
                        Help them challenge negative thoughts with constructive and positive guidance.` },
                    { role: "user", content: message }
                ],
                max_tokens: 30,
                temperature: 0.8,
                top_p: 0.7,
            });

            responseText = response.choices[0].message.content;
            responseSource = "GPT";
        } catch (error) {
            console.error("❌ OpenAI API use fail:", error);
            responseText = "Sorry, I'm having trouble responding right now.";
            responseSource = "Error";
        }
    }

    // **🔹 存储到 Firestore（避免重复存储）**
    try {
        const chatDocRef = await db.collection("users").doc(username).collection("negative_thoughts")
          .where("user_input", "==", message)
          .where("bot_response", "==", responseText)
          .get();
      
        if (chatDocRef.empty) { // ✅ 只有数据库里没有相同的记录时，才存储
          await db.collection("users").doc(username).collection("negative_thoughts").add({
            user_input: message,
            bot_response: responseText,
            source: responseSource,
            cbt_category: cbtCategory,  // ✅ 存储分类
            timestamp: new Date(),
          });
          console.log("✅ Response logged to Firestore.");
        } else {
          console.log("⚠️ Duplicate detected, skipping Firestore save.");
        }
      } catch (error) {
        console.error("❌ Firestore Error:", error);
      }

    res.json({ response: responseText, source: responseSource });
});

// **🔹 启动服务器**
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
