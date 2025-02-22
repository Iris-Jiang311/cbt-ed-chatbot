// src/components/GetSelfCareTips.js
import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Chat.css';
import keywordsToCategory from '../keywordsToCategory.json';
import cbtSuggestions from '../cbt_suggestions.json';

const BOT_AVATAR = '/chatbot_avatar.png';
const API_URL = process.env.REACT_APP_API_URL + "/chatbot"; // ✅ 通过环境变量设置 API

function GetSelfCareTips({ onExit }) {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "💚 Self-care is essential! Could you share what’s been on your mind lately? What's something that’s been bothering you?" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to find category from keywords
  const findCategory = (text) => {
    for (const [category, keywords] of Object.entries(keywordsToCategory)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
        return category;
      }
    }
    return null;
  };

  // Function to call chatbot API
  const fetchChatbotResponse = async (message) => {
    try {
      const response = await axios.post(API_URL, { message });

      if (response.data.response) {
        return response.data.response;
      } else {
        throw new Error("Invalid API response");
      }
    } catch (error) {
      console.error("❌ Error fetching chatbot response:", error);
      return "Sorry, I'm having trouble responding right now. 💙";
    }
  };

  // Handle user message submission
  const handleSend = async () => {
    if (!userInput.trim() || loading) return;

    setLoading(true);

    const userMessage = { sender: 'user', text: userInput };
    setMessages((prev) => [...prev, userMessage]);

    let selectedTip;
    const category = findCategory(userInput);

    if (category && cbtSuggestions[category]) {
      // Randomly select a suggestion from the category
      selectedTip = cbtSuggestions[category][Math.floor(Math.random() * cbtSuggestions[category].length)];
    } else {
      // Call backend API if no category match
      selectedTip = await fetchChatbotResponse(userInput);
    }

    setMessages((prev) => [...prev, { sender: 'bot', text: selectedTip }]);
    setUserInput('');
    setLoading(false);
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
