// src/App.js
import React from 'react';
import Chat from './components/Chat';
import './styles/Chat.css'; // 引入CSS

function App() {
  return (
    <div  className="app-container">
      <header>
        <h1>🌱Bloombud🌱— Helping Every Bud Bloom</h1>
      </header>
      <Chat />
    </div>
  );
}

export default App;
