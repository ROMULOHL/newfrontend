// src/pages/EditarMembroPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../src/firebase';
import { useAuth } from '../contexts/AuthContext';
import './EditarMembroPage.css';

function EditarMembroPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { igrejaId } = useAuth();

  const [membro, setMembro] = useState(null);
  const [dizimos, setDizimos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const membroRef = doc(db, 'igrejas', igrejaId, 'membros', id);
        const membroSnap = await getDoc(membroRef);
        if (membroSnap.exists()) {
          setMembro(membroSnap.data());
        } else {
          console.error('Membro não encontrado.');
        }

        const transacoesRef = collection(db, 'igrejas', igrejaId, 'transacoes');
        const q = query(
          transacoesRef,
          where('descricao', '==', membroSnap.data().nome),
          where('tipo', '==', 'entrada'),
          where('categoria', '==', 'Dízimo')
        );
        const transacoesSnap = await getDocs(q);
        const dizimosList = transacoesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDizimos(dizimosList);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, igrejaId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMembro(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const membroRef = doc(db, 'igrejas', igrejaId, 'membros', id);
      await setDoc(membroRef, membro, { merge: true });
      navigate('/membros');
    } catch (error) {
      console.error('Erro ao salvar membro:', error);
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (!membro) return <p>Membro não encontrado.</p>;

  return (
    <div className="editar-membro-container">
      <h1>Editar Membro</h1>
      <form className="formulario-membro" onSubmit={handleSubmit}>
        <div className="campo">
          <label>Nome</label>
          <input type="text" name="nome" value={membro.nome || ''} onChange={handleChange} required />
        </div>
        <div className="campo">
          <label>Email</label>
          <input type="email" name="email" value={membro.email || ''} onChange={handleChange} />
        </div>
        <div className="campo">
          <label>Telefone</label>
          <input type="text" name="telefone" value={membro.telefone || ''} onChange={handleChange} />
        </div>
        <div className="campo">
          <label>Idade</label>
          <input type="number" name="idade" value={membro.idade || ''} onChange={handleChange} />
        </div>
        <div className="campo">
          <label>Data de Nascimento</label>
          <input type="date" name="nascimento" value={membro.nascimento || ''} onChange={handleChange} />
        </div>
        <div className="campo">
          <label>Profissão</label>
          <input type="text" name="profissao" value={membro.profissao || ''} onChange={handleChange} />
        </div>
        <div className="campo">
          <label>Estado Civil</label>
          <input type="text" name="estadoCivil" value={membro.estadoCivil || ''} onChange={handleChange} />
        </div>
        <div className="campo">
          <label>Função</label>
          <input type="text" name="funcao" value={membro.funcao || ''} onChange={handleChange} />
        </div>
        <div className="campo-checkbox">
          <label>
            <input type="checkbox" name="batizado" checked={membro.batizado || false} onChange={handleChange} />
            Batizado
          </label>
        </div>
        <div className="campo-checkbox">
          <label>
            <input type="checkbox" name="dizimista" checked={membro.dizimista || false} onChange={handleChange} />
            Dizimista
          </label>
        </div>
        <button type="submit" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </form>

      <div className="dizimos-section">
        <h2>Dízimos Registrados</h2>
        {dizimos.length === 0 ? (
          <p>Nenhum dízimo registrado.</p>
        ) : (
          <table className="tabela-dizimos">
            <thead>
              <tr>
                <th>Data</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {dizimos.map(dizimo => (
                <tr key={dizimo.id}>
                  <td>{new Date(dizimo.data.seconds * 1000).toLocaleDateString()}</td>
                  <td>R$ {dizimo.valor.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default EditarMembroPage;

