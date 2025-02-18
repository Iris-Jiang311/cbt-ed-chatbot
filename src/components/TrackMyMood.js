// src/components/TrackMyMood.js
import React, { useState } from 'react';
import { callWitApi } from '../witApi';
import '../styles/Chat.css';

const BOT_AVATAR = '/chatbot_avatar.png';

function TrackMyMood({ onExit }) {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Let's create a simple Mood Tracker tailored for you. Here’s a format you can use daily:" },
    { sender: 'bot', text: "🌱 **Mood Tracker Template** 🌱\n📅 Date:\n⏰ Time of Entry:\n\n1️⃣ Mood Rating (0-10) 🎭 (0 = worst, 10 = best)\n2️⃣ Feelings & Emotions (e.g., happy, anxious, frustrated)\n3️⃣ What Happened Today? (Key events, thoughts, or triggers)\n4️⃣ Physical Symptoms (e.g., tired, headaches, tense)\n5️⃣ Activities & Interactions (What did you do? Who did you see?)" },
    { sender: 'bot', text: "Go ahead! Share your mood entry below. 😊" }
  ]);
  const [userInput, setUserInput] = useState('');

  const handleSend = async () => {
    if (!userInput.trim()) return;
    const userMessage = { sender: 'user', text: userInput };
    setMessages((prev) => [...prev, userMessage]);

    const witData = await callWitApi(userInput);
    console.log("Wit.ai Response:", witData);

    let reply = "Thank you for tracking your mood! Noting down your emotions is a great step towards self-awareness. 🌿";
    
    if (witData.entities["wit/number"]) {
      const moodScore = witData.entities["wit/number"][0].value;
      if (moodScore <= 3) {
        reply = "I'm here for you. 💙 It seems like you're feeling low. Would you like to try a calming exercise or self-care tip?";
      } else if (moodScore >= 8) {
        reply = "That's great! 🎉 It looks like you're having a good day. Keep doing what works for you!";
      } else {
        reply = "Noted! Your mood is somewhere in the middle. Would you like to explore what contributed to this feeling today?";
      }
    } else if (witData.entities.emotion_type) {
      reply = `I see that you're feeling ${witData.entities.emotion_type[0].value}. Would you like to talk more about what led to this emotion? 🌼`;
    }

    setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    setUserInput('');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <img src={BOT_AVATAR} alt="Bot Avatar" className="chatbot-avatar" />
        <h2 className="chat-title">Track My Mood</h2>
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
          placeholder="Type your mood entry..."
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

export default TrackMyMood;
