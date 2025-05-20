// src/pages/ConfirmResetPassword.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/firebase";

const ConfirmResetPassword: React.FC = () => {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [email, setEmail] = useState("");
  const [codigoReset, setCodigoReset] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [sucesso, setSucesso] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Extrair o código de redefinição da URL
    const urlParams = new URLSearchParams(location.search);
    const oobCode = urlParams.get("oobCode");
    
    if (oobCode) {
      setCodigoReset(oobCode);
      // Verificar se o código é válido
      verifyPasswordResetCode(auth, oobCode)
        .then((email) => {
          setEmail(email);
          setCarregando(false);
        })
        .catch((error) => {
          setMensagem("Código de redefinição inválido ou expirado. Por favor, solicite um novo link.");
          setCarregando(false);
        });
    } else {
      setMensagem("Link de redefinição inválido. Por favor, solicite um novo link.");
      setCarregando(false);
    }
  }, [location]);
  
  const handleResetSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (novaSenha !== confirmacaoSenha) {
      setMensagem("As senhas não coincidem. Por favor, tente novamente.");
      return;
    }
    
    try {
      setCarregando(true);
      await confirmPasswordReset(auth, codigoReset, novaSenha);
      setSucesso(true);
      setMensagem("Senha alterada com sucesso!");
      
      // Redirecionar para a página de login após 3 segundos
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      setMensagem("Erro ao redefinir senha: " + error.message);
      setCarregando(false);
    }
  };
  
  if (carregando && !mensagem) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f4f6f8"
      }}>
        <p>Carregando...</p>
      </div>
    );
  }
  
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f4f6f8"
    }}>
      <div style={{
        backgroundColor: "#fff",
        padding: "40px",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        width: "100%",
        maxWidth: "400px"
      }}>
        {sucesso ? (
          <div>
            <h2 style={{ marginBottom: "20px", color: "#2c3e50" }}>Senha Alterada</h2>
            <p>Sua senha foi alterada com sucesso. Você será redirecionado para a página de login em instantes.</p>
          </div>
        ) : (
          <>
            <h2 style={{ marginBottom: "20px", color: "#2c3e50" }}>Redefinir Senha</h2>
            {email && <p style={{ marginBottom: "20px" }}>para {email}</p>}
            <form onSubmit={handleResetSenha}>
              <input
                type="password"
                placeholder="Nova senha"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
                style={{
                  padding: "10px",
                  width: "100%",
                  marginBottom: "15px",
                  border: "1px solid #ccc",
                  borderRadius: "6px"
                }}
              />
              <input
                type="password"
                placeholder="Confirme a nova senha"
                value={confirmacaoSenha}
                onChange={(e) => setConfirmacaoSenha(e.target.value)}
                required
                style={{
                  padding: "10px",
                  width: "100%",
                  marginBottom: "15px",
                  border: "1px solid #ccc",
                  borderRadius: "6px"
                }}
              />
              <button type="submit" style={{
                padding: "12px",
                width: "100%",
                backgroundColor: "#2c3e50",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer"
              }}>
                SALVAR
              </button>
            </form>
          </>
        )}
        {mensagem && (
          <p style={{ marginTop: "10px", fontSize: "14px", color: mensagem.includes("sucesso") ? "green" : "red" }}>{mensagem}</p>
        )}
      </div>
    </div>
  );
};

export default ConfirmResetPassword;
