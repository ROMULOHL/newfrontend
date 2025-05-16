
import React, { useState } from "react";
import { CardChurch, CardContent, CardHeader, CardTitle } from "@/components/ui/card-church";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { QrCode, MessageSquare, Phone, User, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const WhatsAppSection: React.FC = () => {
  const [connected, setConnected] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [autoResponses, setAutoResponses] = useState<boolean>(true);
  const [dataSync, setDataSync] = useState<boolean>(true);
  const { toast } = useToast();

  const handleConnect = () => {
    // In a real implementation, this would connect to WhatsApp API
    toast({
      title: "QR Code gerado",
      description: "Escaneie o QR Code com seu WhatsApp para conectar.",
    });
    
    // Simulating connection after 3 seconds
    setTimeout(() => {
      setConnected(true);
      setPhoneNumber("+55 11 98765-4321"); // Example phone number
      toast({
        title: "Conectado com sucesso",
        description: "Seu WhatsApp está conectado ao sistema.",
      });
    }, 3000);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setPhoneNumber("");
    toast({
      title: "Desconectado",
      description: "Seu WhatsApp foi desconectado do sistema.",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <CardChurch>
        <CardHeader>
          <CardTitle>Status da Conexão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            {connected ? (
              <>
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Phone size={48} className="text-green-600" />
                </div>
                <Badge className="bg-green-500 mb-2">Conectado</Badge>
                <p className="text-sm text-gray-600">Número conectado: {phoneNumber}</p>
                <Button 
                  variant="destructive" 
                  className="mt-4" 
                  onClick={handleDisconnect}
                >
                  Desconectar
                </Button>
              </>
            ) : (
              <>
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <QrCode size={48} className="text-gray-600" />
                </div>
                <Badge className="bg-gray-500 mb-2">Desconectado</Badge>
                <p className="text-sm text-gray-600">Conecte seu WhatsApp para começar</p>
                <Button 
                  className="mt-4 bg-church-button hover:bg-church-button/90" 
                  onClick={handleConnect}
                >
                  Conectar WhatsApp
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </CardChurch>

      <CardChurch>
        <CardHeader>
          <CardTitle>Configurações do Assistente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-responses">Respostas Automáticas</Label>
                <p className="text-sm text-gray-500">Ativar assistente para respostas automáticas</p>
              </div>
              <Switch
                id="auto-responses"
                checked={autoResponses}
                onCheckedChange={setAutoResponses}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="data-sync">Sincronização de Dados</Label>
                <p className="text-sm text-gray-500">Sincronizar dados recebidos com o dashboard</p>
              </div>
              <Switch
                id="data-sync"
                checked={dataSync}
                onCheckedChange={setDataSync}
              />
            </div>
            
            <Button variant="outline" className="w-full mt-4 flex items-center gap-2">
              <Settings size={16} />
              <span>Configurações Avançadas</span>
            </Button>
          </div>
        </CardContent>
      </CardChurch>

      <CardChurch>
        <CardHeader>
          <CardTitle>Estatísticas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare size={20} className="text-blue-500" />
                <span>Mensagens Recebidas</span>
              </div>
              <Badge>24</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare size={20} className="text-green-500" />
                <span>Mensagens Enviadas</span>
              </div>
              <Badge>18</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <div className="flex items-center gap-3">
                <User size={20} className="text-purple-500" />
                <span>Novos Contatos</span>
              </div>
              <Badge>5</Badge>
            </div>
          </div>
        </CardContent>
      </CardChurch>

      <CardChurch className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Mensagens Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                name: "João Silva",
                number: "+55 11 91234-5678",
                message: "Olá, gostaria de obter um certificado de batismo. Como faço?",
                time: "Hoje, 14:32",
                automated: true
              },
              {
                name: "Maria Rodrigues",
                number: "+55 11 98765-4321",
                message: "Bom dia, qual o horário do culto de domingo?",
                time: "Hoje, 10:15",
                automated: true
              },
              {
                name: "Pedro Santos",
                number: "+55 11 95555-9999",
                message: "Preciso agendar uma visita pastoral para amanhã.",
                time: "Ontem, 18:45",
                automated: false
              }
            ].map((msg, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="font-medium">{msg.name}</p>
                    <p className="text-xs text-gray-500">{msg.number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{msg.time}</p>
                    {msg.automated && (
                      <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                        Resposta automática
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700">{msg.message}</p>
                <div className="flex justify-end gap-2 mt-2">
                  <Button variant="outline" size="sm">Responder</Button>
                  <Button size="sm" className="bg-church-button hover:bg-church-button/90">Ver detalhes</Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button variant="outline">Ver todas as mensagens</Button>
          </div>
        </CardContent>
      </CardChurch>
    </div>
  );
};
