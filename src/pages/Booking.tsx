import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Scissors, Clock, CreditCard, Smartphone, Banknote, DollarSign, Calendar as CalendarIcon } from "lucide-react";
import { format, addDays, isToday, isTomorrow, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Service {
  id: string;
  nome: string;
  preco: number;
  duracao: number;
  descricao: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface Appointment {
  id?: string;
  usuario_id: string;
  usuario_nome: string;
  servico_id: string;
  servico_nome: string;
  preco: number;
  data: Date;
  horario: string;
  forma_pagamento: string;
  status: 'aguardando' | 'em_atendimento' | 'concluido' | 'confirmado';
  data_criacao: Date;
  duracao: number;
  presente: boolean;
  timestamp: number;
}

const Booking = () => {
  const { currentUser, userData } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);

  const mockServices: Service[] = [
    { id: "1", nome: "Corte Masculino", preco: 30, duracao: 30, descricao: "Corte tradicional masculino" },
    { id: "2", nome: "Barba Completa", preco: 25, duracao: 30, descricao: "Aparar e modelar barba" },
    { id: "3", nome: "Corte + Barba", preco: 50, duracao: 60, descricao: "Combo completo" },
    { id: "4", nome: "Sobrancelha", preco: 15, duracao: 15, descricao: "Design de sobrancelha" },
    { id: "5", nome: "Relaxamento", preco: 40, duracao: 45, descricao: "Tratamento relaxante" }
  ];

  useEffect(() => {
    setServices(mockServices);
    fetchExistingAppointments();
  }, []);

  const fetchExistingAppointments = async () => {
    try {
      const q = query(collection(db, 'fila'));
      const querySnapshot = await getDocs(q);
      const appointments: Appointment[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        appointments.push({
          id: doc.id,
          usuario_id: data.usuario_id,
          usuario_nome: data.usuario_nome,
          servico_id: data.servico_id,
          servico_nome: data.servico_nome,
          preco: data.preco,
          data: data.data.toDate(),
          horario: data.horario,
          forma_pagamento: data.forma_pagamento,
          status: data.status,
          data_criacao: data.data_criacao.toDate(),
          duracao: data.duracao,
          presente: data.presente || false,
          timestamp: data.timestamp || data.data_criacao.toMillis()
        });
      });
      
      setExistingAppointments(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos existentes.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (selectedDate) {
      generateTimeSlots();
    }
  }, [selectedDate, existingAppointments]);

  const generateTimeSlots = () => {
    if (!selectedDate) return;

    const slots: TimeSlot[] = [];
    const startHour = 8;
    const endHour = 19;
    
    const dateAppointments = existingAppointments.filter(app => 
      isSameDay(app.data, selectedDate)
    );
    const bookedTimes = dateAppointments.map(app => app.horario);

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === endHour && minute > 30) continue;
        
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const available = !bookedTimes.includes(time);
        slots.push({ time, available });
      }
    }
    setTimeSlots(slots);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleDateTimeConfirm = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Erro",
        description: "Selecione data e horário.",
        variant: "destructive"
      });
      return;
    }
    setStep(3);
  };

  const handleConfirmBooking = async () => {
    if (!currentUser) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para agendar.",
        variant: "destructive"
      });
      return;
    }

    if (!userData) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus dados. Por favor, recarregue a página.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedService) {
      toast({
        title: "Erro",
        description: "Selecione um serviço.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedDate) {
      toast({
        title: "Erro",
        description: "Selecione uma data.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedTime) {
      toast({
        title: "Erro",
        description: "Selecione um horário.",
        variant: "destructive"
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: "Erro",
        description: "Selecione uma forma de pagamento.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const appointmentDate = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      appointmentDate.setHours(hours, minutes, 0, 0);

      const newAppointment: Appointment = {
        usuario_id: currentUser.uid,
        usuario_nome: userData.nome, // Usando o nome do usuário do AuthContext
        servico_id: selectedService.id,
        servico_nome: selectedService.nome,
        preco: selectedService.preco,
        data: appointmentDate,
        horario: selectedTime,
        forma_pagamento: paymentMethod,
        status: 'aguardando',
        data_criacao: new Date(),
        duracao: selectedService.duracao,
        presente: false,
        timestamp: new Date().getTime()
      };

      await addDoc(collection(db, 'fila'), newAppointment);

      toast({
        title: "Agendamento confirmado!",
        description: `Olá ${userData.nome}, seu agendamento para ${selectedService.nome} no dia ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} às ${selectedTime} foi confirmado.`
      });

      setStep(1);
      setSelectedService(null);
      setSelectedDate(new Date());
      setSelectedTime("");
      setPaymentMethod("");
      await fetchExistingAppointments(); // Atualiza a lista de agendamentos
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: "Erro",
        description: "Erro ao confirmar agendamento. Tente novamente.",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    return format(date, "dd/MM", { locale: ptBR });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-muted/30 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-playfair font-bold mb-4">Agendar Atendimento</h1>
            <p className="text-muted-foreground">Escolha seu serviço e horário preferido</p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= stepNumber ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-16 h-0.5 ${
                      step > stepNumber ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {step === 1 && (
            <Card className="barbershop-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scissors className="h-5 w-5" />
                  Escolha seu Serviço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((service) => (
                    <Card
                      key={service.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                      onClick={() => handleServiceSelect(service)}
                    >
                      <CardContent className="p-6">
                        <div className="text-center">
                          <Scissors className="h-8 w-8 mx-auto mb-3 text-primary" />
                          <h3 className="font-semibold mb-2">{service.nome}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{service.descricao}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {service.duracao}min
                            </Badge>
                            <span className="font-bold text-primary">R$ {service.preco}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && selectedService && (
            <Card className="barbershop-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Escolha Data e Horário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-1">Serviço selecionado:</h3>
                  <p className="text-sm text-muted-foreground">{selectedService.nome} - R$ {selectedService.preco} ({selectedService.duracao}min)</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Selecione a data:</h3>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                      className="rounded-md border"
                      locale={ptBR}
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Horários disponíveis:</h3>
                    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          size="sm"
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          className="text-xs"
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Voltar
                  </Button>
                  <Button onClick={handleDateTimeConfirm} className="btn-hero">
                    Continuar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && selectedService && selectedDate && (
            <Card className="barbershop-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Forma de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold">Resumo do agendamento:</h3>
                  <p className="text-sm">Serviço: {selectedService.nome}</p>
                  <p className="text-sm">Data: {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}</p>
                  <p className="text-sm">Horário: {selectedTime}</p>
                  <p className="text-lg font-bold text-primary">Total: R$ {selectedService.preco}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Escolha a forma de pagamento:</h3>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Label htmlFor="pix" className="cursor-pointer">
                        <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                          <RadioGroupItem value="PIX" id="pix" />
                          <Smartphone className="h-5 w-5 text-primary" />
                          <span>PIX</span>
                        </div>
                      </Label>
                      <Label htmlFor="credito" className="cursor-pointer">
                        <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                          <RadioGroupItem value="Cartão de Crédito" id="credito" />
                          <CreditCard className="h-5 w-5 text-primary" />
                          <span>Cartão de Crédito</span>
                        </div>
                      </Label>
                      <Label htmlFor="debito" className="cursor-pointer">
                        <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                          <RadioGroupItem value="Cartão de Débito" id="debito" />
                          <DollarSign className="h-5 w-5 text-primary" />
                          <span>Cartão de Débito</span>
                        </div>
                      </Label>
                      <Label htmlFor="dinheiro" className="cursor-pointer">
                        <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                          <RadioGroupItem value="Dinheiro Físico" id="dinheiro" />
                          <Banknote className="h-5 w-5 text-primary" />
                          <span>Dinheiro</span>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Voltar
                  </Button>
                  <Button onClick={handleConfirmBooking} disabled={isLoading} className="btn-hero flex-1">
                    {isLoading ? "Confirmando..." : "Confirmar Agendamento"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Booking;