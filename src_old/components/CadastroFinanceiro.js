import React, { useState, useEffect } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../src/firebase'; // Certifique-se que este caminho está correto
import { useAuth } from '../contexts/AuthContext'; // Importa o hook de autenticação

// Estrutura de categorias COMPLETA
const categoriasDeTransacao = {
  entradas: {
    "Entradas Gerais": [
      "Dízimo",
      "Oferta",
      "Doação Específica",
      "Venda de Produtos/Serviços da Igreja",
      "Aluguel de Espaços da Igreja",
      "Rendimentos de Aplicações Financeiras da Igreja",
      "Outras Entradas Diversas"
    ]
  },
  saidas: {
    "Despesas Operacionais e Administrativas": [
      "Aluguel do Templo/Salão",
      "Contas de Consumo - Água",
      "Contas de Consumo - Luz (Energia Elétrica)",
      "Contas de Consumo - Gás",
      "Contas de Consumo - Internet",
      "Contas de Consumo - Telefone Fixo e Móvel",
      "Materiais de Escritório e Papelaria",
      "Software e Assinaturas (gestão, contabilidade, streaming, etc.)",
      "Serviços de Contabilidade e Advocacia",
      "Seguros (patrimonial, responsabilidade civil, etc.)",
      "Manutenção Predial - Pequenos reparos (elétricos, hidráulicos, pintura)",
      "Manutenção Predial - Reformas e melhorias",
      "Limpeza e Conservação - Produtos de limpeza",
      "Limpeza e Conservação - Serviços de limpeza terceirizados",
      "Segurança (alarmes, monitoramento, vigilância)",
      "Transporte e Deslocamento (combustível, passagens, manutenção de veículos da igreja)",
      "Taxas e Impostos (IPTU, taxas municipais, etc.)"
    ],
    "Despesas com Pessoal e Liderança": [
      "Salário Pastoral (Prebenda, Côngrua)",
      "Ajudas de Custo para Pastores e Líderes (moradia, alimentação, transporte)",
      "Salários de Funcionários (secretaria, limpeza, som, etc.)",
      "Encargos Sociais e Trabalhistas (INSS, FGTS, 13º salário, férias)",
      "Benefícios (plano de saúde, vale-alimentação, vale-transporte)",
      "Treinamento e Desenvolvimento de Líderes e Voluntários",
      "Despesas com Viagens Missionárias e Ministeriais de Líderes"
    ],
    "Despesas com Ministérios e Departamentos": [
      "Departamento Infantil (Kids) - Materiais didáticos e pedagógicos",
      "Departamento Infantil (Kids) - Lanches e alimentação",
      "Departamento Infantil (Kids) - Eventos e atividades específicas",
      "Departamento de Jovens e Adolescentes - Materiais para estudos e reuniões",
      "Departamento de Jovens e Adolescentes - Eventos, acampamentos e retiros",
      "Departamento de Casais - Materiais para encontros e cursos",
      "Departamento de Casais - Eventos e palestras",
      "Ministério de Louvor e Adoração - Instrumentos musicais (compra, manutenção, aluguel)",
      "Ministério de Louvor e Adoração - Equipamentos de Som e Iluminação (compra, manutenção, aluguel)",
      "Ministério de Louvor e Adoração - Materiais (cabos, palhetas, cordas, etc.)",
      "Ministério de Louvor e Adoração - Uniformes ou vestimentas específicas",
      "Ministério de Ensino (Escola Bíblica Dominical, cursos) - Materiais didáticos (livros, apostilas, Bíblias)",
      "Ministério de Ensino (Escola Bíblica Dominical, cursos) - Recursos audiovisuais",
      "Ministério de Ação Social e Evangelismo - Doações e cestas básicas",
      "Ministério de Ação Social e Evangelismo - Eventos evangelísticos e comunitários",
      "Ministério de Ação Social e Evangelismo - Materiais de divulgação (folhetos, Bíblias para doação)",
      "Ministério de Comunicação - Equipamentos de filmagem e fotografia",
      "Ministério de Comunicação - Software de edição",
      "Ministério de Comunicação - Custos com transmissão online (plataformas, internet dedicada)",
      "Ministério de Comunicação - Materiais gráficos e design",
      "Outros Ministérios (Mulheres, Homens, Terceira Idade, etc.) - Despesas específicas"
    ],
    "Despesas com Eventos e Celebrações": [
      "Eventos Especiais (conferências, seminários, congressos) - Aluguel de espaço",
      "Eventos Especiais (conferências, seminários, congressos) - Contratação de preletores e músicos convidados",
      "Eventos Especiais (conferências, seminários, congressos) - Decoração",
      "Eventos Especiais (conferências, seminários, congressos) - Alimentação e coffee breaks",
      "Eventos Especiais (conferências, seminários, congressos) - Material de divulgação",
      "Celebrações (Páscoa, Natal, Aniversário da Igreja) - Decoração temática",
      "Celebrações (Páscoa, Natal, Aniversário da Igreja) - Cantatas e apresentações especiais",
      "Celebrações (Páscoa, Natal, Aniversário da Igreja) - Alimentação comemorativa",
      "Batismos e Ceias - Materiais específicos (túnicas, pão, suco de uva)"
    ],
    "Despesas Financeiras e Bancárias": [
      "Tarifas bancárias (manutenção de conta, TED/DOC, boletos)",
      "Juros e multas por atraso de pagamento",
      "Taxas de máquinas de cartão"
    ],
    "Outras Despesas": [
      "Aquisição de Imobilizado (móveis, equipamentos, veículos)",
      "Despesas com Hospitalidade (recepção de convidados, visitantes)",
      "Flores e Decoração do Templo (arranjos semanais, etc.)",
      "Contribuições para Convenções ou Associações Denominacionais",
      "Projetos Missionários (ofertas e sustento de missionários)",
      "Fundo de Reserva ou Contingência",
      "Despesa Diversa Não Categorizada"
    ]
  }
};

function CadastroFinanceiro() {
  const { usuario, igrejaId } = useAuth(); // Obtém o usuário e o igrejaId do contexto
  const [tipoTransacao, setTipoTransacao] = useState('saida'); // 'entrada' ou 'saida'
  const [categoriaPrincipal, setCategoriaPrincipal] = useState('');
  const [subCategoria, setSubCategoria] = useState('');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const [subCategoriasDisponiveis, setSubCategoriasDisponiveis] = useState([]);

  useEffect(() => {
    if (categoriaPrincipal) {
      if (tipoTransacao === 'entrada') {
        setSubCategoriasDisponiveis(categoriasDeTransacao.entradas[categoriaPrincipal] || []);
      } else {
        setSubCategoriasDisponiveis(categoriasDeTransacao.saidas[categoriaPrincipal] || []);
      }
      setSubCategoria(''); // Reseta a subcategoria ao mudar a principal
    } else {
      setSubCategoriasDisponiveis([]);
    }
  }, [categoriaPrincipal, tipoTransacao]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    if (!igrejaId) {
      setMensagem('Erro: ID da Igreja não encontrado. Faça login novamente.');
      return;
    }
    if (!tipoTransacao || !categoriaPrincipal || !subCategoria || !valor) {
      setMensagem('Preencha todos os campos obrigatórios!');
      return;
    }

    setLoading(true);

    const transacaoParaSalvar = {
      tipo: tipoTransacao,
      categoriaPrincipal,
      subCategoria,
      categoria: subCategoria, // Campo legado, recebe a subcategoria
      valor: Number(valor),
      descricao: descricao || `${subCategoria} - ${tipoTransacao === 'entrada' ? 'Entrada' : 'Saída'}`, // Descrição default se vazia
      data: Timestamp.now(),
      registradoPor: usuario?.email || 'Frontend Admin', // Email do usuário logado ou um placeholder
      membro: "Não informado", // Para lançamentos via frontend, geralmente não se associa a um membro específico inicialmente
      membroId: null,
      telefone: usuario?.phoneNumber || null // Se o usuário tiver telefone no auth
    };

    try {
      const transacoesCollectionRef = collection(db, 'igrejas', igrejaId, 'transacoes');
      await addDoc(transacoesCollectionRef, transacaoParaSalvar);

      setMensagem('Lançamento salvo com sucesso!');
      setTipoTransacao('saida');
      setCategoriaPrincipal('');
      setSubCategoria('');
      setValor('');
      setDescricao('');
    } catch (error) {
      console.error('Erro ao salvar lançamento financeiro:', error);
      setMensagem('Erro ao salvar lançamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const categoriasPrincipaisAtuais = tipoTransacao === 'entrada' 
    ? Object.keys(categoriasDeTransacao.entradas) 
    : Object.keys(categoriasDeTransacao.saidas);

  return (
    <div style={{ marginTop: '2rem', padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
      <h3>Lançar Transação Financeira (Dashboard)</h3>
      {mensagem && <p style={{ color: mensagem.startsWith('Erro') ? 'red' : 'green' }}>{mensagem}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="tipoTransacao">Tipo de Transação:</label>
          <select id="tipoTransacao" value={tipoTransacao} onChange={e => { setTipoTransacao(e.target.value); setCategoriaPrincipal(''); setSubCategoria(''); }}>
            <option value="saida">Saída (Despesa)</option>
            <option value="entrada">Entrada (Receita)</option>
          </select>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label htmlFor="categoriaPrincipal">Categoria Principal:</label>
          <select id="categoriaPrincipal" value={categoriaPrincipal} onChange={e => setCategoriaPrincipal(e.target.value)} required>
            <option value="">Selecione a Categoria Principal</option>
            {categoriasPrincipaisAtuais.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {categoriaPrincipal && (
          <div style={{ marginTop: '1rem' }}>
            <label htmlFor="subCategoria">Subcategoria:</label>
            <select id="subCategoria" value={subCategoria} onChange={e => setSubCategoria(e.target.value)} required>
              <option value="">Selecione a Subcategoria</option>
              {subCategoriasDisponiveis.map(subCat => (
                <option key={subCat} value={subCat}>{subCat}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginTop: '1rem' }}>
          <label htmlFor="valor">Valor (R$):</label>
          <input
            id="valor"
            type="number"
            step="0.01"
            value={valor}
            onChange={e => setValor(e.target.value)}
            placeholder="Ex: 100.50"
            required
          />
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label htmlFor="descricao">Descrição (Opcional):</label>
          <input
            id="descricao"
            type="text"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder="Detalhes da transação"
          />
        </div>

        <button type="submit" disabled={loading} style={{ marginTop: '1.5rem' }}>
          {loading ? 'Salvando...' : 'Salvar Lançamento'}
        </button>
      </form>
    </div>
  );
}

export default CadastroFinanceiro;

