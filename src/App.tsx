import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import FinancialProvider from "@/contexts/FinancialContext"; // Importe o FinancialProvider
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Membros from "./pages/Membros";
import Financeiro from "./pages/Financeiro";
import Relatorios from "./pages/Relatorios";
import Secretaria from "./pages/Secretaria";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword"; // Importando o componente ResetPassword
import ConfirmResetPassword from "./pages/ConfirmResetPassword";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Novo componente interno para organizar os providers que dependem de useAuth
const AppRoutesAndDataProviders = () => {
  const { igrejaId } = useAuth() as { igrejaId: string | null }; // Obtém igrejaId após AuthProvider estar ativo

  return (
    <DataProvider igrejaId={igrejaId}> {/* DataProvider recebe igrejaId */}
      <FinancialProvider> {/* FinancialProvider fica dentro de DataProvider */}
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ResetPassword />} /> {/* Nova rota para recuperação de senha */}
            <Route path="/reset-password" element={<ResetPassword />} /> {/* Rota alternativa para recuperação de senha */}
            <Route path="/redefinir-senha" element={<ConfirmResetPassword />} /> {/* Nova rota para página personalizada de redefinição de senha */}
            <Route
              path="/"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="/membros"
              element={<ProtectedRoute><Membros /></ProtectedRoute>}
            />
            <Route
              path="/financeiro"
              element={<ProtectedRoute><Financeiro /></ProtectedRoute>}
            />
            <Route
              path="/relatorios"
              element={<ProtectedRoute><Relatorios /></ProtectedRoute>}
            />
            <Route
              path="/secretaria"
              element={<ProtectedRoute><Secretaria /></ProtectedRoute>}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </FinancialProvider>
    </DataProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider> {/* AuthProvider é o mais externo dos nossos contextos de dados */}
        <AppRoutesAndDataProviders />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
