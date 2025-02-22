// src/components/TrackMyMood.js
import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import axios from "axios";
import "../styles/Chat.css";

const BOT_AVATAR = "/chatbot_avatar.png";

function TrackMyMood({ onExit }) {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "📝 **Behavioral Activation Log**\n📅 Date/Time\n🤸‍♂️ Activity\n💜 Mood Before (0-10)\n💚 Mood After (0-10)\n📒 Notes (What helped? What didn’t?)" },
    { sender: 'bot', text: "Let's reflect on your activities today! What was one activity you engaged in?" }
  ]);
  const [userInput, setUserInput] = useState("");

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const userMessage = { sender: "user", text: userInput };
    setMessages((prev) => [...prev, userMessage]);

    // **存储数据到 Firestore**
    try {
      await addDoc(collection(db, "behavior_logs"), {
        moodEntry: userInput,
        timestamp: new Date(),
      });
      console.log("✅ behavior_logs entry logged to Firestore.");
    } catch (error) {
      console.error("❌ Firestore Error:", error);
    }

    // **调用 `server.js` 处理 AI 生成回复**
    let reply = "Great job tracking your activity! Regular reflection can help you identify positive patterns. 🌟";
    try {
      const response = await axios.post("https://cbt-ed-chatbot.onrender.com/chatbot", {
        message: userInput,
      });

      if (response.data.response) {
        reply = response.data.response;
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
        <h2 className="chat-title">Log My Behavior</h2>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message-row ${msg.sender === "bot" ? "bot" : "user"}`}>
            {msg.sender === "bot" && <img src={BOT_AVATAR} alt="Bot" className="avatar bot-avatar" />}
            <div className={`message-bubble ${msg.sender === "bot" ? "bot-bubble" : "user-bubble"}`}>
              {msg.text.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
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
        />
        <button onClick={handleSend}>Send</button>
      </div>
      <div className="chat-footer">
        <button className="back-to-menu" onClick={onExit}>⬅️</button>
      </div>
    </div>
  );
}

export default TrackMyMood;
