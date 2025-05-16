// src/components/Sidebar/Sidebar.js
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="toggle-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
        {isCollapsed ? '☰' : '✖'}
      </button>

      <nav className="sidebar-nav">
        <NavLink to="/membros" className="nav-item" title="Membros">
          <span className="icon">👥</span>
          {!isCollapsed && <span className="text">Cadastro de Membros</span>}
        </NavLink>
        <NavLink to="/financas" className="nav-item" title="Financeiro">
          <span className="icon">💰</span>
          {!isCollapsed && <span className="text">Financeiro</span>}
        </NavLink>
        <NavLink to="/relatorios" className="nav-item" title="Relatórios">
          <span className="icon">📄</span>
          {!isCollapsed && <span className="text">Relatórios</span>}
        </NavLink>
        <NavLink to="/secretaria" className="nav-item" title="Secretaria">
          <span className="icon">⚙️</span>
          {!isCollapsed && <span className="text">Painel Secretaria</span>}
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
