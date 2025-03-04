require("dotenv").config();
const express = require("express");
// const axios = require("axios");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 5001; // ✅ 让 Render 自动分配端口
console.log("🔍 Checking OpenAI API Key:", process.env.OPENAI_API_KEY ? "✅ Loaded" : "❌ Missing");

// // ✅ 允许 Netlify 访问后端
// app.use(cors({
//     // origin: "https://merry-gecko-690ad7.netlify.app", // 替换为你的 Netlify 前端地址
//     origin: "http://localhost:3000",  
//     methods: ["POST"],
//     allowedHeaders: ["Content-Type"]
// }));


app.use(cors({
    origin: ["http://localhost:3000", "https://merry-gecko-690ad7.netlify.app"], // ✅ 允许本地开发 & 部署地址
    methods: ["GET", "POST", "OPTIONS"], // ✅ 确保 OPTIONS 请求也被允许
    allowedHeaders: ["Content-Type"],
    credentials: true // ✅ 如果有身份验证，启用 credentials
}));
app.options("*", cors()); 

app.use(express.json());

// **🔹 1. 配置 OpenAI API**
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ✅ 从环境变量中读取 API Key
});



// **🔹 2. 处理 Chatbot API 请求**
app.post("/chatbot", async (req, res) => {
    const { message, name } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Missing 'message' field." });
    }
    const userName = name || "dear"; 

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: `You are an empathetic and supportive CBT (Cognitive Behavioral Therapy) chatbot named BloomBud. 
                    The user’s name is ${userName}. You should be warm, friendly, and encouraging, like a supportive friend. 
                    Address them by their name often. Help them challenge negative thoughts with constructive and positive guidance.
                    
                    🌱 **TONE**: Kind, warm, supportive, and human-like.
                    🚀 **AVOID**: Being overly clinical, robotic, or distant.
                    ` },
                { role: "user", content: message }
            ],
            max_tokens: 30,
            temperature: 0.8,
            top_p: 0.7,
        });

        res.json({ response: response.choices[0].message.content });

    } catch (error) {
        console.error("❌ OpenAI API use fail:", error);
        res.status(500).json({ error: "Sorry, I'm having trouble responding right now." });
    }
});

// **🔹 3. 启动服务器**
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});