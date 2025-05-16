import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import ListaMembros from "../components/ListaMembros";
import { FiUserPlus, FiFilter, FiSearch } from "react-icons/fi";

const MembrosPage: React.FC = () => {
  const navigate = useNavigate();
  const [buscaNome, setBuscaNome] = useState<string>('');
  const [filtrosVisiveis, setFiltrosVisiveis] = useState<boolean>(false);

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cadastro de Membros</h1>
        <button
          onClick={() => navigate("/membros/novo")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          <FiUserPlus size={16} />
          <span>Novo Membro</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <FiSearch className="absolute top-3 left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar membros..."
            value={buscaNome}
            onChange={(e) => setBuscaNome(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
          />
        </div>
        <button
          onClick={() => setFiltrosVisiveis(!filtrosVisiveis)}
          className="flex items-center gap-2 border px-4 py-2 rounded text-gray-700 hover:bg-gray-100"
        >
          <FiFilter size={16} />
          <span>Filtros</span>
        </button>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          <FiSearch size={16} />
          <span>Buscar</span>
        </button>
      </div>

      {filtrosVisiveis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded border">
          <div>
            <label className="block mb-1 font-medium text-sm text-gray-700">Idade</label>
            <select className="w-full border p-2 rounded">
              <option value="">Todas</option>
              <option value="ate18">Até 18</option>
              <option value="19a30">19 a 30</option>
              <option value="31a45">31 a 45</option>
              <option value="46a60">46 a 60</option>
              <option value="acima60">Acima de 60</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm text-gray-700">Função</label>
            <select className="w-full border p-2 rounded">
              <option value="">Todas</option>
              <option value="pastor">Pastor</option>
              <option value="diacono">Diácono</option>
              <option value="lider">Líder</option>
              <option value="tesoureiro">Tesoureiro</option>
              <option value="secretario">Secretário</option>
              <option value="musico">Músico</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium text-sm text-gray-700">Status</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" />
                Batizado
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" />
                Dizimista
              </label>
            </div>
          </div>
        </div>
      )}

      <ListaMembros buscaNome={buscaNome} />
    </Layout>
  );
};

export default MembrosPage;
