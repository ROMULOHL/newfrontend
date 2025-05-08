import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

function Register() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  // ✅ Função de validação de senha forte
  const validarSenhaForte = (senha) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(senha);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // ✅ Verifica se a senha é forte
    if (!validarSenhaForte(senha)) {
      alert('A senha deve ter no mínimo 8 caracteres, incluindo pelo menos 1 letra maiúscula, 1 número e 1 símbolo.');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      alert('Igreja cadastrada com sucesso!');
      navigate('/dashboard'); // Redireciona para o painel após registro
    } catch (error) {
      alert('Erro ao registrar: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Registrar Nova Igreja</h2>
      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '8px', width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Senha:</label><br />
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={{ padding: '8px', width: '100%' }}
          />
          <small style={{ color: '#555' }}>
            A senha deve conter pelo menos 8 caracteres, 1 letra maiúscula, 1 número e 1 símbolo.
          </small>
        </div>

        <button type="submit" style={{ padding: '10px 20px' }}>
          Registrar
        </button>
      </form>
    </div>
  );
}

export default Register;
