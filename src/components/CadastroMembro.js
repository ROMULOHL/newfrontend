// src/components/CadastroMembro.js
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

function CadastroMembro() {
  const [form, setForm] = useState({
    nome: '',
    idade: '',
    nascimento: '',
    profissao: '',
    funcao: '',
    batizado: false,
    cursos: false,
    dizimista: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'usuarios'), form);
      alert('Membro cadastrado com sucesso!');
      setForm({
        nome: '', idade: '', nascimento: '', profissao: '',
        funcao: '', batizado: false, cursos: false, dizimista: false
      });
    } catch (err) {
      console.error('Erro ao cadastrar membro:', err);
      alert('Erro ao cadastrar membro.');
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: '10px', padding: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '22px', color: '#2c3e50' }}>Cadastro de Membro</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
        <input type="text" name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} required style={inputStyle} />
        <input type="number" name="idade" placeholder="Idade" value={form.idade} onChange={handleChange} required style={inputStyle} />
        <input type="date" name="nascimento" placeholder="Data de Nascimento" value={form.nascimento} onChange={handleChange} required style={inputStyle} />
        <input type="text" name="profissao" placeholder="Profissão" value={form.profissao} onChange={handleChange} required style={inputStyle} />
        <input type="text" name="funcao" placeholder="Função na Igreja" value={form.funcao} onChange={handleChange} required style={inputStyle} />

        <div style={checkboxGroupStyle}>
          <label><input type="checkbox" name="batizado" checked={form.batizado} onChange={handleChange} /> Batizado</label>
          <label><input type="checkbox" name="cursos" checked={form.cursos} onChange={handleChange} /> Fez os Cursos</label>
          <label><input type="checkbox" name="dizimista" checked={form.dizimista} onChange={handleChange} /> Dizimista</label>
        </div>

        <button type="submit" style={buttonStyle}>Cadastrar Membro</button>
      </form>
    </div>
  );
}

const inputStyle = {
  flex: '1 1 250px',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  fontSize: '14px',
  background: '#f9f9f9',
};

const checkboxGroupStyle = {
  flex: '1 1 100%',
  display: 'flex',
  gap: '20px',
  marginTop: '10px',
  fontSize: '14px',
};

const buttonStyle = {
  padding: '12px 20px',
  backgroundColor: '#2ecc71',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
  marginTop: '15px'
};

export default CadastroMembro;
