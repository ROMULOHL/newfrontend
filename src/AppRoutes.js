// src/AppRoutes.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import PainelIgreja from './components/PainelIgreja';
import PainelAdmin from './components/PainelAdmin';
import PrivateRoute from './routes/PrivateRoute';
import MembrosPage from './pages/MembrosPage';
import RelatorioPage from './pages/RelatorioPage'; // ✅ Importação da nova página

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <PainelIgreja />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <PainelAdmin />
          </PrivateRoute>
        }
      />
      <Route
        path="/membros"
        element={
          <PrivateRoute>
            <MembrosPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/relatorio"
        element={
          <PrivateRoute>
            <RelatorioPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
