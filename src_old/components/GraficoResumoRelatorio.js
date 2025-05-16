// src/components/GraficoResumoRelatorio.js
import React, { useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import './GraficoResumoRelatorio.css';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

function GraficoResumoRelatorio({ entradas, saidas }) {
  const [tipoGrafico, setTipoGrafico] = useState('pizza');
  const saldo = entradas - saidas;

  const data = {
    labels: ['Entradas', 'Saídas', 'Saldo'],
    datasets: [
      {
        label: 'Valores',
        data: [entradas, saidas, saldo],
        backgroundColor: ['#27ae60', '#c0392b', '#2980b9'],
        borderWidth: 1,
      },
    ],
  };

  const opcoes = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
    },
  };

  const formatar = (valor) =>
    valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });

  return (
    <div className="grafico-container">
      <div className="grafico-box">
        <h3 className="grafico-titulo">
          Resumo em {tipoGrafico === 'pizza' ? 'Pizza' : 'Barras'}
        </h3>
        <div className="grafico-wrapper">
          {tipoGrafico === 'pizza' ? <Pie data={data} options={opcoes} /> : <Bar data={data} options={opcoes} />}
        </div>
        <div className="botoes-tipo-grafico">
          <button
            className={tipoGrafico === 'pizza' ? 'ativo' : ''}
            onClick={() => setTipoGrafico('pizza')}
          >
            Gráfico de Pizza
          </button>
          <button
            className={tipoGrafico === 'barras' ? 'ativo' : ''}
            onClick={() => setTipoGrafico('barras')}
          >
            Gráfico de Barras
          </button>
        </div>
      </div>

      <div className="resumo-card">
        <h4>Resumo Financeiro</h4>
        <p><strong>Entradas:</strong> {formatar(entradas)}</p>
        <p><strong>Saídas:</strong> {formatar(saidas)}</p>
        <p><strong>Saldo:</strong> {formatar(saldo)}</p>
      </div>
    </div>
  );
}

export default GraficoResumoRelatorio;
