require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// **🔹 1. 配置 OpenAI API**
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 读取 .env 中的 API Key
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
            max_tokens: 20, // 限制最多 30 tokens
            temperature: 0.8, // 保持一定创造性
            top_p: 0.7, // 保持一定多样性
        });

        res.json({ response: response.choices[0].message.content });

    } catch (error) {
        console.error("❌ OpenAI API 调用失败:", error);
        res.status(500).json({ error: "Sorry, I'm having trouble responding right now." });
    }
});

// **🔹 3. 启动服务器**
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
