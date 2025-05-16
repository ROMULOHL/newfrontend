// src/pages/NovoMembroPage.tsx
import * as React from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../src/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import DashboardLayout from '../components/layout/DashboardLayout';
import { CardChurch, CardHeader, CardTitle, CardContent } from '../components/ui/card-church';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { toast } from '../components/ui/use-toast';

const NovoMembroPage: React.FC = () => {
  const { igrejaId } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = React.useState({
    nome: '',
    email: '',
    telefone: '',
    idade: '',
    nascimento: '',
    profissao: '',
    estadoCivil: '',
    funcao: '',
    batizado: false,
    dizimista: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const membrosRef = collection(db, 'igrejas', igrejaId, 'membros');
      await addDoc(membrosRef, formData);
      toast({ title: 'Sucesso!', description: 'Membro cadastrado com sucesso.' });
      navigate('/membros');
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível salvar o membro.' });
      console.error('Erro ao salvar membro:', error);
    }
  };

  return (
    <DashboardLayout>
      <CardChurch>
        <CardHeader>
          <CardTitle>Novo Membro</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <Label>Nome</Label>
              <Input name="nome" value={formData.nome} onChange={handleChange} required />
            </div>
            <div>
              <Label>Email</Label>
              <Input name="email" value={formData.email} onChange={handleChange} type="email" />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input name="telefone" value={formData.telefone} onChange={handleChange} />
            </div>
            <div>
              <Label>Idade</Label>
              <Input name="idade" value={formData.idade} onChange={handleChange} type="number" />
            </div>
            <div>
              <Label>Nascimento</Label>
              <Input name="nascimento" value={formData.nascimento} onChange={handleChange} type="date" />
            </div>
            <div>
              <Label>Profissão</Label>
              <Input name="profissao" value={formData.profissao} onChange={handleChange} />
            </div>
            <div>
              <Label>Estado Civil</Label>
              <Input name="estadoCivil" value={formData.estadoCivil} onChange={handleChange} />
            </div>
            <div>
              <Label>Função</Label>
              <Input name="funcao" value={formData.funcao} onChange={handleChange} />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="batizado" checked={formData.batizado} onChange={handleChange} />
                Batizado
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="dizimista" checked={formData.dizimista} onChange={handleChange} />
                Dizimista
              </label>
            </div>
            <Button type="submit" className="bg-church-button hover:bg-church-button/90">Salvar</Button>
          </form>
        </CardContent>
      </CardChurch>
    </DashboardLayout>
  );
};

export default NovoMembroPage;
