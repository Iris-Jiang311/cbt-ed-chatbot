import React, { useState } from "react";
import axios from "axios";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import "../styles/Chat.css";

const BOT_AVATAR = "/chatbot_avatar.png";

function ChallengeNegativeThoughts({ onExit, username }) {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Great choice! 🌱 Let's challenge those negative thoughts together." },
    { sender: "bot", text: "Negative thoughts can feel overwhelming, but they are often based on distortions rather than reality. Let's work through one together!" },
    { sender: "bot", text: "Could you share a recent negative thought that bothered you?" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!userInput.trim() || loading) return; // ✅ 防止重复提交
    setLoading(true);
  
    const userMessage = { sender: "user", text: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");
  
    try {
      const response = await axios.post("http://localhost:5001/chatbot", {
        message: userInput,
        username: username || "guest",
      });
  
      const botReply = response.data.response;
      const botMessage = { sender: "bot", text: botReply };
      setMessages((prev) => [...prev, botMessage]);
  
      // ✅ 只执行一次 `addDoc()` 存储到 Firebase
      await addDoc(collection(db, "users", username, "negative_thoughts"), {
        user_input: userInput,
        bot_response: botReply,
        source: response.data.source,
        timestamp: new Date(),
      });
  
    } catch (error) {
      console.error("❌ API Error:", error);
      setMessages((prev) => [...prev, { sender: "bot", text: "Sorry, something went wrong. Please try again later." }]);
    } finally {
      setLoading(false);
    }
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
        <input type="text" placeholder="Type your response..." value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} />
        <button onClick={handleSend} disabled={loading}>Send</button>
      </div>
      <div className="chat-footer">
        <button className="back-to-menu" onClick={onExit}>⬅️ Back</button>
      </div>
    </div>
  );
}

export default ChallengeNegativeThoughts;