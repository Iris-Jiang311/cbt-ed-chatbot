// src/components/ChallengeNegativeThoughts.js
import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import "../styles/Chat.css";

const BOT_AVATAR = "/chatbot_avatar.png";
const API_URL = "https://cbt-ed-chatbot.onrender.com/chatbot";  // 连接 Express API

function ChallengeNegativeThoughts({ onExit }) {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Great choice! 🌱 Let's challenge those negative thoughts together." },
    { sender: "bot", text: "Negative thoughts can feel overwhelming, but they are often based on distortions rather than reality. Let's work through one together!" },
    { sender: "bot", text: "Could you share a recent negative thought that bothered you?" }
  ]);
  const [userInput, setUserInput] = useState("");

  const handleSend = async () => {
    if (!userInput.trim()) return;
    
    const userMessage = { sender: "user", text: userInput };
    setMessages((prev) => [...prev, userMessage]);

    // **存储用户消息到 Firebase**
    try {
      await addDoc(collection(db, "negative_thoughts"), {
        message: userInput,
        timestamp: new Date(),
      });
      console.log("✅ Negative thought logged to Firestore.");
    } catch (error) {
      console.error("❌ Firestore Error:", error);
    }

    // **调用 AI 生成回复**
    let reply = "That's a tough thought to deal with. Let's work through it together. 💙";
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }),
      });

      const data = await response.json();
      if (data.response) {
        reply = data.response;
      }
    } catch (error) {
      console.error("❌ Server Error:", error);
      reply = "Sorry, I'm having trouble responding right now. 💙";
    }

    setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    setUserInput("");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <img src={BOT_AVATAR} alt="Bot Avatar" className="chatbot-avatar" />
        <h2 className="chat-title">Challenge Negative Thoughts</h2>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message-row ${msg.sender === "bot" ? "bot" : "user"}`}>
            {msg.sender === "bot" && <img src={BOT_AVATAR} alt="Bot" className="avatar bot-avatar" />}
            <div className={`message-bubble ${msg.sender === "bot" ? "bot-bubble" : "user-bubble"}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          placeholder="Type your response..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
      <div className="chat-footer">
        <button className="back-to-menu" onClick={onExit}>⬅️</button>
      </div>
    </div>
  );
}

export default ChallengeNegativeThoughts;