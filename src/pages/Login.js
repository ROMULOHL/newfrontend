import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigate('/dashboard'); // redireciona após login bem-sucedido
    } catch (error) {
      alert('Erro ao logar: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '8px', width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={{ padding: '8px', width: '100%' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px 20px' }}>
          Entrar
        </button>
      </form>

      {/* 🔗 Link para recuperar senha fora do botão */}
      <p style={{ marginTop: '10px' }}>
        <a href="/reset-password">Esqueceu a senha?</a>
      </p>
    </div>
  );
}

export default Login;
