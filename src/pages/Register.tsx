// src/pages/Register.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const validarSenhaForte = (senha: string): boolean => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(senha);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarSenhaForte(senha)) {
      alert("A senha deve ter pelo menos 8 caracteres, incluindo 1 letra maiúscula, 1 número e 1 símbolo.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      alert("Igreja cadastrada com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      alert("Erro ao registrar: " + error.message);
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
        <h2 style={{ marginBottom: "20px", color: "#2c3e50" }}>Registrar Nova Igreja</h2>
        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "6px"
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>Senha:</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "6px"
              }}
            />
            <small style={{ color: "#555" }}>
              A senha deve conter pelo menos 8 caracteres, 1 letra maiúscula, 1 número e 1 símbolo.
            </small>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#2c3e50",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Registrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
