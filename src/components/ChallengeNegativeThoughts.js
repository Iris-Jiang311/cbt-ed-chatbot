// src/components/ChallengeNegativeThoughts.js
import React, { useState } from 'react';
import { callWitApi } from '../witApi';
import '../styles/Chat.css'; // 确保样式生效

const BOT_AVATAR = '/chatbot_avatar.png';

function ChallengeNegativeThoughts({ onExit }) {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Great choice! 🌱 Let's challenge those negative thoughts together." },
    { sender: 'bot', text: "Negative thoughts can feel overwhelming, but they are often based on distortions rather than reality. Let's work through one together!" },
    { sender: 'bot', text: "Could you share a recent negative thought that bothered you?" }
  ]);
  const [userInput, setUserInput] = useState('');

  const handleSend = async () => {
    if (!userInput.trim()) return;
    const userMessage = { sender: 'user', text: userInput };
    setMessages((prev) => [...prev, userMessage]);

    const witData = await callWitApi(userInput);
    console.log("Wit.ai Response:", witData);

    let reply = "That sounds really difficult. Let's analyze it together.";
    if (witData.entities.emotion_type) {
      reply = `I see that you're feeling ${witData.entities.emotion_type[0].value}. Let's explore what might be causing it.`;
    }

    setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    setUserInput('');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <img src={BOT_AVATAR} alt="Bot Avatar" className="chatbot-avatar" />
        <h2 className="chat-title">Challenge Negative Thoughts</h2>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message-row ${msg.sender === 'bot' ? 'bot' : 'user'}`}>
            {msg.sender === 'bot' && <img src={BOT_AVATAR} alt="Bot" className="avatar bot-avatar" />}
            <div className={`message-bubble ${msg.sender === 'bot' ? 'bot-bubble' : 'user-bubble'}`}>
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
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
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
