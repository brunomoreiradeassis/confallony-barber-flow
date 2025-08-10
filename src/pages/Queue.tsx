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
  tempo_estimado: number;
  data: Date;
  presente: boolean;
  timestamp: number;
}

const Queue = () => {
  const { currentUser, userData } = useAuth();
  const { toast } = useToast();
  const [queueData, setQueueData] = useState<QueueItem[]>([]);
  const [userPosition, setUserPosition] = useState<QueueItem | null>(null);
  const [currentlyServing, setCurrentlyServing] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | React.ReactNode | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const fetchQueueData = async () => {
      try {
        const q = query(
          collection(db, "fila"),
          where("status", "in", ["aguardando", "em_atendimento"]),
          orderBy("status"),
          orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(q, 
          (querySnapshot) => {
            const queueItems: QueueItem[] = [];
            let currentPosition = 0;
            let servingItem: QueueItem | null = null;

            querySnapshot.forEach((doc) => {
              const data = doc.data();
              const item: QueueItem = {
                id: doc.id,
                usuario_id: data.usuario_id,
                usuario_nome: data.usuario_nome,
                servico_nome: data.servico_nome,
                horario: data.horario,
                status: data.status,
                posicao: currentPosition,
                tempo_estimado: data.tempo_estimado || 30,
                data: data.data.toDate(),
                presente: data.presente || false,
                timestamp: data.timestamp || data.data.toMillis()
              };

              if (item.status === 'em_atendimento') {
                servingItem = item;
              } else {
                currentPosition++;
              }

              queueItems.push(item);
            });

            setQueueData(queueItems);
            setCurrentlyServing(servingItem);
            setUserPosition(queueItems.find(item => item.usuario_id === currentUser.uid) || null);
            setLoading(false);
            setError(null);
          },
          (error) => {
            console.error("Error in snapshot listener:", error);
            setError(
              <span>
                A consulta requer um índice. Crie-o{' '}
                <a
                  href="https://console.firebase.google.com/v1/r/project/barbearia-confallony/firestore/indexes?create_composite=ClFwcm9qZWN0cy9iYXJiZWFyaWEtY29uZmFsbG9ueS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvZmlsYS9pbmRleGVzL18QARoKCgZzdGF0dXMQARoNCgl0aW1lc3RhbXAQARoMCghfX25hbWVfXxAB"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  aqui
                </a>
              </span>
            );
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (error) {
        console.error("Error setting up queue listener:", error);
        setError("Erro ao configurar a fila. Tente recarregar a página.");
        setLoading(false);
      }
    };

    fetchQueueData();
  }, [currentUser]);

  const handleConfirmPresence = async () => {
    if (!userPosition || !currentUser) return;

    try {
      const queueItemRef = doc(db, "fila", userPosition.id);
      await updateDoc(queueItemRef, {
        presente: true,
        timestamp: new Date().getTime()
      });

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

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">Erro ao carregar a fila</h2>
            <div className="text-red-500 mb-4">
              {typeof error === 'string' ? error : error}
            </div>
            <Button onClick={() => window.location.reload()} className="btn-hero">
              Recarregar Página
            </Button>
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

          <Card className="barbershop-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Fila de Espera ({queueData.filter(item => item.status === 'aguardando').length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {queueData
                  .filter(item => item.status === 'aguardando')
                  .sort((a, b) => a.posicao - b.posicao)
                  .map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        item.usuario_id === currentUser?.uid ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-center min-w-[3rem]">
                          <div className="text-2xl font-bold text-primary">#{item.posicao + 1}</div>
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