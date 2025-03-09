import React, { useState } from "react";
import "../styles/ChatStyleSelection.css"; // ✅ 统一风格

const BOT_AVATAR = "/chatbot_avatar.png";

function ChatStyleSelection({ onSelectStyle }) {
  const [showStyleOptions, setShowStyleOptions] = useState(false);

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
            <p>Would you like to choose a communication style?</p>
          </div>
        </div>

        {!showStyleOptions ? (
          <div className="auth-buttons">
            <button className="auth-option" onClick={() => setShowStyleOptions(true)}>Yes</button>
            <button className="auth-option" onClick={() => onSelectStyle("default")}>No</button> 
            {/* ✅ 这里改成 "default" 让 Chat.js 正常跳转 */}
          </div>
        ) : (
          <>
            <div className="message-row bot">
              <img src={BOT_AVATAR} alt="Bot" className="avatar bot-avatar" />
              <div className="message-bubble bot-bubble">
                <p>Please select a communication style:</p>
              </div>
            </div>
            <div className="auth-buttons">
              <button className="auth-option" onClick={() => onSelectStyle("direct")}>Direct Guidance</button>
              <button className="auth-option" onClick={() => onSelectStyle("gentle")}>Gentle Guidance</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ChatStyleSelection;
