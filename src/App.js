import React, { useState } from 'react';
import AuthSelection from './components/AuthSelection';
import Chat from './components/Chat';
import ConsentModal from './components/ConsentModal'; // ✅ 引入用户须知弹窗
import './styles/Login.css';

function App() {
  const [userEmail, setUserEmail] = useState(null);
  const [consentGiven, setConsentGiven] = useState(null);  // ✅ 记录选择的聊天风格

  const handleAcceptConsent = () => {
    setConsentGiven(true); // ✅ 用户接受，继续使用应用
  };

  const handleDeclineConsent = () => {
    alert("❌ You must accept the terms to use BloomBud.");
  };

  return (
    <div className="app-container">
      <header>
        <h1>🌱 Bloombud — Helping Every Bud Bloom</h1>
      </header>
      
      {/* ✅ 只有用户接受才能进入应用 */}
      {!consentGiven ? (
        <ConsentModal onAccept={handleAcceptConsent} onDecline={handleDeclineConsent} />
      ) : (
        userEmail ? <Chat userEmail={userEmail} /> : <AuthSelection onAuthSuccess={setUserEmail} />
      )}
    </div>
  );
}

export default App;
