// src/components/Chat.js
import React, { useState,useEffect,useRef } from 'react';
import { callWitApi } from '../witApi'; // 引入我们写好的 Wit.ai 调用封装
import '../styles/Chat.css';
// 引入 Chat 组件的 CSS

// 这里假设你的图片放在 public/chatbot_avatar.png
// 如果放在 src/assets，则可以 import chatbotAvatar from '../assets/chatbot_avatar.png'
const BOT_AVATAR = '/chatbot_avatar.png';
const conversationPrompts = [ "Can you share more about what made you choose that option?😊", "How does that thought affect your day-to-day feelings?💙", "What do you think could help you challenge that negative thought?💙", "Reflecting on your feelings, what might be a more balanced perspective?❤️", "How do you usually cope when these thoughts arise💛?", "What small step could you take today to feel better💛?", "If you could change one thing about your daily routine, what would it be?💙", "How do you envision your personal growth over the next few weeks😊?", "Is there anything else you'd like to share about how you're feeling😊", "Thank you for opening up. Would you like to continue discussing or try a self-care tip?" ];

function Chat() {
 const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  // conversationStep: 0 表示初始阶段，>=1 表示深度对话阶段的轮次
  const [conversationStep, setConversationStep] = useState(0);
  // 保存用户初始选择的功能选项（1～4）
  const [userChoice, setUserChoice] = useState(null);
//   用于滚动到底部
    const messagesEndRef = useRef(null);
    

    useEffect(() => {
        if (userChoice !== null) {
          console.log('User choice updated:', userChoice);
        }
      }, [userChoice]);
      
  // 组件挂载时，自动显示欢迎问候信息
  useEffect(() => {
    const welcomeMessage = `😊🌱Welcome to BloomBud, Your Personal Growth Garden!
I'm your digital companion, here to help you. What would you like to do today?
Please type a number:
1️⃣ Challenge Negative Thoughts  
2️⃣ Track My Mood  
3️⃣ Log My Behavior  
4️⃣ Get Self-Care Tips`;
    setMessages([{ sender: 'bot', text: welcomeMessage }]);
  }, []);
  // 每次 messages 变化后，让聊天区滚动到底部（兼容手机端）
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    // 将用户输入加入聊天记录
    let newMessages = [...messages, { sender: 'user', text: userInput }];
    setMessages(newMessages);

     // 2) 调用 Wit.ai API 获取意图/实体/traits（如有需要）
     const witData = await callWitApi(userInput);
     console.log('Wit.ai response:', witData);
 
     // 3) 分析 Wit.ai 的结果（可根据实际需求进行更多逻辑）
     const { intents = [], entities = {}, traits = {} } = witData;
     console.log('Entities:', entities);
     console.log('Traits:', traits);
     let topIntent = null;
     if (intents.length > 0) {
       topIntent = intents[0].name; // 最可能的意图名称
       console.log('Top intent:', topIntent);
     }

    // 初始阶段：等待用户输入1～4选项
    if (conversationStep === 0) {
      const choice = parseInt(userInput.trim(), 10);
      if ([1, 2, 3, 4].includes(choice)) {
        setUserChoice(choice);
        const reply = "Great! Let's begin our conversation. " + conversationPrompts[0];
        newMessages = [...newMessages, { sender: 'bot', text: reply }];
        setMessages(newMessages);
        setConversationStep(1);
      } else {
        newMessages = [...newMessages, { sender: 'bot', text: "Please enter a valid number between 1 and 4." }];
        setMessages(newMessages);
        setConversationStep(1);
      }
    } else {
      // 深入对话阶段：可结合 Wit.ai 返回数据调整回复（此处示例直接使用预设提示）
      let reply = "";
      if (conversationStep < conversationPrompts.length) {
        reply = conversationPrompts[conversationStep];
        setConversationStep(conversationStep + 1);
      } else {
        reply = "Our session has reached a natural pause. If you'd like to continue or start over, just let me know!";
        setConversationStep(0);
      }
      newMessages = [...newMessages, { sender: 'bot', text: reply }];
      setMessages(newMessages);
    }
    setUserInput('');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <img src={BOT_AVATAR} alt="BloomBud Avatar" className="chatbot-avatar" />
        <h2 className="chat-title">BloomBud Chatbot</h2>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message-row ${msg.sender === 'bot' ? 'bot' : 'user'}`}>
            {msg.sender === 'bot' && (
              <img src={BOT_AVATAR} alt="Bot" className="avatar bot-avatar" />
            )}
            <div className={`message-bubble ${msg.sender === 'bot' ? 'bot-bubble' : 'user-bubble'}`}>
              {msg.text.split("\n").map((line, i) => <p key={i}>{line}</p>)}
            </div>
          </div>
        ))}
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          placeholder="Type your message..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default Chat;