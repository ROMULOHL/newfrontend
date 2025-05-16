import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { CardChurch, CardContent, CardHeader, CardTitle } from "@/components/ui/card-church";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WhatsAppSection } from "@/components/secretaria/WhatsAppSection";

const documentTypes = [
  {
    title: "Cartões e Credenciais",
    documents: [
      { name: "Cartão de Membro", icon: "📇" },
      { name: "Cartão de Visitante", icon: "🪪" },
      { name: "Credencial de Líder", icon: "🔖" }
    ]
  },
  {
    title: "Certificados",
    documents: [
      { name: "Certificado de Batismo", icon: "📜" },
      { name: "Certificado de Apresentação de Crianças", icon: "👶" },
      { name: "Certificado de Curso Bíblico", icon: "🎓" },
      { name: "Certificado de Casamento", icon: "💍" }
    ]
  },
  {
    title: "Cartas e Documentos Oficiais",
    documents: [
      { name: "Carta de Recomendação", icon: "✉️" },
      { name: "Carta de Transferência", icon: "📤" },
      { name: "Carta de Exclusão", icon: "📝" },
      { name: "Declaração de Membro", icon: "📋" }
    ]
  },
  {
    title: "Formulários",
    documents: [
      { name: "Ficha de Cadastro", icon: "📑" },
      { name: "Ficha de Batismo", icon: "🗂️" },
      { name: "Ficha de Aconselhamento", icon: "🤝" },
      { name: "Autorização de Uso de Imagem", icon: "📸" }
    ]
  }
];

const Secretaria: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-church-text">Painel da Secretaria</h1>
        <Button className="bg-church-button hover:bg-church-button/90">Novo Documento</Button>
      </div>
      
      <Tabs defaultValue="documentos" className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="documentos" className="data-[state=active]:bg-church-button data-[state=active]:text-white">Documentos</TabsTrigger>
          <TabsTrigger value="whatsapp" className="data-[state=active]:bg-church-button data-[state=active]:text-white">Assistente WhatsApp</TabsTrigger>
        </TabsList>
        
        <TabsContent value="documentos">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documentTypes.map((category, index) => (
              <CardChurch key={index}>
                <CardHeader>
                  <CardTitle>{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    {category.documents.map((doc, docIndex) => (
                      <Button 
                        key={docIndex} 
                        variant="outline" 
                        className="justify-start h-auto py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{doc.icon}</span>
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-gray-500">Editar no Canva</p>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </CardChurch>
            ))}
          </div>
          
          <CardChurch className="mt-6">
            <CardHeader>
              <CardTitle>Documentos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Para</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="p-3 text-sm">Certificado de Batismo</td>
                      <td className="p-3 text-sm">Ana Silva</td>
                      <td className="p-3 text-sm">05/05/2025</td>
                      <td className="p-3 text-sm">
                        <span className="inline-flex rounded-full px-2 text-xs font-semibold bg-green-100 text-green-800">
                          Concluído
                        </span>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex space-x-2">
                          <Button variant="ghost" className="h-8 w-8 p-0" title="Visualizar">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          </Button>
                          <Button variant="ghost" className="h-8 w-8 p-0" title="Imprimir">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                            </svg>
                          </Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="p-3 text-sm">Carta de Recomendação</td>
                      <td className="p-3 text-sm">Pedro Santos</td>
                      <td className="p-3 text-sm">02/05/2025</td>
                      <td className="p-3 text-sm">
                        <span className="inline-flex rounded-full px-2 text-xs font-semibold bg-yellow-100 text-yellow-800">
                          Pendente
                        </span>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex space-x-2">
                          <Button variant="ghost" className="h-8 w-8 p-0" title="Editar">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                            </svg>
                          </Button>
                          <Button variant="ghost" className="h-8 w-8 p-0" title="Visualizar">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          </Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="p-3 text-sm">Cartão de Membro</td>
                      <td className="p-3 text-sm">Maria Rodrigues</td>
                      <td className="p-3 text-sm">30/04/2025</td>
                      <td className="p-3 text-sm">
                        <span className="inline-flex rounded-full px-2 text-xs font-semibold bg-green-100 text-green-800">
                          Concluído
                        </span>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex space-x-2">
                          <Button variant="ghost" className="h-8 w-8 p-0" title="Visualizar">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          </Button>
                          <Button variant="ghost" className="h-8 w-8 p-0" title="Imprimir">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                            </svg>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </CardChurch>
        </TabsContent>
        
        <TabsContent value="whatsapp">
          <WhatsAppSection />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Secretaria;
