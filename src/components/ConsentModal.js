import React from 'react';
import '../styles/ConsentModal.css'; // ✅ 需要新建 `ConsentModal.css`

function ConsentModal({ onAccept, onDecline }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>User Notice</h2>
        <p>
          <strong>BloomBud is a support tool and not a replacement for professional treatment.</strong>
          <br /><br />
          If you experience severe or persistent symptoms, emotional distress, or mood fluctuations, 
          please seek professional help.
        </p>
        <p>
          <strong>Data Privacy & Security:</strong><br />
          - BloomBud does <strong>NOT</strong> store any of your personal information.<br />
          - Please <strong>DO NOT</strong> share any personal or sensitive data while using the chatbot.<br />
          - BloomBud uses OpenAI’s API and operates under GDPR regulations.
        </p>
        <p>
          By clicking <strong>"Accept All"</strong>, you acknowledge and agree to these terms.
        </p>
        <div className="modal-buttons">
          <button className="decline-btn" onClick={onDecline}>Decline All</button>
          <button className="accept-btn" onClick={onAccept}>Accept All</button>
        </div>
      </div>
    </div>
  );
}

export default ConsentModal;
