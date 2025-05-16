// src/components/Header.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('auth');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-content">
        {/* Logo e título */}
        <div className="logo-area">
          <img src="/logo.png" alt="Logotipo" height="24" />
          <h1 className="titulo-logo">Painel da Igreja</h1>
        </div>

        {/* Menu Central */}
        <nav className="nav-menu">
          <button
            className={isActive('/dashboard') ? 'active' : ''}
            onClick={() => navigate('/dashboard')}
          >
            Início
          </button>
          <button
            className={isActive('/membros') ? 'active' : ''}
            onClick={() => navigate('/membros')}
          >
            Membros
          </button>
          <button
            className={isActive('/relatorio') ? 'active' : ''}
            onClick={() => navigate('/relatorio')}
          >
            Relatório
          </button>
          <button
            className={isActive('/financeiro') ? 'active' : ''}
            onClick={() => navigate('/financeiro')}
          >
            Finanças
          </button>
        </nav>

        {/* Botão Sair */}
        <div className="logout-wrapper">
  <button className="btn-sair" onClick={handleLogout}>Sair</button>
</div>

      </div>
    </header>
  );
}

export default Header;
