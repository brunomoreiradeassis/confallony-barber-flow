import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Users, 
  Scissors, 
  BarChart, 
  Clock, 
  DollarSign, 
  Calendar,
  Plus,
  Edit,
  Trash2,
  Star,
  TrendingUp
} from "lucide-react";

interface Service {
  id: string;
  nome: string;
  preco: number;
  duracao: number;
  descricao: string;
  ativo: boolean;
}

interface Employee {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  especialidades: string[];
  ativo: boolean;
}

interface Statistics {
  totalClientes: number;
  agendamentosHoje: number;
  faturamentoMes: number;
  servicoMaisVendido: string;
  horarioPico: string;
}

const Admin = () => {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para formulários
  const [serviceForm, setServiceForm] = useState({
    nome: "",
    preco: "",
    duracao: "",
    descricao: ""
  });
  const [employeeForm, setEmployeeForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    especialidades: ""
  });

  // Dados mock para demonstração
  const mockServices: Service[] = [
    { id: "1", nome: "Corte Masculino", preco: 30, duracao: 30, descricao: "Corte tradicional", ativo: true },
    { id: "2", nome: "Barba Completa", preco: 25, duracao: 30, descricao: "Aparar e modelar", ativo: true },
    { id: "3", nome: "Corte + Barba", preco: 50, duracao: 60, descricao: "Combo completo", ativo: true }
  ];

  const mockEmployees: Employee[] = [
    { id: "1", nome: "João Barbeiro", email: "joao@confallony.com", telefone: "(11) 99999-9999", especialidades: ["Corte", "Barba"], ativo: true },
    { id: "2", nome: "Pedro Silva", email: "pedro@confallony.com", telefone: "(11) 88888-8888", especialidades: ["Corte", "Relaxamento"], ativo: true }
  ];

  const mockStatistics: Statistics = {
    totalClientes: 234,
    agendamentosHoje: 12,
    faturamentoMes: 4580.50,
    servicoMaisVendido: "Corte + Barba",
    horarioPico: "14:00 - 16:00"
  };

  useEffect(() => {
    if (!userData?.isAdmin) return;
    
    // Carregar dados mock
    setServices(mockServices);
    setEmployees(mockEmployees);
    setStatistics(mockStatistics);
  }, [userData]);

  const handleAddService = async () => {
    if (!serviceForm.nome || !serviceForm.preco || !serviceForm.duracao) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const newService: Service = {
        id: Date.now().toString(),
        nome: serviceForm.nome,
        preco: parseFloat(serviceForm.preco),
        duracao: parseInt(serviceForm.duracao),
        descricao: serviceForm.descricao,
        ativo: true
      };

      setServices(prev => [...prev, newService]);
      setServiceForm({ nome: "", preco: "", duracao: "", descricao: "" });

      toast({
        title: "Sucesso!",
        description: "Serviço adicionado com sucesso."
      });
    } catch (error) {
      console.error("Error adding service:", error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar serviço.",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleAddEmployee = async () => {
    if (!employeeForm.nome || !employeeForm.email || !employeeForm.telefone) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const newEmployee: Employee = {
        id: Date.now().toString(),
        nome: employeeForm.nome,
        email: employeeForm.email,
        telefone: employeeForm.telefone,
        especialidades: employeeForm.especialidades.split(",").map(s => s.trim()),
        ativo: true
      };

      setEmployees(prev => [...prev, newEmployee]);
      setEmployeeForm({ nome: "", email: "", telefone: "", especialidades: "" });

      toast({
        title: "Sucesso!",
        description: "Funcionário adicionado com sucesso."
      });
    } catch (error) {
      console.error("Error adding employee:", error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar funcionário.",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const toggleServiceStatus = (serviceId: string) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId ? { ...service, ativo: !service.ativo } : service
    ));
  };

  const toggleEmployeeStatus = (employeeId: string) => {
    setEmployees(prev => prev.map(employee => 
      employee.id === employeeId ? { ...employee, ativo: !employee.ativo } : employee
    ));
  };

  // Verificar se o usuário é admin
  if (!userData?.isAdmin) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="barbershop-card">
            <CardContent className="pt-6 text-center">
              <Settings className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Acesso Negado</h2>
              <p className="text-muted-foreground">Você não tem permissão para acessar esta área.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-muted/30 py-20">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-playfair font-bold mb-4">Área Administrativa</h1>
            <p className="text-muted-foreground">Gerencie sua barbearia</p>
          </div>

          {/* Estatísticas */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <Card className="barbershop-card">
                <CardContent className="pt-6 text-center">
                  <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                  <div className="text-2xl font-bold">{statistics.totalClientes}</div>
                  <p className="text-sm text-muted-foreground">Total Clientes</p>
                </CardContent>
              </Card>
              <Card className="barbershop-card">
                <CardContent className="pt-6 text-center">
                  <Calendar className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <div className="text-2xl font-bold">{statistics.agendamentosHoje}</div>
                  <p className="text-sm text-muted-foreground">Agendamentos Hoje</p>
                </CardContent>
              </Card>
              <Card className="barbershop-card">
                <CardContent className="pt-6 text-center">
                  <DollarSign className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <div className="text-2xl font-bold">R$ {statistics.faturamentoMes.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">Faturamento Mês</p>
                </CardContent>
              </Card>
              <Card className="barbershop-card">
                <CardContent className="pt-6 text-center">
                  <Star className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                  <div className="text-lg font-bold">{statistics.servicoMaisVendido}</div>
                  <p className="text-sm text-muted-foreground">Mais Vendido</p>
                </CardContent>
              </Card>
              <Card className="barbershop-card">
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                  <div className="text-lg font-bold">{statistics.horarioPico}</div>
                  <p className="text-sm text-muted-foreground">Horário Pico</p>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="services" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                Serviços
              </TabsTrigger>
              <TabsTrigger value="employees" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Funcionários
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horários
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Relatórios
              </TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gerenciar Serviços</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="btn-hero">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Serviço
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Serviço</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nome">Nome do Serviço</Label>
                        <Input
                          id="nome"
                          value={serviceForm.nome}
                          onChange={(e) => setServiceForm(prev => ({ ...prev, nome: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="preco">Preço (R$)</Label>
                          <Input
                            id="preco"
                            type="number"
                            step="0.01"
                            value={serviceForm.preco}
                            onChange={(e) => setServiceForm(prev => ({ ...prev, preco: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="duracao">Duração (min)</Label>
                          <Input
                            id="duracao"
                            type="number"
                            value={serviceForm.duracao}
                            onChange={(e) => setServiceForm(prev => ({ ...prev, duracao: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea
                          id="descricao"
                          value={serviceForm.descricao}
                          onChange={(e) => setServiceForm(prev => ({ ...prev, descricao: e.target.value }))}
                        />
                      </div>
                      <Button onClick={handleAddService} disabled={isLoading} className="w-full btn-hero">
                        {isLoading ? "Adicionando..." : "Adicionar Serviço"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <Card key={service.id} className="barbershop-card">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold">{service.nome}</h3>
                        <Badge variant={service.ativo ? "default" : "secondary"}>
                          {service.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{service.descricao}</p>
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-primary">R$ {service.preco}</span>
                        <span className="text-sm text-muted-foreground">{service.duracao}min</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant={service.ativo ? "destructive" : "default"} 
                          size="sm" 
                          className="flex-1"
                          onClick={() => toggleServiceStatus(service.id)}
                        >
                          {service.ativo ? "Desativar" : "Ativar"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="employees" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gerenciar Funcionários</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="btn-hero">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Funcionário
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Funcionário</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="empNome">Nome Completo</Label>
                        <Input
                          id="empNome"
                          value={employeeForm.nome}
                          onChange={(e) => setEmployeeForm(prev => ({ ...prev, nome: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="empEmail">E-mail</Label>
                        <Input
                          id="empEmail"
                          type="email"
                          value={employeeForm.email}
                          onChange={(e) => setEmployeeForm(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="empTelefone">Telefone</Label>
                        <Input
                          id="empTelefone"
                          value={employeeForm.telefone}
                          onChange={(e) => setEmployeeForm(prev => ({ ...prev, telefone: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="empEspecialidades">Especialidades (separadas por vírgula)</Label>
                        <Input
                          id="empEspecialidades"
                          value={employeeForm.especialidades}
                          onChange={(e) => setEmployeeForm(prev => ({ ...prev, especialidades: e.target.value }))}
                          placeholder="Corte, Barba, Relaxamento"
                        />
                      </div>
                      <Button onClick={handleAddEmployee} disabled={isLoading} className="w-full btn-hero">
                        {isLoading ? "Adicionando..." : "Adicionar Funcionário"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.map((employee) => (
                  <Card key={employee.id} className="barbershop-card">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold">{employee.nome}</h3>
                        <Badge variant={employee.ativo ? "default" : "secondary"}>
                          {employee.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{employee.email}</p>
                      <p className="text-sm text-muted-foreground mb-4">{employee.telefone}</p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {employee.especialidades.map((esp, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {esp}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant={employee.ativo ? "destructive" : "default"} 
                          size="sm" 
                          className="flex-1"
                          onClick={() => toggleEmployeeStatus(employee.id)}
                        >
                          {employee.ativo ? "Desativar" : "Ativar"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-6">
              <Card className="barbershop-card">
                <CardHeader>
                  <CardTitle>Configuração de Horários</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Configuração de horários de funcionamento em desenvolvimento.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card className="barbershop-card">
                <CardHeader>
                  <CardTitle>Relatórios e Estatísticas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Relatórios detalhados em desenvolvimento.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;