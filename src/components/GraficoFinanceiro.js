// src/components/GraficoFinanceiro.js
import React, { useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from 'chart.js';
import './GraficoFinanceiro.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

function GraficoFinanceiro({ entradas, saidas }) {
  const [tipoGrafico, setTipoGrafico] = useState('barra');

  const data = {
    labels: ['Entradas', 'Saídas'],
    datasets: [
      {
        label: 'Valores (R$)',
        data: [entradas, saidas],
        backgroundColor: ['#4caf50', '#f44336'],
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="grafico-container">
      <div className="grafico-header">
        <h2>Resumo em Gráfico</h2>
        <button onClick={() => setTipoGrafico(tipoGrafico === 'barra' ? 'pizza' : 'barra')}>
          Mudar para {tipoGrafico === 'barra' ? 'Gráfico de Pizza' : 'Gráfico de Barras'}
        </button>
      </div>

      <div className="grafico-area">
        {tipoGrafico === 'barra' ? (
          <Bar data={data} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        ) : (
          <Pie data={data} options={{ responsive: true }} />
        )}
      </div>
    </div>
  );
}

export default GraficoFinanceiro;
