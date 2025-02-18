// src/components/LogMyBehavior.js
import React, { useState } from 'react';
import { callWitApi } from '../witApi';
import '../styles/Chat.css';

const BOT_AVATAR = '/chatbot_avatar.png';

function LogMyBehavior({ onExit }) {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "📝 **Behavioral Activation Log**\n📅 Date/Time\n🤸‍♂️ Activity\n💜 Mood Before (0-10)\n💚 Mood After (0-10)\n📒 Notes (What helped? What didn’t?)" },
    { sender: 'bot', text: "Let's reflect on your activities today! What was one activity you engaged in?" }
  ]);
  const [userInput, setUserInput] = useState('');

  const handleSend = async () => {
    if (!userInput.trim()) return;
    const userMessage = { sender: 'user', text: userInput };
    setMessages((prev) => [...prev, userMessage]);

    const witData = await callWitApi(userInput);
    console.log("Wit.ai Response:", witData);

    let reply = "Great job tracking your activity! Regular reflection can help you identify positive patterns. 🌟";

    if (witData.entities.behavior_type) {
      const activity = witData.entities.behavior_type[0].value;
      reply = `Engaging in ${activity} sounds like a productive step! How did it make you feel before and after? 💙`;
    } else if (witData.entities["wit/number"]?.length >= 2) {
      const moodBefore = witData.entities["wit/number"][0].value;
      const moodAfter = witData.entities["wit/number"][1].value;
      if (moodAfter > moodBefore) {
        reply = "It looks like this activity had a positive impact on your mood! 🌿 Keep doing what works for you!";
      } else {
        reply = "It seems this activity didn't improve your mood much. That’s okay! Maybe we can explore alternatives together? 🌱";
      }
    }

    setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    setUserInput('');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <img src={BOT_AVATAR} alt="Bot Avatar" className="chatbot-avatar" />
        <h2 className="chat-title">Log My Behavior</h2>
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
          placeholder="Log your activity here..."
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

export default LogMyBehavior;
