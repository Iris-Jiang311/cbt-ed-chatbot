import React, { useState } from 'react';
import axios from 'axios';
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import keywordsToCategory from '../keywordsToCategory.json';
import cbtSuggestions from '../cbt_suggestions.json';
import '../styles/Chat.css';

const BOT_AVATAR = '/chatbot_avatar.png';
const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5001") + "/chatbot";

function GetSelfCareTips({ onExit, username, chatStyle }) {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "💚 Self-care is essential! Could you share what’s been on your mind lately? What's something that’s been bothering you?" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Match input with category
  const findCategory = (text) => {
    for (const [category, keywords] of Object.entries(keywordsToCategory)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
        return category;
      }
    }
    return null;
  };

  const handleSend = async () => {
    if (!userInput.trim() || loading) return;
    setLoading(true);

    const userMessage = { sender: 'user', text: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');

    try {
      const category = findCategory(userInput);
      let botReply = "";
      let replySource = "";

      if (category && cbtSuggestions[category]) {
        botReply = cbtSuggestions[category][Math.floor(Math.random() * cbtSuggestions[category].length)];
        replySource = "Suggestion Bank";
      } else {
        // Fallback to backend GPT
        const response = await axios.post(API_URL, {
          message: userInput,
          username: username || "guest@chat.com",
          chatStyle: chatStyle || "direct",
          source: "self_care"
        });

        botReply = response?.data?.response || "Thank you for sharing. I'm here for you.";
        replySource = response?.data?.source || "GPT";

        // ✅ Log to Firestore
        await addDoc(collection(db, "users", username || "guest@chat.com", "selfcare_logs"), {
          user_input: userInput,
          bot_response: botReply,
          source: replySource,
          sentiment_score: response.data.sentiment_score || 0,
          chat_style: response.data.current_chat_style || chatStyle || "direct",
          escalation_triggered: response.data.escalation_triggered || false,
          timestamp: new Date()
        });
      }

      const botMessage = { sender: "bot", text: botReply };
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error("❌ Error handling self-care request:", error);
      setMessages((prev) => [...prev, {
        sender: 'bot',
        text: "Sorry, something went wrong. Please try again later. 💙"
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <img src={BOT_AVATAR} alt="Bot Avatar" className="chatbot-avatar" />
        <h2 className="chat-title">Get Self-Care Tips</h2>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message-row ${msg.sender === 'bot' ? 'bot' : 'user'}`}>
            {msg.sender === 'bot' && <img src={BOT_AVATAR} alt="Bot" className="avatar bot-avatar" />}
            <div className={`message-bubble ${msg.sender === 'bot' ? 'bot-bubble' : 'user-bubble'}`}>
              {msg.text.split("\n").map((line, i) => <p key={i}>{line}</p>)}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          placeholder="Tell me what's on your mind..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
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

export default GetSelfCareTips;
