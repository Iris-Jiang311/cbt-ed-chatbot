const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json()); // 解析 JSON 请求体

// 读取 CBT 数据集
const datasetPath = __dirname + "/cbt_dataset.json";  // 确保路径正确
console.log("Loading dataset from:", datasetPath);

let cbtData = [];

try {
    const fileContent = fs.readFileSync(datasetPath, "utf8");
    console.log("File content loaded successfully.");
    cbtData = JSON.parse(fileContent);

    // 确保 cbtData 是数组
    if (!Array.isArray(cbtData)) {
        throw new Error("Expected an array but got an object. Ensure JSON format is correct.");
    }

    console.log("Dataset loaded successfully:", cbtData.length, "entries found.");
} catch (error) {
    console.error("❌ Error loading CBT dataset:", error);
}

// Hugging Face API Key（请替换为你的 API Key）
const HF_API_KEY = "hf_";
const HF_MODEL_URL = "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill";

// 1️⃣ 查找 JSON 语料库中的最佳匹配
function findBestMatch(userInput) {
    if (!cbtData || cbtData.length === 0) {
        console.error("❌ CBT dataset is empty or undefined.");
        return null;
    }

    const bestMatch = cbtData.find(q => 
        q.user_input && userInput.toLowerCase().includes(q.user_input.toLowerCase())
    );

    return bestMatch ? bestMatch.bot_response : null;
}

// 2️⃣ 调用 Hugging Face LLM 生成回复
async function generateResponse(userInput) {
    try {
        const response = await axios.post(
            HF_MODEL_URL,
            { inputs: userInput },
            {
                headers: { Authorization: `Bearer ${HF_API_KEY}` },
                timeout: 10000 // 设置 10 秒超时
            }
        );

        console.log("Hugging Face Response:", response.data);

        if (Array.isArray(response.data) && response.data.length > 0) {
            return response.data[0].generated_text || "I'm here to support you! 😊";
        }

        return "I didn't quite understand. Could you rephrase that?";
    } catch (error) {
        console.error("❌ Error calling Hugging Face API:", error);
        return "Sorry, I'm having trouble responding right now.";
    }
}

// 3️⃣ 处理用户输入
app.post("/chatbot", async (req, res) => {
    const userInput = req.body.message;

    if (!userInput) {
        return res.status(400).json({ error: "Missing 'message' field in request body." });
    }

    console.log("User input:", userInput);

    // 先匹配 JSON 语料库
    const cbtReply = findBestMatch(userInput);
    
    // 如果 JSON 里没有匹配，则调用 Hugging Face 生成
    const response = cbtReply || await generateResponse(userInput);

    res.json({ response });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
