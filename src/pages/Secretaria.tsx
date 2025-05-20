import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { CardChurch, CardContent, CardHeader, CardTitle } from "@/components/ui/card-church";
import { Button } from "@/components/ui/button";

// Estrutura de documentos modificada para incluir URLs do Canva
const documentTypes = [
  {
    title: "Cartões e Credenciais",
    documents: [
      { 
        name: "Cartão de Membro", 
        icon: "📇", 
        url: "https://www.canva.com/design/DAEA1UYn7mU/VZR3770m986ZKXylDhrMog/view?utm_content=DAEA1UYn7mU&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview"
      },
      { 
        name: "Cartão de Visitante", 
        icon: "🪪", 
        url: "https://www.canva.com/design/DAGn6whO-kw/lkMIIUYmMkCR3Sz6qJ4clw/view?utm_content=DAGn6whO-kw&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview"
      },
      { 
        name: "Credencial em Geral", 
        icon: "🔖", 
        url: "https://www.canva.com/design/DAFzs0pPBQA/3Mh2h2nXdzEgZoxkiutPiQ/view?utm_content=DAFzs0pPBQA&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview"
      }
    ]
  },
  {
    title: "Certificados",
    documents: [
      { 
        name: "Certificado de Batismo", 
        icon: "📜", 
        url: "https://www.canva.com/design/DAFMEhteaGo/xrtbafZdS5ys_vRUo2Qx7g/view?utm_content=DAFMEhteaGo&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview"
      },
      { 
        name: "Certificado de Apresentação de Crianças", 
        icon: "👶", 
        url: "https://www.canva.com/design/DAFMEjbuQus/1owF7GH3KzlDKUMG0Icwew/view?utm_content=DAFMEjbuQus&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview"
      },
      { 
        name: "Certificado de Curso Bíblico", 
        icon: "🎓", 
        url: "https://www.canva.com/design/DAFMEn5tGNk/XsIXqGa6iDhe8MlR5GjcBA/view?utm_content=DAFMEn5tGNk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview"
      },
      { 
        name: "Certificado de Casamento", 
        icon: "💍", 
        url: "https://www.canva.com/design/DAGn89Sv-WI/mL8xE1DbSqBjU44XwtaOSw/view?utm_content=DAGn89Sv-WI&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview"
      }
    ]
  },
  {
    title: "Cartas e Documentos Oficiais",
    documents: [
      { 
        name: "Carta de Recomendação", 
        icon: "✉️", 
        url: "https://www.canva.com/design/DAFMFDeW2OU/Dm7mcKFzviMrj2AUk_zlFQ/view?utm_content=DAFMFDeW2OU&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview"
      },
      { 
        name: "Carta de Transferência", 
        icon: "📤", 
        url: "https://docs.google.com/document/d/1znWtmmKkanaX0oDJfecnacTHbvCxdC1h/edit?usp=sharing&ouid=118295882822776582465&rtpof=true&sd=true"
      },
      { 
        name: "Carta de Exclusão", 
        icon: "📝", 
        url: "https://docs.google.com/document/d/1DHabArb4yIwyJoDMIccRglQ_ZWXuMql_/edit?usp=sharing&ouid=118295882822776582465&rtpof=true&sd=true"
      },
      { 
        name: "Declaração de Membro", 
        icon: "📋", 
        url: "https://docs.google.com/document/d/1jq52ZJgGEf9Qnde_Ibc0jtRMfyddcN6-/edit?usp=sharing&ouid=118295882822776582465&rtpof=true&sd=true"
      }
    ]
  },
  {
    title: "Formulários",
    documents: [
      { 
        name: "Ficha de Cadastro de Membro", 
        icon: "📑", 
        url: "https://docs.google.com/document/d/1PFBV87QoZgP1nuF0ln4FeHdZINb6ZIjW/edit?usp=sharing&ouid=118295882822776582465&rtpof=true&sd=true"
      },
      { 
        name: "Ficha de Batismo", 
        icon: "🗂️", 
        url: "https://docs.google.com/document/d/1jkA38jBMSZuTI4pyH75H3UZh3tvqMlRG/edit?usp=sharing&ouid=118295882822776582465&rtpof=true&sd=true"
      },
      { 
        name: "Ficha de Aconselhamento", 
        icon: "🤝", 
        url: "https://drive.google.com/drive/folders/1e4awONFc3BaV1NlWQInu61zCqWQC_SeC?usp=sharing"
      },
      { 
        name: "Autorização de Uso de Imagem", 
        icon: "📸", 
        url: "https://drive.google.com/drive/folders/19M8ak_cElO6dv8zX_gXmmvwz_LoCl56f?usp=sharing"
      }
    ]
  }
];

const Secretaria: React.FC = () => {
  // Função para lidar com o clique no botão do documento
  const handleDocumentClick = (url: string) => {
    if (url) {
      // Abre o link em uma nova aba
      window.open(url, '_blank');
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-4xl font-bold">Painel da Secretaria</h1>
        {/* Botão "Novo Documento" removido */}
      </div>
      
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
                    className={`justify-start h-auto py-3 text-left hover:bg-gray-50 transition-colors ${doc.url ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={() => handleDocumentClick(doc.url)}
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
      
      {/* Card "Documentos Recentes" removido */}
    </DashboardLayout>
  );
};

export default Secretaria;
