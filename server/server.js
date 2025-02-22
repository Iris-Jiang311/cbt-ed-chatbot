require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 5001; // ✅ 让 Render 自动分配端口

// ✅ 允许 Netlify 访问后端
app.use(cors({
    origin: "https://merry-gecko-690ad7.netlify.app", // 替换为你的 Netlify 前端地址
    methods: ["POST"],
    allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// **🔹 1. 配置 OpenAI API**
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ✅ 从环境变量中读取 API Key
});

// **🔹 2. 处理 Chatbot API 请求**
app.post("/chatbot", async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Missing 'message' field." });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are an empathetic therapist chatbot specializing in CBT. Avoid starting responses with 'It sounds like.' Here are examples of how to respond:\n- 'I hear that...'\n- 'You seem to be experiencing...'\n- 'That must feel overwhelming...'\n- 'I can see why you'd feel this way...'\nYour task is to keep responses under 20 tokens and emotionally supportive." },
                { role: "user", content: message }
            ],
            max_tokens: 20,
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
