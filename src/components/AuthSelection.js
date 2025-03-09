import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import ChatStyleSelection from "./ChatStyleSelection";
import "../styles/Login.css";

const BOT_AVATAR = "/chatbot_avatar.png";

function AuthSelection({ onAuthSuccess }) {
  const [authMode, setAuthMode] = useState(null);
  const [user, setUser] = useState(null);

  if (user) {
    return <ChatStyleSelection onSelectStyle={onAuthSuccess} />;
  }

  if (authMode === "login") {
    return <Login onBack={() => setAuthMode(null)} onAuthSuccess={(email) => setUser(email)} />;
  } else if (authMode === "register") {
    return <Register onBack={() => setAuthMode(null)} onAuthSuccess={(email) => setUser(email)} />;
  }

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

        <div className="auth-selection">
          <button className="auth-option" onClick={() => setAuthMode("login")}>Login</button>
          <button className="auth-option" onClick={() => setAuthMode("register")}>Register</button>
          <button className="auth-option" onClick={() => setUser("Guest")}>Continue as Guest</button>
        </div>
      </div>
    </div>
  );
}

export default AuthSelection;
