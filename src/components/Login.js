import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import '../styles/Login.css'; // ✅ 现在单独引入 Login.css

const BOT_AVATAR = '/chatbot_avatar.png';

function Login({ onAuthSuccess }) {
  const [authMode, setAuthMode] = useState(null); // "login" or "register"
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
            <p>How would you like to proceed?</p>
          </div>
        </div>
        
        {!authMode ? (
          <div className="auth-selection">
            <button className="auth-option" onClick={() => setAuthMode('login')}>Login</button>
            <button className="auth-option" onClick={() => setAuthMode('register')}>Register</button>
            <button className="auth-option" onClick={() => onAuthSuccess("Guest")}>Continue as Guest</button>
          </div>
        ) : (
          <div className="auth-form">
            <div className="message-row bot">
              <img src={BOT_AVATAR} alt="Bot" className="avatar bot-avatar" />
              <div className="message-bubble bot-bubble">
                <p>{authMode === 'login' ? "Enter your email and password to login." : "Create an account with your email and password."}</p>
              </div>
            </div>

            {error && <p className="error">{error}</p>}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            
            {/* 🔹 让 Register 和 Back 在同一行 */}
            <div className="auth-buttons">
              <button className="back-to-menu" onClick={() => setAuthMode(null)}>Back</button>
              <button className="register-button" onClick={authMode === 'login' ? () => signInWithEmailAndPassword(auth, email, password)
                .then(user => onAuthSuccess(user.user.email))
                .catch(err => setError(err.message))
                : () => createUserWithEmailAndPassword(auth, email, password)
                .then(user => onAuthSuccess(user.user.email))
                .catch(err => setError(err.message))}>
                {authMode === 'login' ? "Login" : "Register"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
