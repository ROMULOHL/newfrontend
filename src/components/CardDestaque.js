// src/components/CardDestaque.js
import React from 'react';

function CardDestaque({ titulo, valor, corFundo = '#fff', corTitulo = '#2c3e50', corValor = '#2c3e50' }) {
  return (
    <div className="card-info" style={{ backgroundColor: corFundo }}>
      <span style={{ color: corTitulo }}>{titulo}</span>
      <h3 style={{ color: corValor }}>{valor}</h3>
    </div>
  );
}

export default CardDestaque;
