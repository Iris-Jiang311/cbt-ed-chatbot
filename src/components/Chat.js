// // src/components/Chat.js
// import React, { useState, useEffect, useRef } from 'react';
// import ChallengeNegativeThoughts from './ChallengeNegativeThoughts';
// import TrackMyMood from './TrackMyMood';
// import LogMyBehavior from './LogMyBehavior';
// import GetSelfCareTips from './GetSelfCareTips';

// import '../styles/Chat.css';

// const BOT_AVATAR = '/chatbot_avatar.png';

// function Chat() {
//   const [messages, setMessages] = useState([]);
//   const [userInput, setUserInput] = useState('');
//   const [userChoice, setUserChoice] = useState(null); // 记录用户选择的功能
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     // 进入聊天界面时，显示欢迎消息
//     const welcomeMessage = `😊🌱Welcome to BloomBud, Your Personal Growth Garden!
// I'm your digital companion, here to help you. What would you like to do today?
// Please type a number:
// 1️⃣ Challenge Negative Thoughts  
// 2️⃣ Track My Mood  
// 3️⃣ Log My Behavior  
// 4️⃣ Get Self-Care Tips`;
//     setMessages([{ sender: 'bot', text: welcomeMessage }]);
//   }, []);

//   // 监听 messages 变化，自动滚动到底部
//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [messages]);

//   const handleSend = async () => {
//     if (!userInput.trim()) return;

//     const userMessage = { sender: 'user', text: userInput };
//     setMessages((prev) => [...prev, userMessage]);

//     const choice = parseInt(userInput.trim(), 10);
//     if ([1, 2, 3, 4].includes(choice)) {
//       setUserChoice(choice); // 记录用户选择的功能
//       setUserInput('');
//     } else {
//       const botResponse = { sender: 'bot', text: "Please enter a valid number between 1 and 4." };
//       setMessages((prev) => [...prev, botResponse]);
//       setUserInput('');
//     }
//   };

//   // 当用户点击 "Back to Menu"，清空记录，回到初始菜单
//   const handleBackToMenu = () => {
//     setUserChoice(null);
//     setMessages([
//       { sender: 'bot', text: `😊🌱Welcome back to BloomBud!
// What would you like to do next? Type a number:
// 1️⃣ Challenge Negative Thoughts  
// 2️⃣ Track My Mood  
// 3️⃣ Log My Behavior  
// 4️⃣ Get Self-Care Tips` }
//     ]);
//   };

//   // **切换到对应的子组件**
//   if (userChoice !== null) {
//     switch (userChoice) {
//       case 1:
//         return <ChallengeNegativeThoughts onExit={handleBackToMenu} />;
//       case 2:
//         return <TrackMyMood onExit={handleBackToMenu} />;
//       case 3:
//         return <LogMyBehavior onExit={handleBackToMenu} />;
//       case 4:
//         return <GetSelfCareTips onExit={handleBackToMenu} />;
//       default:
//         setUserChoice(null);
//     }
//   }

//   return (
//     <div className="chat-container">
//       <div className="chat-header">
//         <img src={BOT_AVATAR} alt="BloomBud Avatar" className="chatbot-avatar" />
//         <h2 className="chat-title">BloomBud Chatbot</h2>
//       </div>
//       <div className="chat-messages">
//         {messages.map((msg, index) => (
//           <div key={index} className={`message-row ${msg.sender === 'bot' ? 'bot' : 'user'}`}>
//             {msg.sender === 'bot' && (
//               <img src={BOT_AVATAR} alt="Bot" className="avatar bot-avatar" />
//             )}
//             <div className={`message-bubble ${msg.sender === 'bot' ? 'bot-bubble' : 'user-bubble'}`}>
//               {msg.text.split("\n").map((line, i) => <p key={i}>{line}</p>)}
//             </div>
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>
//       <div className="chat-input-container">
//         <input
//           type="text"
//           placeholder="Type your message..."
//           value={userInput}
//           onChange={(e) => setUserInput(e.target.value)}
//           onKeyDown={(e) => e.key === 'Enter' && handleSend()}
//         />
//         <button onClick={handleSend}>Send</button>
//       </div>
//     </div>
//   );
// }

// export default Chat;


import React, { useState, useEffect, useRef } from 'react';
import ChallengeNegativeThoughts from './ChallengeNegativeThoughts';
import TrackMyMood from './TrackMyMood';
import LogMyBehavior from './LogMyBehavior';
import GetSelfCareTips from './GetSelfCareTips';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import '../styles/Chat.css';

const BOT_AVATAR = '/chatbot_avatar.png';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [userChoice, setUserChoice] = useState(null);
  const [username, setUsername] = useState('');
  const [isNameCollected, setIsNameCollected] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (sessionStorage.getItem('hasVisited')) {
      localStorage.removeItem('username');
      setUsername('');
      setIsNameCollected(false);
      setMessages([{ sender: 'bot', text: "Hello! Welcome to BloomBud.\nMay I know your name?" }]);
    } else {
      sessionStorage.setItem('hasVisited', 'true');
      const storedName = localStorage.getItem('username');
      if (storedName) {
        setUsername(storedName);
        setIsNameCollected(true);
        setMessages([{ sender: 'bot', text: `😊🌱Welcome back, ${storedName}!\nWhat would you like to do today?\n1️⃣ Challenge Negative Thoughts\n2️⃣ Track My Mood\n3️⃣ Log My Behavior\n4️⃣ Get Self-Care Tips` }]);
      } else {
        setMessages([{ sender: 'bot', text: "Hello! Welcome to BloomBud.\nMay I know your name?" }]);
      }
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // **🔥 存储消息到 Firestore**
  const storeMessageInFirebase = async (message) => {
    if (!username) return;
    try {
      await addDoc(collection(db, `users/${username}/messages`), {
        ...message,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('❌ Firestore 存储消息失败:', error);
    }
  };

  // **🔥 存储用户信息到 Firestore**
  const storeUsernameInFirebase = async (name) => {
    try {
      await setDoc(doc(db, 'users', name), { name }, { merge: true });
    } catch (error) {
      console.error('❌ Firestore 存储用户名失败:', error);
    }
  };

  // **🚀 处理用户输入**
  const handleSend = async () => {
    if (!userInput.trim()) return;

    const input = userInput.trim();
    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    await storeMessageInFirebase(userMessage);

    if (!isNameCollected) {
      setUsername(input);
      setIsNameCollected(true);
      localStorage.setItem('username', input);
      await storeUsernameInFirebase(input);

      const botResponse = {
        sender: 'bot',
        text: `Hi, ${input}! Welcome to BloomBud.\nWhat would you like to do today?\n1️⃣ Challenge Negative Thoughts\n2️⃣ Track My Mood\n3️⃣ Log My Behavior\n4️⃣ Get Self-Care Tips`
      };
      setMessages((prev) => [...prev, botResponse]);
      await storeMessageInFirebase(botResponse);
      setUserInput('');
      return;
    }

    const choice = parseInt(input, 10);
    if ([1, 2, 3, 4].includes(choice)) {
      setUserChoice(choice);
      setUserInput('');
    } else {
      const botResponse = { sender: 'bot', text: "Please enter a valid number between 1 and 4." };
      setMessages((prev) => [...prev, botResponse]);
      await storeMessageInFirebase(botResponse);
      setUserInput('');
    }
  };

  // **📝 返回主菜单**
  const handleBackToMenu = async () => {
    setUserChoice(null);
    const backMsg = { sender: 'bot', text: `😊🌱Welcome back, ${username}!\nWhat would you like to do next?\n1️⃣ Challenge Negative Thoughts\n2️⃣ Track My Mood\n3️⃣ Log My Behavior\n4️⃣ Get Self-Care Tips` };
    setMessages([backMsg]);
    await storeMessageInFirebase(backMsg);
  };

  if (userChoice !== null) {
    switch (userChoice) {
      case 1:
        return <ChallengeNegativeThoughts username={username} onExit={handleBackToMenu} />;
      case 2:
        return <TrackMyMood username={username} onExit={handleBackToMenu} />;
      case 3:
        return <LogMyBehavior username={username} onExit={handleBackToMenu} />;
      case 4:
        return <GetSelfCareTips username={username} onExit={handleBackToMenu} />;
      default:
        setUserChoice(null);
    }
  }

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
        <div ref={messagesEndRef} />
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
