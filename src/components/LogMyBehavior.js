// src/components/LogMyBehavior.js
import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import axios from "axios";
import "../styles/Chat.css";

const BOT_AVATAR = "/chatbot_avatar.png";
const API_URL = process.env.REACT_APP_API_URL + "/chatbot"; // ✅ 通过环境变量设置 API

function LogMyBehavior({ onExit }) {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "📝 **Behavioral Activation Log**\n📅 Date/Time\n🤸‍♂️ Activity\n💜 Mood Before (0-10)\n💚 Mood After (0-10)\n📒 Notes (What helped? What didn’t?)" },
    { sender: 'bot', text: "Let's reflect on your activities today! What was one activity you engaged in?" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!userInput.trim() || loading) return; // 防止空输入或重复提交

    setLoading(true);

    const userMessage = { sender: "user", text: userInput };
    setMessages((prev) => [...prev, userMessage]);

    // **存储数据到 Firestore**
    try {
      const docRef = await addDoc(collection(db, "behavior_logs"), {
        moodEntry: userInput,
        timestamp: serverTimestamp(), // ✅ 使用 Firebase 服务器时间
      });
      console.log("📌 behavior_logs entry saved:", docRef.id);
    } catch (error) {
      console.error("❌ Firestore Error:", error);
    }

    // **调用后端 API 生成 AI 反馈**
    let reply = "Great job tracking your activity! Regular reflection can help you identify positive patterns. 🌟";
    try {
      const response = await axios.post(API_URL, { message: userInput });

      if (response.data.response) {
        reply = response.data.response;
      }
    } catch (error) {
      console.error("❌ Server Error:", error);
      reply = "Sorry, I'm having trouble responding right now. 💙";
    }

    setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    setUserInput("");
    setLoading(false);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <img src={BOT_AVATAR} alt="Bot Avatar" className="chatbot-avatar" />
        <h2 className="chat-title">Log My Behavior</h2>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message-row ${msg.sender === "bot" ? "bot" : "user"}`}>
            {msg.sender === "bot" && <img src={BOT_AVATAR} alt="Bot" className="avatar bot-avatar" />}
            <div className={`message-bubble ${msg.sender === "bot" ? "bot-bubble" : "user-bubble"}`}>
              {msg.text.split("\n").map((line, i) => <p key={i}>{line}</p>)}
            </div>
          </div>
        ))}
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          placeholder="Log your activity here..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading}>{loading ? "..." : "Send"}</button>
      </div>
      <div className="chat-footer">
        <button className="back-to-menu" onClick={onExit}>⬅️</button>
      </div>
    </div>
  );
}

export default LogMyBehavior;
