import React, { useState, useEffect } from 'react';
import { CardChurch, CardContent, CardHeader, CardTitle } from "@/components/ui/card-church";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, X, Check, Calendar } from "lucide-react";
import { useEventData } from '@/contexts/EventContext'; // Importando o contexto de eventos

// Componente para o card de Próximos Eventos editável
const EventosEditaveis = () => {
  // Usando o contexto de eventos para acessar os dados e funções
  const { eventos, loading, addEvento, updateEvento, deleteEvento } = useEventData();
  
  // Estado para controlar o modo de edição
  const [modoEdicao, setModoEdicao] = useState(false);
  
  // Estado para o evento sendo editado ou criado
  const [eventoAtual, setEventoAtual] = useState<any | null>(null);
  
  // Estado para controlar se está editando ou criando
  const [editando, setEditando] = useState(false);

  // Função para adicionar novo evento
  const adicionarEvento = () => {
    setEventoAtual({
      titulo: '',
      diaSemana: '',
      dia: 1,
      mes: 'Maio',
      horario: ''
    });
    setEditando(true);
  };

  // Função para editar evento existente
  const editarEvento = (evento: any) => {
    setEventoAtual({ ...evento });
    setEditando(true);
  };

  // Função para excluir evento
  const excluirEvento = async (id: string) => {
    try {
      await deleteEvento(id);
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
    }
  };

  // Função para salvar evento (novo ou editado)
  const salvarEvento = async () => {
    if (!eventoAtual) return;
    
    try {
      if (eventoAtual.id) {
        // Atualizar evento existente
        const { id, ...eventoSemId } = eventoAtual;
        await updateEvento(id, eventoSemId);
      } else {
        // Adicionar novo evento
        await addEvento(eventoAtual);
      }
      
      setEditando(false);
      setEventoAtual(null);
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
    }
  };

  // Função para cancelar edição
  const cancelarEdicao = () => {
    setEditando(false);
    setEventoAtual(null);
  };

  // Função para atualizar campo do evento atual
  const atualizarCampo = (campo: string, valor: string | number) => {
    if (!eventoAtual) return;
    setEventoAtual({ ...eventoAtual, [campo]: valor });
  };

  return (
    <CardChurch>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Próximos Eventos</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setModoEdicao(!modoEdicao)}
          className="h-8 w-8 p-0"
        >
          {modoEdicao ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Carregando eventos...</div>
        ) : editando ? (
          <div className="space-y-4 border p-4 rounded-md">
            <div>
              <label className="block text-sm font-medium mb-1">Título do Evento</label>
              <input
                type="text"
                value={eventoAtual?.titulo || ''}
                onChange={(e) => atualizarCampo('titulo', e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Ex: Culto de Celebração"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dia da Semana</label>
              <input
                type="text"
                value={eventoAtual?.diaSemana || ''}
                onChange={(e) => atualizarCampo('diaSemana', e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Ex: Domingo"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Dia</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={eventoAtual?.dia || ''}
                  onChange={(e) => atualizarCampo('dia', parseInt(e.target.value))}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mês</label>
                <input
                  type="text"
                  value={eventoAtual?.mes || ''}
                  onChange={(e) => atualizarCampo('mes', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Ex: Maio"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Horário</label>
                <input
                  type="text"
                  value={eventoAtual?.horario || ''}
                  onChange={(e) => atualizarCampo('horario', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Ex: 19:00"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button 
                onClick={cancelarEdicao}
                className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md shadow-sm border border-gray-300"
                style={{backgroundColor: '#e5e7eb'}}
              >
                Cancelar
              </button>
              <button 
                onClick={salvarEvento}
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm border border-blue-700"
                style={{backgroundColor: '#3b82f6'}}
              >
                Salvar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {eventos.length === 0 ? (
              <div className="text-center py-4 text-gray-500">Nenhum evento cadastrado</div>
            ) : (
              eventos.map((evento) => (
                <div key={evento.id} className="relative">
                  {modoEdicao && (
                    <div className="absolute right-0 top-0 flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => editarEvento(evento)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => excluirEvento(evento.id!)}
                        className="h-6 w-6 p-0 text-church-expense"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <h3 className="text-sm font-medium text-church-text">{evento.titulo}</h3>
                  <p className="text-xs text-gray-500">
                    {evento.diaSemana}, {evento.dia} de {evento.mes} - {evento.horario}
                  </p>
                </div>
              ))
            )}
            
            {/* Botão Adicionar Evento - Agora sempre visível e com cores sólidas */}
            <div className="mt-6">
              <button 
                onClick={adicionarEvento}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm flex items-center justify-center border border-blue-700"
                style={{backgroundColor: '#3b82f6'}}
              >
                <Plus className="h-4 w-4 mr-2" /> Adicionar Evento
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </CardChurch>
  );
};

export default EventosEditaveis;
