// src/components/TrackMyMood.js
import React, { useState } from 'react';
import axios from 'axios';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig"; // 引入 Firebase 配置
import '../styles/Chat.css';

const BOT_AVATAR = '/chatbot_avatar.png';
const API_URL = process.env.REACT_APP_API_URL + "/chatbot"; // ✅ 使用环境变量

function TrackMyMood({ onExit }) {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Let's create a simple Mood Tracker tailored for you. Here’s a format you can use daily:" },
    { sender: 'bot', text: "🌱 **Mood Tracker Template** 🌱\n📅 Date:\n⏰ Time of Entry:\n\n1️⃣ Mood Rating (0-10) 🎭 (0 = worst, 10 = best)\n2️⃣ Feelings & Emotions (e.g., happy, anxious, frustrated)\n3️⃣ What Happened Today? (Key events, thoughts, or triggers)\n4️⃣ Physical Symptoms (e.g., tired, headaches, tense)\n5️⃣ Activities & Interactions (What did you do? Who did you see?)" },
    { sender: 'bot', text: "Go ahead! Share your mood entry below. 😊" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to send user input to the server API
  const fetchChatbotResponse = async (message) => {
    try {
      const response = await axios.post(API_URL, { message });
      return response.data.response;
    } catch (error) {
      console.error("❌ Error fetching chatbot response:", error);
      return "Sorry, I couldn't generate a response at the moment.";
    }
  };

  // Handle user message submission
  const handleSend = async () => {
    if (!userInput.trim() || loading) return;

    setLoading(true);

    // Save user message
    const userMessage = { sender: 'user', text: userInput };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Store mood entry in Firebase Firestore
      const docRef = await addDoc(collection(db, "mood_entries"), {
        moodText: userInput,
        timestamp: serverTimestamp()
      });
      console.log("📌 Mood entry saved in Firestore with ID:", docRef.id);

      // Call backend API for chatbot response
      const botResponse = await fetchChatbotResponse(userInput);
      setMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);

    } catch (error) {
      console.error("❌ Error saving mood entry:", error);
      setMessages((prev) => [...prev, { sender: 'bot', text: "Oops! Something went wrong. Try again later." }]);
    }

    setUserInput('');
    setLoading(false);
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

export default TrackMyMood;
