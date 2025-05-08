import React from 'react';
import './FiltroFinanceiro.css'; // Importa o CSS (você criará já abaixo)

const FiltroFinanceiro = ({
  mesSelecionado,
  setMesSelecionado,
  anoSelecionado,
  setAnoSelecionado,
}) => {
  const meses = [
    'Todos', 'Janeiro', 'Fevereiro', 'Março', 'Abril',
    'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro',
    'Outubro', 'Novembro', 'Dezembro',
  ];

  const anos = ['Todos', '2022', '2023', '2024', '2025'];

  return (
    <div className="filtro-container">
      <div className="filtro-item">
        <label htmlFor="mes"><span role="img" aria-label="calendar">📅</span> Selecione Mês:</label>
        <select
          id="mes"
          value={mesSelecionado}
          onChange={(e) => setMesSelecionado(e.target.value)}
        >
          {meses.map((mes, i) => (
            <option key={i} value={i === 0 ? '' : i}>
              {mes}
            </option>
          ))}
        </select>
      </div>

      <div className="filtro-item">
        <label htmlFor="ano"><span role="img" aria-label="calendar">📅</span> Selecione Ano:</label>
        <select
          id="ano"
          value={anoSelecionado}
          onChange={(e) => setAnoSelecionado(e.target.value)}
        >
          {anos.map((ano, i) => (
            <option key={i} value={ano === 'Todos' ? '' : ano}>
              {ano}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FiltroFinanceiro;
