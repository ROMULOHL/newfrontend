// src/pages/ResetPassword.tsx
import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase";

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMensagem("✅ Email de recuperação enviado! Verifique sua caixa de entrada.");
    } catch (error: any) {
      setMensagem("❌ Erro ao enviar email: " + error.message);
    }
  };

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
        <h2 style={{ marginBottom: "20px", color: "#2c3e50" }}>Recuperar Senha</h2>
        <form onSubmit={handleReset}>
          <input
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            Enviar Email
          </button>
        </form>
        {mensagem && (
          <p style={{ marginTop: "10px", fontSize: "14px", color: "#2c3e50" }}>{mensagem}</p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
