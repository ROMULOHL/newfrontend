// src/AppRoutes.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';

import PainelIgreja from './components/PainelIgreja';
import PainelAdmin from './components/PainelAdmin';
import PrivateRoute from './routes/PrivateRoute';

import MembrosPage from './pages/MembrosPage.tsx';
import NovoMembroPage from './pages/NovoMembroPage';
import EditarMembroPage from './pages/EditarMembroPage';
import RelatorioPage from './pages/RelatorioPage';
import FinanceiroPage from './pages/FinanceiroPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Rotas protegidas */}
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
        path="/membros/novo"
        element={
          <PrivateRoute>
            <NovoMembroPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/membros/editar/:id"
        element={
          <PrivateRoute>
            <EditarMembroPage />
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
      <Route
        path="/financeiro"
        element={
          <PrivateRoute>
            <FinanceiroPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

