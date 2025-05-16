// src/components/Topbar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Topbar.css';

function Topbar() {
  const navigate = useNavigate();

  return (
    <div className="topbar">
      <div className="topbar-logo">
        <span>📊 Painel da Igreja</span>
      </div>
      <div className="topbar-menu">
        <button onClick={() => navigate('/dashboard')}>🏠 Início</button>
        <button onClick={() => navigate('/dashboard')}>👥 Membros</button>
        <button onClick={() => navigate('/dashboard')}>💰 Finanças</button>
      </div>
    </div>
  );
}

export default Topbar;
