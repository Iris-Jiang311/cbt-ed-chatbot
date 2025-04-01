import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import axios from "axios";
import "../styles/Chat.css";

const BOT_AVATAR = "/chatbot_avatar.png";
const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5001") + "/chatbot";

function LogMyBehavior({ onExit, username, chatStyle }) {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "📝 **Behavioral Activation Log**\n📅 Date/Time\n🤸‍♂️ Activity\n💜 Mood Before (0-10)\n💚 Mood After (0-10)\n📒 Notes (What helped? What didn’t?)" },
    { sender: 'bot', text: "Let's reflect on your activities today! What was one activity you engaged in?" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!userInput.trim() || loading) return;
    setLoading(true);

    const userMessage = { sender: "user", text: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");

    try {
      const response = await axios.post(API_URL, {
        message: userInput,
        username: username || "guest@chat.com",
        chatStyle: chatStyle || "direct",
        source: "behavior_logging"
      });

      const botReply = response?.data?.response || "Thanks for sharing! 🌼";
      const botMessage = { sender: "bot", text: botReply };
      setMessages((prev) => [...prev, botMessage]);

      await addDoc(collection(db, "users", username || "guest@chat.com", "behavior_logs"), {
        user_input: userInput,
        bot_response: botReply,
        source: response.data.source || "unknown",
        sentiment_score: response.data.sentiment_score || 0,
        chat_style: response.data.current_chat_style || "direct",
        escalation_triggered: response.data.escalation_triggered || false,
        timestamp: new Date(),
      });

    } catch (error) {
      console.error("❌ API Error:", error);
      setMessages((prev) => [...prev, {
        sender: "bot",
        text: "Sorry, something went wrong. Please try again later."
      }]);
    } finally {
      setLoading(false);
    }
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
        <button onClick={handleSend} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>

      <div className="chat-footer">
        <button className="back-to-menu" onClick={onExit}>⬅️ Back</button>
      </div>
    </div>
  );
}

export default LogMyBehavior;
