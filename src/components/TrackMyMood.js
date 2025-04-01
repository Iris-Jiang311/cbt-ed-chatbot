import React, { useState } from "react";
import axios from "axios";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import "../styles/Chat.css";

const BOT_AVATAR = "/chatbot_avatar.png";
const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5001") + "/chatbot";

function TrackMyMood({ onExit, username, chatStyle }) {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Let's create a simple Mood Tracker tailored for you. Here’s a format you can use daily:" },
    { sender: "bot", text: "🌱 **Mood Tracker Template** 🌱\n📅 Date:\n⏰ Time of Entry:\n\n1️⃣ Mood Rating (0-10) 🎭 (0 = worst, 10 = best)\n2️⃣ Feelings & Emotions (e.g., happy, anxious, frustrated)\n3️⃣ What Happened Today? (Key events, thoughts, or triggers)\n4️⃣ Physical Symptoms (e.g., tired, headaches, tense)\n5️⃣ Activities & Interactions (What did you do? Who did you see?)" },
    { sender: "bot", text: "Go ahead! Share your mood entry below. 😊" }
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
        source: "mood_tracking"
      });

      const botReply = response.data.response;
      const botMessage = { sender: "bot", text: botReply };
      setMessages((prev) => [...prev, botMessage]);

      // ✅ Store mood entry (sentiment, response, etc.)
      await addDoc(collection(db, "users", username || "guest@chat.com", "mood_entries"), {
        user_input: userInput,
        bot_response: botReply,
        source: response.data.source,
        sentiment_score: response.data.sentiment_score,
        chat_style: response.data.current_chat_style,
        escalation_triggered: response.data.escalation_triggered,
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
        <h2 className="chat-title">Track My Mood</h2>
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
          placeholder="Type your mood entry..."
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

export default TrackMyMood;
