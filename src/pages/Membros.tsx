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
        <h1 className="text-2xl font-bold text-church-button">Cadastro de Membros</h1>
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
        <DialogContent className="sm:max-w-7xl bg-white">
          <DialogHeader>
            <DialogTitle>{currentMemberId ? "Editar Membro" : "Adicionar Novo Membro"}</DialogTitle>
            <DialogDescription>
              {currentMemberId ? "Atualize os dados do membro." : "Preencha todos os dados para cadastrar um novo membro."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome-form" className="text-right">Nome</Label>
              <Input id="nome-form" value={nome} onChange={(e) => setNome(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telefone-form" className="text-right">Telefone</Label>
              <Input id="telefone-form" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="idade-form" className="text-right">Idade</Label>
              <Input id="idade-form" value={idade} onChange={(e) => setIdade(e.target.value)} type="number" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dataNascimento-form" className="text-right">Data Nasc.</Label>
              <Input id="dataNascimento-form" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} type="date" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="funcao-form" className="text-right">Função</Label>
              <Input 
                id="funcao-form" 
                value={funcao} 
                onChange={(e) => setFuncao(e.target.value)} 
                className="col-span-3" 
                placeholder="Digite a função"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="profissao-form" className="text-right">Profissão</Label>
              <Input id="profissao-form" value={profissao} onChange={(e) => setProfissao(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="estadoCivil-form" className="text-right">Estado Civil</Label>
              <select id="estadoCivil-form" value={estadoCivil} onChange={(e) => setEstadoCivil(e.target.value)} className="col-span-3 border rounded-md p-2 bg-white">
                <option value="">Selecione...</option>
                <option value="solteiro">Solteiro(a)</option>
                <option value="casado">Casado(a)</option>
                <option value="divorciado">Divorciado(a)</option>
                <option value="viuvo">Viúvo(a)</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div className="flex items-center justify-between col-span-4">
              <Label htmlFor="dizimista-form">Dizimista</Label>
              <Switch id="dizimista-form" checked={dizimista} onCheckedChange={setDizimista} />
            </div>
            <div className="flex items-center justify-between col-span-4">
              <Label htmlFor="batizado-form">Batizado</Label>
              <Switch id="batizado-form" checked={batizado} onCheckedChange={setBatizado} />
            </div>
            <h3 className="col-span-4 text-md font-semibold mt-2">Cursos Realizados</h3>
            <div className="flex items-center justify-between col-span-4">
              <Label htmlFor="encontroComDeus-form">Encontro com Deus</Label>
              <Switch id="encontroComDeus-form" checked={encontroComDeus} onCheckedChange={setEncontroComDeus} />
            </div>
            <div className="flex items-center justify-between col-span-4">
              <Label htmlFor="cursoDeBatismo-form">Curso de Batismo</Label>
              <Switch id="cursoDeBatismo-form" checked={cursoDeBatismo} onCheckedChange={setCursoDeBatismo} />
            </div>
            <div className="flex items-center justify-between col-span-4">
              <Label htmlFor="maturidadeNoEspirito-form">Maturidade no Espírito</Label>
              <Switch id="maturidadeNoEspirito-form" checked={maturidadeNoEspirito} onCheckedChange={setMaturidadeNoEspirito} />
            </div>
            <div className="flex items-center justify-between col-span-4">
              <Label htmlFor="escolaDeLideres-form">Escola de Líderes</Label>
              <Switch id="escolaDeLideres-form" checked={escolaDeLideres} onCheckedChange={setEscolaDeLideres} />
            </div>
            {outrosCursos.map((curso, index) => (
              <div key={index} className="grid grid-cols-4 items-center gap-4 col-span-4">
                <Label htmlFor={`outroCurso-${index}`} className="text-right">Outro Curso {index + 1}</Label>
                <Input 
                  id={`outroCurso-${index}`} 
                  value={curso} 
                  onChange={(e) => handleOutroCursoChange(index, e.target.value)} 
                  className="col-span-2" 
                />
                {outrosCursos.length > 1 && (
                  <Button variant="destructive" size="sm" onClick={() => handleRemoveOutroCurso(index)}>Remover</Button>
                )}
              </div>
            ))}
            <Button variant="outline" onClick={handleAddOutroCurso} className="col-span-4">Adicionar Outro Curso</Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOrEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmitMember} className="bg-church-button hover:bg-church-button/90">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedMemberForView && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-lg bg-white">
            <DialogHeader>
              <DialogTitle>Detalhes do Membro</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-2 max-h-[70vh] overflow-y-auto pr-2">
              <p><strong>Nome:</strong> {selectedMemberForView.nome}</p>
              <p><strong>Telefone:</strong> {selectedMemberForView.telefone || "Não informado"}</p>
              <p><strong>Idade:</strong> {selectedMemberForView.idade || "Não informado"}</p>
              <p><strong>Data de Nascimento:</strong> {formatDateForDisplay(selectedMemberForView.dataNascimento)}</p>
              <p><strong>Função:</strong> {selectedMemberForView.funcao || "Não informado"}</p>
              <p><strong>Profissão:</strong> {selectedMemberForView.profissao || "Não informado"}</p>
              <p><strong>Estado Civil:</strong> {selectedMemberForView.estadoCivil || "Não informado"}</p>
              <p><strong>Dizimista:</strong> {selectedMemberForView.dizimista ? "Sim" : "Não"}</p>
              <p><strong>Batizado:</strong> {selectedMemberForView.batizado ? "Sim" : "Não"}</p>
              <h4 className="font-semibold mt-2">Cursos:</h4>
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

