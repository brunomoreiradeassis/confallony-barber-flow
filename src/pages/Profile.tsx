import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { updatePassword, updateEmail } from "firebase/auth";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, Mail, Wallet, Award, History, Settings } from "lucide-react";

const Profile = () => {
  const { currentUser, userData, refreshUserData } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: userData?.nome || "",
    telefone: userData?.telefone || "",
    email: userData?.email || "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleUpdateProfile = async () => {
    if (!currentUser || !userData) return;
    
    setIsLoading(true);
    try {
      const userRef = doc(db, 'usuarios', currentUser.uid);
      await updateDoc(userRef, {
        nome: formData.nome,
        telefone: formData.telefone
      });

      if (formData.email !== userData.email) {
        await updateEmail(currentUser, formData.email);
        await updateDoc(userRef, { email: formData.email });
      }

      await refreshUserData();
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram atualizadas com sucesso."
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil. Tente novamente.",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleUpdatePassword = async () => {
    if (!currentUser) return;
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(currentUser, formData.newPassword);
      setFormData(prev => ({ ...prev, newPassword: "", confirmPassword: "" }));
      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi alterada com sucesso."
      });
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Erro",
        description: "Erro ao alterar senha. Faça login novamente e tente.",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  if (!userData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Carregando perfil...</h2>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-muted/30 py-20">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          {/* Profile Header */}
          <Card className="barbershop-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userData.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {userData.nome.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-3xl font-playfair font-bold">{userData.nome}</h1>
                  <p className="text-muted-foreground">{userData.email}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <Badge variant="secondary" className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Saldo: R$ {userData.saldo?.toFixed(2) || "0,00"}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      {userData.pontos_fidelidade || 0} pontos
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Histórico
              </TabsTrigger>
              <TabsTrigger value="wallet" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Carteira
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="barbershop-card">
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="nome"
                          value={formData.nome}
                          onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="telefone"
                          value={formData.telefone}
                          onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="email">E-mail</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleUpdateProfile} disabled={isLoading} className="btn-hero">
                    {isLoading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card className="barbershop-card">
                <CardHeader>
                  <CardTitle>Histórico de Agendamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhum agendamento encontrado.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wallet" className="space-y-6">
              <Card className="barbershop-card">
                <CardHeader>
                  <CardTitle>Carteira Virtual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-2xl font-bold mb-2">R$ {userData.saldo?.toFixed(2) || "0,00"}</h3>
                    <p className="text-muted-foreground mb-4">Saldo disponível</p>
                    <Button className="btn-hero">Adicionar Saldo</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card className="barbershop-card">
                <CardHeader>
                  <CardTitle>Alterar Senha</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handleUpdatePassword} disabled={isLoading} className="btn-hero">
                    {isLoading ? "Alterando..." : "Alterar Senha"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;