import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import '../styles/Register.css'; // ✅ 确保样式匹配

const BOT_AVATAR = '/chatbot_avatar.png';

function Register({ onBack, onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(user => onAuthSuccess(user.user.email))
      .catch(err => setError(err.message));
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <img src={BOT_AVATAR} alt="BloomBud Avatar" className="chatbot-avatar" />
        <h2 className="chat-title">BloomBud Chatbot</h2>
      </div>
      <div className="chat-messages">
        <div className="message-row bot">
          <img src={BOT_AVATAR} alt="Bot" className="avatar bot-avatar" />
          <div className="message-bubble bot-bubble">
            <p>Create an account with your email and password.</p>
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        {/* ✅ 让输入框使用 Login 样式 */}
        <div className="register-form">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

          {/* ✅ 让 Back 和 Register 在同一行 */}
          <div className="register-buttons">
            <button className="back-to-menu" onClick={onBack}>Back</button>
            <button className="register-button" onClick={handleRegister}>Register</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
