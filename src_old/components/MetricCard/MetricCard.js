import React from 'react';
import './MetricCard.css';
import PropTypes from 'prop-types';

function MetricCard({ titulo, valor, tipo }) {
  const valorClass =
    tipo === 'entrada' ? 'valor-entrada' :
    tipo === 'saida' ? 'valor-saida' : '';

  return (
    <div className="card-metrica">
      <h3 className="card-metrica-titulo">{titulo}</h3>
      <p className={`card-metrica-valor ${valorClass}`}>{valor}</p>
    </div>
  );
}

MetricCard.propTypes = {
  titulo: PropTypes.string.isRequired,
  valor: PropTypes.string.isRequired,
  tipo: PropTypes.oneOf(['entrada', 'saida', 'saldo'])
};

export default MetricCard;
