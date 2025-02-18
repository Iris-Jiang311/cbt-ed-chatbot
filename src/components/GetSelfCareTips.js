// src/components/GetSelfCareTips.js
import React, { useState } from 'react';
import { callWitApi } from '../witApi';
import '../styles/Chat.css';

const BOT_AVATAR = '/chatbot_avatar.png';

function GetSelfCareTips({ onExit }) {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "💚 Self-care is essential! Could you share what’s been on your mind lately? What's something that’s been bothering you?" }
  ]);
  const [userInput, setUserInput] = useState('');

  // CBT-Based 建议分类
  const cbtTips = {
    relaxation: [
      "Try 4-7-8 breathing: inhale for 4s, hold for 7s, and exhale for 8s. 🌬️",
      "Practice mindfulness meditation for 5 minutes. Focus on the present moment. 🧘",
      "Engage in progressive muscle relaxation to release tension in your body. 💆"
    ],
    routine: [
      "Keep a consistent sleep schedule to regulate your energy levels. 💤",
      "Plan your meals to nourish your body regularly and avoid extreme hunger. 🍏",
      "Set a simple daily goal like going for a 10-minute walk. 🚶‍♂️"
    ],
    challenge_negative_thoughts: [
      "When a negative thought arises, ask yourself: Is this thought based on facts or just emotions? 🤔",
      "Write down an unhelpful thought and try to reframe it with a more balanced perspective. 📝",
      "Instead of 'I’m failing,' try 'I’m learning and improving at my own pace.' 🌱"
    ],
    pleasant_activities: [
      "Do something small that brings you joy—like listening to your favorite song. 🎶",
      "Schedule a fun activity this week, like visiting a park or trying a new hobby. 🎨",
      "Think of three things that made you smile today. 😊"
    ],
    social_support: [
      "Reach out to a friend and share how you’re feeling. Connection matters. 🤝",
      "Join an online support group where you can talk to others with similar experiences. 💬",
      "Plan a simple social interaction, like texting someone you trust. 📱"
    ],
    self_compassion: [
      "Treat yourself with the same kindness you'd offer a friend. 💖",
      "Write a short note of encouragement to yourself. 📝",
      "It's okay to struggle. Acknowledge your feelings and remind yourself you're doing your best. 🌿"
    ]
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const userMessage = { sender: 'user', text: userInput };
    setMessages((prev) => [...prev, userMessage]);

    const witData = await callWitApi(userInput);
    console.log("Wit.ai Response:", witData);

    let selectedTip = "Taking care of yourself is important! Would you like to try a relaxation exercise or set a small goal for today? 🌿";
    
    if (witData.entities.emotion_type) {
      const emotion = witData.entities.emotion_type[0].value;
      if (emotion === "anxious" || emotion === "stressed") {
        selectedTip = cbtTips.relaxation[Math.floor(Math.random() * cbtTips.relaxation.length)];
      } else if (emotion === "guilty" || emotion === "ashamed") {
        selectedTip = cbtTips.self_compassion[Math.floor(Math.random() * cbtTips.self_compassion.length)];
      }
    } else if (witData.entities.behavior_type) {
      selectedTip = cbtTips.routine[Math.floor(Math.random() * cbtTips.routine.length)];
    } else if (witData.entities.body_part) {
      selectedTip = cbtTips.challenge_negative_thoughts[Math.floor(Math.random() * cbtTips.challenge_negative_thoughts.length)];
    }

    setMessages((prev) => [...prev, { sender: 'bot', text: selectedTip }]);
    setUserInput('');
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
        />
        <button onClick={handleSend}>Send</button>
      </div>
      <div className="chat-footer">
        <button className="back-to-menu" onClick={onExit}>🔙</button>
      </div>
    </div>
  );
}

export default GetSelfCareTips;
