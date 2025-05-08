// src/components/ListaMembros_final_sem_warnings.js
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

// Estilos
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
  fontSize: "0.9em",
};
const thStyle = {
  borderBottom: "2px solid #eee",
  padding: "12px 8px",
  textAlign: "left",
  backgroundColor: "#f9f9f9",
  color: "#555",
};
const tdStyle = {
  borderBottom: "1px solid #eee",
  padding: "10px 8px",
  color: "#333",
};
const mobileCellStyle = {
  display: "block",
  marginBottom: "8px",
  borderBottom: "none",
  padding: "4px 8px",
};

function ListaMembros({ buscaNome }) {
  const authData = useAuth();
  const [membros, setMembros] = useState([]);
  const [loadingMembros, setLoadingMembros] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (authData) {
      const { igrejaId, carregando: carregandoAuth } = authData; // Removido 'usuario' daqui
      if (!carregandoAuth && igrejaId) {
        console.log(`ListaMembros: Carregando membros para igrejaId: ${igrejaId}`);
        setLoadingMembros(true);
        setError(null);
        setMembros([]);

        const fetchMembros = async () => {
          try {
            const membrosCollectionRef = collection(
              db,
              "igrejas",
              igrejaId,
              "membros"
            );
            const q = query(membrosCollectionRef, orderBy("nome"));
            const snapshot = await getDocs(q);
            const lista = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setMembros(lista);
            console.log(`ListaMembros: ${lista.length} membros carregados.`);
          } catch (err) {
            console.error("Erro ao buscar membros:", err);
            setError("Falha ao carregar a lista de membros.");
          } finally {
            setLoadingMembros(false);
          }
        };
        fetchMembros();
      } else if (!carregandoAuth && !igrejaId) {
        console.warn(
          "ListaMembros: igrejaId não disponível após o carregamento do contexto de autenticação."
        );
        setLoadingMembros(false);
        setMembros([]);
      } else if (carregandoAuth) {
        console.log(
          "ListaMembros: Aguardando contexto de autenticação (igrejaId)..."
        );
        setLoadingMembros(true);
      }
    }
  }, [authData]);

  if (!authData) {
    console.error(
      "ListaMembros: AuthContext não encontrado! Verifique a árvore de componentes e o AuthProvider."
    );
    return (
      <p style={{ color: "red", marginTop: "20px" }}>
        Erro: Contexto de autenticação não disponível.
      </p>
    );
  }

  const { igrejaId, carregando: carregandoAuth } = authData; // Removido 'usuario' daqui também

  if (carregandoAuth) {
    return (
      <p style={{ color: "#777", marginTop: "20px" }}>
        Carregando dados de autenticação...
      </p>
    );
  }

  if (!igrejaId) {
    return (
      <p style={{ color: "#777", marginTop: "20px" }}>
        Informações da igreja não disponíveis para listar membros. Verifique os dados do usuário.
      </p>
    );
  }

  if (loadingMembros) {
    return (
      <p style={{ color: "#777", marginTop: "20px" }}>
        Carregando lista de membros...
      </p>
    );
  }

  if (error) {
    return (
      <p style={{ color: "red", marginTop: "20px" }}>Erro: {error}</p>
    );
  }

  const membrosFiltrados = membros.filter((m) =>
    m.nome?.toLowerCase().includes(buscaNome ? buscaNome.toLowerCase() : "")
  );

  return (
    <div style={{ marginTop: "30px", overflowX: "auto" }}>
      <h2 style={{ fontSize: "1.2em", marginBottom: "15px", color: "#333" }}>
        👥 Lista de Membros (Igreja: {igrejaId})
      </h2>
      {membrosFiltrados.length === 0 ? (
        <p style={{ color: "#777" }}>
          Nenhum membro encontrado{buscaNome ? " com esse nome" : ""}.
        </p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>Email</th>
              {!isMobile && <th style={thStyle}>Função</th>}
              {!isMobile && <th style={thStyle}>Batizado</th>}
              {!isMobile && <th style={thStyle}>Dizimista</th>}
            </tr>
          </thead>
          <tbody>
            {membrosFiltrados.map((membro) => (
              <tr key={membro.id}>
                <td style={isMobile ? mobileCellStyle : tdStyle}>
                  {isMobile && (
                    <strong
                      style={{
                        display: "block",
                        color: "#555",
                        marginBottom: "2px",
                      }}
                    >
                      Nome:
                    </strong>
                  )}
                  {membro.nome}
                </td>
                <td style={isMobile ? mobileCellStyle : tdStyle}>
                  {isMobile && (
                    <strong
                      style={{
                        display: "block",
                        color: "#555",
                        marginBottom: "2px",
                      }}
                    >
                      Email:
                    </strong>
                  )}
                  {membro.email || "-"}
                </td>
                {!isMobile && <td style={tdStyle}>{membro.funcao || "-"}</td>}
                {!isMobile && (
                  <td style={tdStyle}>{membro.batizado ? "Sim" : "Não"}</td>
                )}
                {!isMobile && (
                  <td style={tdStyle}>{membro.dizimista ? "Sim" : "Não"}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ListaMembros;

