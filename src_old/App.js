// src/App.js
import './App.css';
import React from 'react';
import AppRoutes from './AppRoutes';
import { AuthProvider } from './contexts/AuthContext'; // 1. Importe o AuthProvider

function App() {
  return (
    <AuthProvider> {/* 2. Envolva o AppRoutes com o AuthProvider */}
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
