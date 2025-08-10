import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Clock, Users, CheckCircle, AlertCircle, User, Scissors } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface QueueItem {
  id: string;
  usuario_id: string;
  usuario_nome: string;
  servico_nome: string;
  horario: string;
  status: 'aguardando' | 'em_atendimento' | 'concluido' | 'confirmado';
  posicao: number;
  tempo_estimado: number; // em minutos
  data: Date;
  presente: boolean;
}

const Queue = () => {
  const { currentUser, userData } = useAuth();
  const { toast } = useToast();
  const [queueData, setQueueData] = useState<QueueItem[]>([]);
  const [userPosition, setUserPosition] = useState<QueueItem | null>(null);
  const [currentlyServing, setCurrentlyServing] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Dados mock para demonstração
  const mockQueueData: QueueItem[] = [
    {
      id: "1",
      usuario_id: "user1",
      usuario_nome: "João Silva",
      servico_nome: "Corte + Barba",
      horario: "09:00",
      status: "em_atendimento",
      posicao: 0,
      tempo_estimado: 15,
      data: new Date(),
      presente: true
    },
    {
      id: "2",
      usuario_id: currentUser?.uid || "user2",
      usuario_nome: userData?.nome || "Você",
      servico_nome: "Corte Masculino",
      horario: "09:30",
      status: "aguardando",
      posicao: 1,
      tempo_estimado: 30,
      data: new Date(),
      presente: false
    },
    {
      id: "3",
      usuario_id: "user3",
      usuario_nome: "Carlos Santos",
      servico_nome: "Barba Completa",
      horario: "10:00",
      status: "aguardando",
      posicao: 2,
      tempo_estimado: 45,
      data: new Date(),
      presente: true
    },
    {
      id: "4",
      usuario_id: "user4",
      usuario_nome: "Pedro Costa",
      servico_nome: "Relaxamento",
      horario: "10:30",
      status: "aguardando",
      posicao: 3,
      tempo_estimado: 75,
      data: new Date(),
      presente: true
    }
  ];

  useEffect(() => {
    // Em produção, usar o Firebase real-time listener
    setQueueData(mockQueueData);
    
    const userInQueue = mockQueueData.find(item => item.usuario_id === currentUser?.uid);
    setUserPosition(userInQueue || null);
    
    const serving = mockQueueData.find(item => item.status === 'em_atendimento');
    setCurrentlyServing(serving || null);
    
    setLoading(false);

    // Simular atualização em tempo real
    const interval = setInterval(() => {
      // Atualizar tempo estimado
      setQueueData(prev => prev.map(item => ({
        ...item,
        tempo_estimado: Math.max(0, item.tempo_estimado - 1)
      })));
    }, 60000); // A cada minuto

    return () => clearInterval(interval);
  }, [currentUser?.uid]);

  const handleConfirmPresence = async () => {
    if (!userPosition) return;

    try {
      // Em produção, atualizar no Firestore
      setQueueData(prev => prev.map(item => 
        item.id === userPosition.id ? { ...item, presente: true } : item
      ));
      
      setUserPosition(prev => prev ? { ...prev, presente: true } : null);

      toast({
        title: "Presença confirmada!",
        description: "Obrigado por confirmar sua presença."
      });
    } catch (error) {
      console.error("Error confirming presence:", error);
      toast({
        title: "Erro",
        description: "Erro ao confirmar presença. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_atendimento':
        return 'bg-green-500';
      case 'aguardando':
        return 'bg-yellow-500';
      case 'concluido':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'em_atendimento':
        return 'Em atendimento';
      case 'aguardando':
        return 'Aguardando';
      case 'concluido':
        return 'Concluído';
      default:
        return 'Agendado';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Carregando fila...</h2>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-muted/30 py-20">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-playfair font-bold mb-4">Fila de Atendimento</h1>
            <p className="text-muted-foreground">Acompanhe o andamento da fila em tempo real</p>
          </div>

          {/* Status do usuário */}
          {userPosition && (
            <Card className="barbershop-card border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <User className="h-5 w-5" />
                  Sua Posição na Fila
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">#{userPosition.posicao + 1}</div>
                      <p className="text-sm text-muted-foreground">Posição</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{userPosition.tempo_estimado}min</div>
                      <p className="text-sm text-muted-foreground">Tempo estimado</p>
                    </div>
                    <div>
                      <p className="font-semibold">{userPosition.servico_nome}</p>
                      <p className="text-sm text-muted-foreground">Horário: {userPosition.horario}</p>
                      <Badge variant={userPosition.presente ? "default" : "secondary"} className="mt-1">
                        {userPosition.presente ? "Presente" : "Aguardando confirmação"}
                      </Badge>
                    </div>
                  </div>
                  {!userPosition.presente && (
                    <Button onClick={handleConfirmPresence} className="btn-hero">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar Presença
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cliente em atendimento */}
          {currentlyServing && (
            <Card className="barbershop-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-green-500" />
                  Em Atendimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-green-500 text-white">
                      {currentlyServing.usuario_nome.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{currentlyServing.usuario_nome}</h3>
                    <p className="text-sm text-muted-foreground">{currentlyServing.servico_nome}</p>
                  </div>
                  <Badge className="bg-green-500">
                    {getStatusText(currentlyServing.status)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fila de espera */}
          <Card className="barbershop-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Fila de Espera ({queueData.filter(item => item.status === 'aguardando').length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {queueData.filter(item => item.status === 'aguardando').map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      item.usuario_id === currentUser?.uid ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-center min-w-[3rem]">
                        <div className="text-2xl font-bold text-primary">#{index + 1}</div>
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {item.usuario_nome.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold">
                          {item.usuario_id === currentUser?.uid ? "Você" : item.usuario_nome}
                        </h4>
                        <p className="text-sm text-muted-foreground">{item.servico_nome}</p>
                        <p className="text-xs text-muted-foreground">Horário: {item.horario}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item.tempo_estimado}min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.presente ? (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Presente
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Ausente
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {queueData.filter(item => item.status === 'aguardando').length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhum cliente na fila de espera.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informações adicionais */}
          <Card className="barbershop-card">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{queueData.length}</div>
                  <p className="text-sm text-muted-foreground">Total na fila</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">
                    {queueData.filter(item => item.presente).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Clientes presentes</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-500">
                    {Math.max(...queueData.map(item => item.tempo_estimado), 0)}min
                  </div>
                  <p className="text-sm text-muted-foreground">Tempo máximo de espera</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Queue;