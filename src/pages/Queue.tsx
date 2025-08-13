import { useState, useEffect, useRef } from "react";
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Clock, Users, CheckCircle, AlertCircle, User, Scissors, ChevronRight } from "lucide-react";
import { format, differenceInSeconds, addMinutes, isAfter, setHours, setMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";

interface QueueItem {
  id: string;
  usuario_id: string;
  usuario_nome: string;
  servico_nome: string;
  servico_tipo: string;
  hora_agendamento: number;
  minuto_agendamento: number;
  status: 'aguardando' | 'em_atendimento' | 'concluido' | 'confirmado';
  posicao: number;
  tempo_estimado: number;
  data: Date;
  presente: boolean;
  timestamp: number;
  tempo_inicio?: Date;
}

const SERVICE_CATEGORIES = {
  BELEZA: [
    "Barba",
    "Cabelo",
    "Selagem",
    "Platinado",
    "Hidratação",
    "Progressiva",
    "Pigmentação",
    "Limpeza de Pele"
  ],
  MASSAGEM: ["Massagem"],
  PODOLOGIA: ["Podologia", "Quiropraxia"],
  GAMES: ["Video Game"]
};

const Queue = () => {
  const { currentUser, userData } = useAuth();
  const { toast } = useToast();
  const [queueData, setQueueData] = useState<QueueItem[]>([]);
  const [userPosition, setUserPosition] = useState<QueueItem | null>(null);
  const [currentlyServing, setCurrentlyServing] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | React.ReactNode | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null);
  const [countdowns, setCountdowns] = useState<Record<string, {seconds: number | null, nextClient: {name: string, service: string} | null}>>({});
  const timeRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRefs = useRef<Record<string, NodeJS.Timeout>>({});

  // Função para formatar hora e minuto em string HH:MM
  const formatTimeFromNumbers = (hours: number, minutes: number): string => {
    const h = hours ?? 0;
    const m = minutes ?? 0;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // Função para criar Date a partir de hora e minuto
  const createDateFromTime = (hours: number, minutes: number, baseDate: Date = new Date()): Date => {
    const targetDate = new Date(baseDate);
    targetDate.setHours(hours, minutes, 0, 0);
    return targetDate;
  };

  // Atualizar relógio atual a cada segundo
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(format(new Date(), 'HH:mm:ss', { locale: ptBR }));
    };
    
    updateTime();
    timeRef.current = setInterval(updateTime, 1000);

    return () => {
      if (timeRef.current) {
        clearInterval(timeRef.current);
      }
    };
  }, []);

  // Filtrar serviços únicos presentes na fila
  const availableServiceTypes = Array.from(
    new Set(queueData.map(item => item.servico_tipo))
  ).filter(Boolean) as string[];

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
          async (querySnapshot) => {
            const queueItems: QueueItem[] = [];
            let currentPosition = 0;
            const servingItems: QueueItem[] = [];

            querySnapshot.forEach((doc) => {
              const data = doc.data();
              const item: QueueItem = {
                id: doc.id,
                usuario_id: data.usuario_id,
                usuario_nome: data.usuario_nome,
                servico_nome: data.servico_nome,
                servico_tipo: data.servico_tipo || "Outros",
                hora_agendamento: data.hora_agendamento || 0,
                minuto_agendamento: data.minuto_agendamento || 0,
                status: data.status,
                posicao: currentPosition,
                tempo_estimado: data.tempo_estimado || 30,
                data: data.data.toDate(),
                presente: data.presente || false,
                timestamp: data.timestamp || data.data.toMillis(),
                tempo_inicio: data.tempo_inicio?.toDate()
              };

              if (item.status === 'em_atendimento') {
                servingItems.push(item);
              } else {
                currentPosition++;
              }

              queueItems.push(item);
            });

            setQueueData(queueItems);
            setCurrentlyServing(servingItems);
            const userPos = queueItems.find(item => item.usuario_id === currentUser.uid) || null;
            setUserPosition(userPos);
            setLoading(false);
            setError(null);

            await processAutoQueue(servingItems, queueItems);
            updateAllCountdowns(servingItems, queueItems);
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

    return () => {
      Object.values(countdownRefs.current).forEach(ref => clearInterval(ref));
    };
  }, [currentUser]);

  // Processar fila automática - atualiza status quando o tempo acaba
  const processAutoQueue = async (servingItems: QueueItem[], allItems: QueueItem[]) => {
    const now = new Date();
    
    for (const servingItem of servingItems) {
      if (servingItem.tempo_inicio) {
        const estimatedEnd = addMinutes(servingItem.tempo_inicio, servingItem.tempo_estimado);
        
        if (isAfter(now, estimatedEnd)) {
          try {
            await updateDoc(doc(db, "fila", servingItem.id), {
              status: 'concluido',
              tempo_fim: now
            });

            const nextItem = allItems.find(item => 
              item.status === 'aguardando' && 
              item.servico_tipo === servingItem.servico_tipo
            );

            if (nextItem) {
              await updateDoc(doc(db, "fila", nextItem.id), {
                status: 'em_atendimento',
                tempo_inicio: now
              });
            }
          } catch (error) {
            console.error("Error updating queue items:", error);
            toast({
              title: "Erro",
              description: "Falha ao atualizar fila automaticamente",
              variant: "destructive"
            });
          }
        }
      }
    }
  };

  // Atualizar todas as contagens regressivas
  const updateAllCountdowns = (servingItems: QueueItem[], allItems: QueueItem[]) => {
    const newCountdowns: Record<string, {seconds: number | null, nextClient: {name: string, service: string} | null}> = {};
    const now = new Date();

    // Limpar intervalos existentes
    Object.values(countdownRefs.current).forEach(ref => clearInterval(ref));
    countdownRefs.current = {};

    Object.entries(SERVICE_CATEGORIES).forEach(([category, services]) => {
      // Primeiro próximo cliente dessa categoria (aguardando)
      const nextItem = allItems
        .filter(item => item.status === 'aguardando' && services.includes(item.servico_tipo))
        .sort((a, b) => a.timestamp - b.timestamp)[0];

      if (!nextItem) {
        newCountdowns[category] = { seconds: null, nextClient: null };
        return;
      }

      try {
        // Log para verificar os valores
        console.log(`[${category}] Próximo cliente:`, {
          nome: nextItem.usuario_nome,
          servico: nextItem.servico_nome,
          hora_agendamento: nextItem.hora_agendamento,
          minuto_agendamento: nextItem.minuto_agendamento,
          data: nextItem.data
        });

        // Cria a data do agendamento usando hora e minuto do Firestore
        const scheduledTime = createDateFromTime(
          nextItem.hora_agendamento,
          nextItem.minuto_agendamento,
          nextItem.data
        );

        console.log(`[${category}] Horário agendado:`, scheduledTime);
        console.log(`[${category}] Horário atual:`, now);

        // Calcula segundos restantes até o horário
        const secondsRemaining = Math.max(0, differenceInSeconds(scheduledTime, now));

        console.log(`[${category}] Segundos restantes:`, secondsRemaining);

        newCountdowns[category] = {
          seconds: secondsRemaining > 0 ? secondsRemaining : null,
          nextClient: {
            name: nextItem.usuario_nome,
            service: nextItem.servico_nome
          }
        };

        // Cria intervalo para decrementar a cada segundo
        if (secondsRemaining > 0) {
          countdownRefs.current[category] = setInterval(() => {
            setCountdowns(prev => {
              const updated = {...prev};
              if (updated[category] && updated[category].seconds !== null) {
                const newSeconds = Math.max(0, (updated[category].seconds || 0) - 1);
                updated[category] = {
                  ...updated[category],
                  seconds: newSeconds > 0 ? newSeconds : null
                };
              }
              return updated;
            });
          }, 1000);
        }
      } catch (error) {
        console.error(`[${category}] Erro ao criar data para contagem regressiva:`, error);
        newCountdowns[category] = { seconds: null, nextClient: null };
      }
    });

    console.log('Novas contagens regressivas:', newCountdowns);
    setCountdowns(newCountdowns);
  };

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

  const formatCountdown = (seconds: number | null) => {
    if (seconds === null || isNaN(seconds) || seconds < 0) return '--:--';
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredQueueData = selectedServiceType
    ? queueData.filter(item => item.servico_tipo === selectedServiceType)
    : queueData;

  const waitingQueue = filteredQueueData.filter(item => item.status === 'aguardando');

  // Agrupar serviços em andamento por categoria
  const servingByCategory: Record<string, QueueItem[]> = {};
  Object.entries(SERVICE_CATEGORIES).forEach(([category, services]) => {
    servingByCategory[category] = currentlyServing.filter(item => 
      services.includes(item.servico_tipo)
    );
  });

  // Agrupar fila de espera por categoria
  const waitingByCategory: Record<string, QueueItem[]> = {};
  Object.entries(SERVICE_CATEGORIES).forEach(([category, services]) => {
    waitingByCategory[category] = queueData.filter(item => 
      item.status === 'aguardando' && services.includes(item.servico_tipo)
    );
  });

  // Determinar quais categorias têm atendimentos ativos
  const activeCategories = Object.entries(servingByCategory)
    .filter(([_, items]) => items.length > 0)
    .map(([category]) => category);

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
      <div className="min-h-screen bg-muted/30 pt-12 pb-20">
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          {/* Título centralizado */}
          <div className="text-center">
            <h1 className="text-5xl font-playfair font-bold">Fila de Atendimento</h1>
            <p className="text-2xl text-muted-foreground mt-2">Acompanhe o andamento da fila em tempo real</p>
          </div>

          {/* Linha dos relógios */}
          <div className="flex justify-between items-center p-6">
            {/* Relógio atual - Esquerda */}
            <div className="flex flex-col items-center">
              <div className="text-xl text-muted-foreground mt-2">
                Horário atual
              </div>
              <div className="text-6xl font-bold tracking-wider font-mono text-primary">
                {currentTime}
              </div>
            </div>

            {/* Relógio contagem regressiva - Direita */}
            <div className="flex flex-col items-center">
              <div className="text-xl text-muted-foreground mt-2">
                Próximo cliente em:
              </div>
              <div className="text-6xl font-bold tracking-wider font-mono text-green-500">
                {userPosition ? 
                  formatCountdown(
                    countdowns[
                      Object.keys(SERVICE_CATEGORIES).find(key => 
                        SERVICE_CATEGORIES[key as keyof typeof SERVICE_CATEGORIES]
                          .includes(userPosition.servico_tipo)
                      ) || ''
                    ]?.seconds
                  ) : 
                  '--:--'}
              </div>
              <div className="text-xl text-muted-foreground mt-2">
                {userPosition && 
                  countdowns[
                    Object.keys(SERVICE_CATEGORIES).find(key => 
                      SERVICE_CATEGORIES[key as keyof typeof SERVICE_CATEGORIES]
                        .includes(userPosition.servico_tipo)
                    ) || ''
                  ]?.nextClient?.name ? 
                  `Próximo: ${
                    countdowns[
                      Object.keys(SERVICE_CATEGORIES).find(key => 
                        SERVICE_CATEGORIES[key as keyof typeof SERVICE_CATEGORIES]
                          .includes(userPosition.servico_tipo)
                      ) || ''
                    ]?.nextClient?.name
                  }` : 
                  ''}
              </div>
            </div>
          </div>

          {/* Filtros por tipo de serviço */}
          <div className="flex flex-wrap gap-4">
            <Button
              variant={!selectedServiceType ? "default" : "outline"}
              onClick={() => setSelectedServiceType(null)}
              className="text-xl px-6 py-4"
            >
              Todos os Agendamentos
            </Button>
            {availableServiceTypes.map((type) => (
              <Button
                key={type}
                variant={selectedServiceType === type ? "default" : "outline"}
                onClick={() => setSelectedServiceType(type)}
                className="text-xl px-6 py-4"
              >
                {type}
              </Button>
            ))}
          </div>

          {userPosition && (
            <Card className="barbershop-card border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-4 text-3xl">
                  <User className="h-8 w-8" />
                  Serviço em andamento: {userPosition.servico_nome}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-primary">
                          #{userPosition.posicao + 1}
                        </div>
                        <p className="text-xl text-muted-foreground">Posição</p>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold">
                          {formatCountdown(
                            countdowns[
                              Object.keys(SERVICE_CATEGORIES).find(key => 
                                SERVICE_CATEGORIES[key as keyof typeof SERVICE_CATEGORIES]
                                  .includes(userPosition.servico_tipo)
                              ) || ''
                            ]?.seconds
                          )}
                        </div>
                        <p className="text-xl text-muted-foreground">
                          {countdowns[
                            Object.keys(SERVICE_CATEGORIES).find(key => 
                              SERVICE_CATEGORIES[key as keyof typeof SERVICE_CATEGORIES]
                                .includes(userPosition.servico_tipo)
                            ) || ''
                          ]?.seconds !== null ? "Tempo restante" : "Aguardando horário"}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-2xl">{userPosition.servico_tipo}</p>
                        <p className="text-xl text-muted-foreground">
                          Horário: {formatTimeFromNumbers(userPosition.hora_agendamento, userPosition.minuto_agendamento)}
                        </p>
                        <Badge variant={userPosition.presente ? "default" : "secondary"} className="mt-2 text-lg py-2 px-4">
                          {userPosition.presente ? "Presente" : "Aguardando confirmação"}
                        </Badge>
                      </div>
                    </div>
                    {!userPosition.presente && (
                      <Button onClick={handleConfirmPresence} className="btn-hero text-xl px-6 py-6">
                        <CheckCircle className="h-6 w-6 mr-2" />
                        Confirmar Presença
                      </Button>
                    )}
                  </div>
                  
                  {countdowns[
                    Object.keys(SERVICE_CATEGORIES).find(key => 
                      SERVICE_CATEGORIES[key as keyof typeof SERVICE_CATEGORIES]
                        .includes(userPosition.servico_tipo)
                    ) || ''
                  ]?.nextClient && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-6 w-6 text-blue-600" />
                        <p className="text-xl text-blue-800 font-medium">
                          Próximo: {
                            countdowns[
                              Object.keys(SERVICE_CATEGORIES).find(key => 
                                SERVICE_CATEGORIES[key as keyof typeof SERVICE_CATEGORIES]
                                  .includes(userPosition.servico_tipo)
                              ) || ''
                            ]?.nextClient?.name
                          } ({
                            countdowns[
                              Object.keys(SERVICE_CATEGORIES).find(key => 
                                SERVICE_CATEGORIES[key as keyof typeof SERVICE_CATEGORIES]
                                  .includes(userPosition.servico_tipo)
                              ) || ''
                            ]?.nextClient?.service
                          })
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cards de atendimento por categoria */}
          <div className={`grid gap-6 ${activeCategories.length === 1 ? 'grid-cols-1' : activeCategories.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {Object.entries(SERVICE_CATEGORIES).map(([category, services]) => {
              const servingItems = servingByCategory[category];
              const waitingItems = waitingByCategory[category];
              
              if (servingItems.length === 0 && waitingItems.length === 0) return null;
              
              return (
                <Card key={category} className="barbershop-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-4 text-3xl">
                      <Scissors className="h-8 w-8 text-green-500" />
                      {category === 'BELEZA' ? 'Beleza' : 
                       category === 'MASSAGEM' ? 'Massagem' : 
                       category === 'PODOLOGIA' ? 'Podologia' : 
                       'Video Game'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Contagem regressiva para a categoria */}
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-medium text-green-800">
                          Próximo cliente:
                        </div>
                        <div className="text-3xl font-bold font-mono text-green-600">
                          {formatCountdown(countdowns[category]?.seconds)}
                        </div>
                      </div>
                      {countdowns[category]?.nextClient && (
                        <div className="mt-2 text-lg text-green-700">
                          {countdowns[category]?.nextClient?.name} ({countdowns[category]?.nextClient?.service})
                        </div>
                      )}
                    </div>

                    {/* Serviços em andamento */}
                    {servingItems.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Em Atendimento ({servingItems.length})</h3>
                        {servingItems.map((item) => (
                          <div key={item.id} className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-green-500 text-white">
                                {item.usuario_nome.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold text-xl">
                                {item.usuario_id === currentUser?.uid ? "Você" : item.usuario_nome}
                              </h3>
                              <p className="text-muted-foreground">{item.servico_nome}</p>
                            </div>
                            <Badge className="bg-green-500">
                              {getStatusText(item.status)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Fila de espera */}
                    {waitingItems.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Fila de Espera ({waitingItems.length})</h3>
                        {waitingItems
                          .sort((a, b) => a.posicao - b.posicao)
                          .map((item) => (
                            <div key={item.id} className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                              <div className="text-center min-w-[2.5rem]">
                                <div className="text-xl font-bold text-primary">#{item.posicao + 1}</div>
                              </div>
                              <Avatar className="h-12 w-12">
                                <AvatarFallback>
                                  {item.usuario_nome.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h4 className="font-medium text-lg">
                                  {item.usuario_id === currentUser?.uid ? "Você" : item.usuario_nome}
                                </h4>
                                <p className="text-muted-foreground">{item.servico_nome}</p>
                              </div>
                              <Badge variant={item.presente ? "default" : "secondary"}>
                                {item.presente ? "Presente" : "Ausente"}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Resumo geral */}
          <Card className="barbershop-card">
            <CardContent className="pt-8 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-4xl font-bold text-primary">
                    {queueData.filter(item => item.status === 'aguardando').length}
                  </div>
                  <p className="text-xl text-muted-foreground">Aguardando</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-green-500">
                    {currentlyServing.length}
                  </div>
                  <p className="text-xl text-muted-foreground">Em atendimento</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-yellow-500">
                    {queueData.filter(item => item.presente).length}
                  </div>
                  <p className="text-xl text-muted-foreground">Presentes</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-blue-500">
                    {availableServiceTypes.length}
                  </div>
                  <p className="text-xl text-muted-foreground">Tipos de serviço</p>
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