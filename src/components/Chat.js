import React, { useState, useEffect, useRef } from 'react';
import ChallengeNegativeThoughts from './ChallengeNegativeThoughts';
import TrackMyMood from './TrackMyMood';
import LogMyBehavior from './LogMyBehavior';
import GetSelfCareTips from './GetSelfCareTips';
import '../styles/Chat.css';

const BOT_AVATAR = '/chatbot_avatar.png';

function Chat({ userEmail, chatStyle }) {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [currentView, setCurrentView] = useState('chat'); // ✅ 控制当前显示的组件
  const messagesEndRef = useRef(null);

  useEffect(() => {
    console.log("Chat loaded with user:", userEmail);
    let greeting = userEmail? "Hello!" : `Hello, ${userEmail}!`; // ✅ 访客模式只显示 "Hello!"

    setMessages([
      {
        sender: "bot",
        text: `${greeting} What would you like to do today?\n1️⃣ Challenge Negative Thoughts\n2️⃣ Track My Mood\n3️⃣ Log My Behavior\n4️⃣ Get Self-Care Tips`,
      }
    ]);
  }, [userEmail]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (!userInput.trim()) return;

    const input = userInput.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: input }]);
    setUserInput('');

    // **🚀 解析用户输入**
    switch (input) {
      case '1':
        setCurrentView('challengeNegativeThoughts');
        break;
      case '2':
        setCurrentView('trackMyMood');
        break;
      case '3':
        setCurrentView('logMyBehavior');
        break;
      case '4':
        setCurrentView('getSelfCareTips');
        break;
      default:
        setMessages((prev) => [...prev, { sender: 'bot', text: "Please enter a valid option (1-4)." }]);
    }
  };

  // **🌱 渲染不同的界面**
  if (currentView === 'challengeNegativeThoughts') {
    return  <ChallengeNegativeThoughts username={userEmail} chatStyle={chatStyle} onExit={() => setCurrentView('chat')} />;
  }
  if (currentView === 'trackMyMood') {
    return <TrackMyMood username={userEmail} chatStyle={chatStyle} onExit={() => setCurrentView('chat')} />;
  }
  if (currentView === 'logMyBehavior') {
    return <LogMyBehavior username={userEmail} chatStyle={chatStyle} onExit={() => setCurrentView('chat')} />;
  }
  if (currentView === 'getSelfCareTips') {
    return <GetSelfCareTips username={userEmail} chatStyle={chatStyle} onExit={() => setCurrentView('chat')} />;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <img src={BOT_AVATAR} alt="BloomBud Avatar" className="chatbot-avatar" />
        <h2>BloomBud Chatbot</h2>
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
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-container">
        <input type="text" placeholder="Type your message..." value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default Chat;