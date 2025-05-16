import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../src/firebase';

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMensagem('Email de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (error) {
      setMensagem('Erro ao enviar email: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Recuperar Senha</h2>
      <form onSubmit={handleReset}>
        <input
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', width: '100%', marginBottom: '10px' }}
        />
        <button type="submit" style={{ padding: '10px 20px' }}>Enviar Email</button>
      </form>
      {mensagem && <p style={{ marginTop: '10px' }}>{mensagem}</p>}
    </div>
  );
}

export default ResetPassword;
