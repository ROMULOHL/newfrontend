import React, { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { CardChurch, CardContent, CardHeader, CardTitle } from "@/components/ui/card-church";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Filter, Eye, Edit, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useData } from "@/contexts/DataContext";
import { Switch } from "@/components/ui/switch";
import { Member } from "@/contexts/DataContextTypes";
import { useAuth } from "@/contexts/AuthContext";

interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

function isFirestoreTimestamp(obj: any): obj is FirestoreTimestamp {
  return typeof obj === 'object' && obj !== null &&
         typeof obj.seconds === 'number' &&
         typeof obj.nanoseconds === 'number';
}

const Membros: React.FC = () => {
  const { membros, loading, updateMember, addMember } = useData();
  const { igrejaId: authIgrejaId } = useAuth() as { igrejaId: string | null }; 
  const { toast } = useToast();

  const [showFilters, setShowFilters] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null); 
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [idade, setIdade] = useState(""); 
  const [dataNascimento, setDataNascimento] = useState(""); 
  const [funcao, setFuncao] = useState("");
  const [profissao, setProfissao] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");
  const [dizimista, setDizimista] = useState(false);
  const [batizado, setBatizado] = useState(false);
  const [encontroComDeus, setEncontroComDeus] = useState(false);
  const [cursoDeBatismo, setCursoDeBatismo] = useState(false);
  const [maturidadeNoEspirito, setMaturidadeNoEspirito] = useState(false);
  const [escolaDeLideres, setEscolaDeLideres] = useState(false);
  const [outrosCursos, setOutrosCursos] = useState<string[]>([""]);

  const [isAddOrEditDialogOpen, setIsAddOrEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedMemberForView, setSelectedMemberForView] = useState<Member | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterFuncao, setFilterFuncao] = useState("");
  const [filterEstadoCivil, setFilterEstadoCivil] = useState("");
  const [filterDizimista, setFilterDizimista] = useState<"todos" | "sim" | "nao">("todos");
  const [filterBatizado, setFilterBatizado] = useState<"todos" | "sim" | "nao">("todos");

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleAddOutroCurso = () => {
    setOutrosCursos([...outrosCursos, ""]);
  };

  const handleOutroCursoChange = (index: number, value: string) => {
    const novosOutrosCursos = [...outrosCursos];
    novosOutrosCursos[index] = value;
    setOutrosCursos(novosOutrosCursos);
  };

  const handleRemoveOutroCurso = (index: number) => {
    const novosOutrosCursos = outrosCursos.filter((_, i) => i !== index);
    setOutrosCursos(novosOutrosCursos);
  };

  const resetForm = () => {
    setCurrentMemberId(null);
    setNome("");
    setTelefone("");
    setIdade("");
    setDataNascimento("");
    setFuncao("");
    setProfissao("");
    setEstadoCivil("");
    setDizimista(false);
    setBatizado(false);
    setEncontroComDeus(false);
    setCursoDeBatismo(false);
    setMaturidadeNoEspirito(false);
    setEscolaDeLideres(false);
    setOutrosCursos([""]);
  };

  const handleSubmitMember = async () => {
    if (!authIgrejaId) {
      toast({ title: "Erro de Configuração", description: "ID da Igreja não encontrado. Não é possível salvar.", variant: "destructive" });
      return;
    }

    const memberDataToSave = {
      nome,
      telefone,
      idade, 
      dataNascimento, 
      funcao,
      profissao,
      estadoCivil,
      dizimista,
      batizado,
      cursos: {
        encontroComDeus,
        cursoDeBatismo,
        maturidadeNoEspirito,
        escolaDeLideres,
        outros: outrosCursos.filter((curso) => curso.trim() !== ""),
      },
    };

    try {
      if (currentMemberId) {
        await updateMember(authIgrejaId, currentMemberId, memberDataToSave);
        toast({ title: "Sucesso", description: "Membro atualizado com sucesso!" });
      } else {
        await addMember(authIgrejaId, memberDataToSave as Omit<Member, 'id' | 'dataCadastro' | 'ultimaAtualizacao'>);
        toast({ title: "Sucesso", description: "Membro adicionado com sucesso!" });
      }
      setIsAddOrEditDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar membro:", error);
      toast({ title: "Erro ao Salvar", description: `Não foi possível salvar o membro. ${error instanceof Error ? error.message : 'Verifique o console.'}`, variant: "destructive" });
    }
  };

  const handleOpenAddOrEditDialog = (member?: Member) => {
    resetForm(); 
    if (member && member.id) {
      setCurrentMemberId(member.id);
      setNome(member.nome || "");
      setTelefone(member.telefone || "");
      setIdade(member.idade || ""); 
      
      const dob = member.dataNascimento;
      if (dob instanceof Date) {
        setDataNascimento(dob.toISOString().split("T")[0]);
      } else if (isFirestoreTimestamp(dob)) {
        setDataNascimento(new Date(dob.seconds * 1000).toISOString().split("T")[0]);
      } else if (typeof dob === 'string') {
        setDataNascimento(dob);
      } else {
        setDataNascimento("");
      }

      setFuncao(member.funcao || "");
      setProfissao(member.profissao || "");
      setEstadoCivil(member.estadoCivil || "");
      setDizimista(member.dizimista || false);
      setBatizado(member.batizado || false);
      setEncontroComDeus(member.cursos?.encontroComDeus || false);
      setCursoDeBatismo(member.cursos?.cursoDeBatismo || false);
      setMaturidadeNoEspirito(member.cursos?.maturidadeNoEspirito || false);
      setEscolaDeLideres(member.cursos?.escolaDeLideres || false);
      setOutrosCursos(member.cursos?.outros?.length > 0 ? member.cursos.outros : [""]);
    } 
    setIsAddOrEditDialogOpen(true);
  };

  const handleOpenViewDialog = (member: Member) => {
    setSelectedMemberForView(member);
    setIsViewDialogOpen(true);
  };

  const formatDateForDisplay = (dateValue?: string | { seconds: number; nanoseconds: number } | Date): string => {
    if (!dateValue) return "Não informado";
    try {
      if (isFirestoreTimestamp(dateValue)) {
        return new Date(dateValue.seconds * 1000).toLocaleDateString("pt-BR");
      }
      if (dateValue instanceof Date) {
        return dateValue.toLocaleDateString("pt-BR");
      }
      if (typeof dateValue === "string" && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateValue.split('-').map(Number);
        if (year && month && day) {
            if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return "Data inválida";
            return new Date(year, month - 1, day).toLocaleDateString("pt-BR");
        }
        return dateValue; 
      }
      if (typeof dateValue === "string") return dateValue; 

    } catch (e) {
      console.error("Erro ao formatar data:", dateValue, e);
      return "Data inválida";
    }
    return "Não informado"; 
  };

  const filteredMembros = useMemo(() => {
    return membros
      .filter(member => {
        if (!member || typeof member.nome !== 'string') return false;
        return member.nome.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .filter(member => {
        if (!filterFuncao) return true;
        return typeof member.funcao === 'string' && member.funcao.toLowerCase().includes(filterFuncao.toLowerCase());
      })
      .filter(member => {
        if (!filterEstadoCivil) return true;
        return typeof member.estadoCivil === 'string' && member.estadoCivil.toLowerCase().includes(filterEstadoCivil.toLowerCase());
      })
      .filter(member => {
        if (filterDizimista === "todos") return true;
        return member.dizimista === (filterDizimista === "sim");
      })
      .filter(member => {
        if (filterBatizado === "todos") return true;
        return member.batizado === (filterBatizado === "sim");
      });
  }, [membros, searchTerm, filterFuncao, filterEstadoCivil, filterDizimista, filterBatizado]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterFuncao("");
    setFilterEstadoCivil("");
    setFilterDizimista("todos");
    setFilterBatizado("todos");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">Carregando dados...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-church-button">Cadastro de Membros</h1>
        <Button 
          className="bg-church-button hover:bg-church-button/90 flex items-center gap-2"
          onClick={() => handleOpenAddOrEditDialog()} 
        >
          <UserPlus size={18} />
          <span>Novo Membro</span>
        </Button>
      </div>

      <div className="flex items-center mb-4 gap-2">
        <Input 
          placeholder="Buscar por nome..." 
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="outline" size="icon" onClick={handleFilterToggle} className="ml-auto">
          <Filter size={18} />
        </Button>
      </div>

      {showFilters && (
        <CardChurch className="mb-6">
          <CardHeader>
            <CardTitle>Filtros Avançados</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="filter-funcao">Função</Label>
              <Input 
                id="filter-funcao"
                placeholder="Filtrar por função..." 
                value={filterFuncao}
                onChange={(e) => setFilterFuncao(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filter-estadoCivil">Estado Civil</Label>
              <Input 
                id="filter-estadoCivil"
                placeholder="Filtrar por estado civil..." 
                value={filterEstadoCivil}
                onChange={(e) => setFilterEstadoCivil(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filter-dizimista">Dizimista</Label>
              <select
                id="filter-dizimista"
                value={filterDizimista}
                onChange={(e) => setFilterDizimista(e.target.value as "todos" | "sim" | "nao")}
                className="w-full p-2 border rounded-md bg-white"
              >
                <option value="todos">Todos</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </div>
            <div>
              <Label htmlFor="filter-batizado">Batizado</Label>
              <select
                id="filter-batizado"
                value={filterBatizado}
                onChange={(e) => setFilterBatizado(e.target.value as "todos" | "sim" | "nao")}
                className="w-full p-2 border rounded-md bg-white"
              >
                <option value="todos">Todos</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-1 flex items-end">
              <Button variant="outline" onClick={handleClearFilters} className="w-full">
                <XCircle size={16} className="mr-2"/>
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </CardChurch>
      )}

      <CardChurch>
        <CardHeader>
          <CardTitle>Lista de Membros ({filteredMembros.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Idade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nascimento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profissão</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batizado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dizimista</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembros.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.telefone || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.idade || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateForDisplay(member.dataNascimento)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.profissao || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.funcao || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.batizado ? "Sim" : "Não"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.dizimista ? "Sim" : "Não"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handleOpenViewDialog(member)}>
                        <Eye size={16} />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleOpenAddOrEditDialog(member)}>
                        <Edit size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredMembros.length === 0 && !loading && (
            <p className="text-center text-gray-500 py-4">Nenhum membro encontrado com os filtros atuais.</p>
          )}
        </CardContent>
      </CardChurch>

      <Dialog open={isAddOrEditDialogOpen} onOpenChange={setIsAddOrEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentMemberId ? "Editar Membro" : "Adicionar Novo Membro"}</DialogTitle>
            <DialogDescription>
              {currentMemberId ? "Atualize os dados do membro." : "Preencha todos os dados para cadastrar um novo membro."}
            </DialogDescription>
          </DialogHeader>
          
          {/* Layout em modo retrato (vertical) com mais espaço */}
          <div className="grid grid-cols-1 gap-4 py-4">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="idade">Idade</Label>
              <Input id="idade" type="number" value={idade} onChange={(e) => setIdade(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="dataNascimento">Data Nasc.</Label>
              <Input id="dataNascimento" type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="funcao">Função</Label>
              <Input id="funcao" placeholder="Digite a função" value={funcao} onChange={(e) => setFuncao(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="profissao">Profissão</Label>
              <Input id="profissao" value={profissao} onChange={(e) => setProfissao(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="estadoCivil">Estado Civil</Label>
              <select
                id="estadoCivil"
                value={estadoCivil}
                onChange={(e) => setEstadoCivil(e.target.value)}
                className="w-full p-2 border rounded-md bg-white"
              >
                <option value="">Selecione...</option>
                <option value="Solteiro(a)">Solteiro(a)</option>
                <option value="Casado(a)">Casado(a)</option>
                <option value="Divorciado(a)">Divorciado(a)</option>
                <option value="Viúvo(a)">Viúvo(a)</option>
                <option value="União Estável">União Estável</option>
              </select>
            </div>
          </div>

          {/* Switches em duas colunas */}
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dizimista">Dizimista</Label>
              <Switch id="dizimista" checked={dizimista} onCheckedChange={setDizimista} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="batizado">Batizado</Label>
              <Switch id="batizado" checked={batizado} onCheckedChange={setBatizado} />
            </div>
          </div>

          <div className="py-4">
            <h3 className="text-lg font-medium mb-3">Cursos Realizados</h3>
            
            {/* Cursos em duas colunas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="encontroComDeus">Encontro com Deus</Label>
                <Switch id="encontroComDeus" checked={encontroComDeus} onCheckedChange={setEncontroComDeus} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="cursoDeBatismo">Curso de Batismo</Label>
                <Switch id="cursoDeBatismo" checked={cursoDeBatismo} onCheckedChange={setCursoDeBatismo} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="maturidadeNoEspirito">Maturidade no Espírito</Label>
                <Switch id="maturidadeNoEspirito" checked={maturidadeNoEspirito} onCheckedChange={setMaturidadeNoEspirito} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="escolaDeLideres">Escola de Líderes</Label>
                <Switch id="escolaDeLideres" checked={escolaDeLideres} onCheckedChange={setEscolaDeLideres} />
              </div>
            </div>

            <div className="mt-4">
              {outrosCursos.map((curso, index) => (
                <div key={`curso-${index}`} className="flex items-center gap-2 mb-2">
                  <Input
                    placeholder={`Outro Curso ${index + 1}`}
                    value={curso}
                    onChange={(e) => handleOutroCursoChange(index, e.target.value)}
                  />
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveOutroCurso(index)}
                    >
                      <XCircle size={16} />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddOutroCurso}
                className="mt-2"
              >
                Adicionar Outro Curso
              </Button>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsAddOrEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmitMember}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isViewDialogOpen && selectedMemberForView && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-md bg-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Membro</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <p><strong>Nome:</strong> {selectedMemberForView.nome}</p>
              <p><strong>Telefone:</strong> {selectedMemberForView.telefone || "Não informado"}</p>
              <p><strong>Idade:</strong> {selectedMemberForView.idade || "Não informada"}</p>
              <p><strong>Data de Nascimento:</strong> {formatDateForDisplay(selectedMemberForView.dataNascimento)}</p>
              <p><strong>Função:</strong> {selectedMemberForView.funcao || "Não informada"}</p>
              <p><strong>Profissão:</strong> {selectedMemberForView.profissao || "Não informada"}</p>
              <p><strong>Estado Civil:</strong> {selectedMemberForView.estadoCivil || "Não informado"}</p>
              <p><strong>Dizimista:</strong> {selectedMemberForView.dizimista ? "Sim" : "Não"}</p>
              <p><strong>Batizado:</strong> {selectedMemberForView.batizado ? "Sim" : "Não"}</p>
              <p><strong>Cursos Realizados:</strong></p>
              <ul className="list-disc pl-5">
                <li>Encontro com Deus: {selectedMemberForView.cursos?.encontroComDeus ? "Sim" : "Não"}</li>
                <li>Curso de Batismo: {selectedMemberForView.cursos?.cursoDeBatismo ? "Sim" : "Não"}</li>
                <li>Maturidade no Espírito: {selectedMemberForView.cursos?.maturidadeNoEspirito ? "Sim" : "Não"}</li>
                <li>Escola de Líderes: {selectedMemberForView.cursos?.escolaDeLideres ? "Sim" : "Não"}</li>
                {selectedMemberForView.cursos?.outros && selectedMemberForView.cursos.outros.length > 0 ? (
                  selectedMemberForView.cursos.outros.map((curso, i) => (
                    <li key={`view-outro-${i}`}>{curso}</li>
                  ))
                ) : (
                  <li>Outros: Nenhum</li>
                )}
              </ul>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default Membros;
