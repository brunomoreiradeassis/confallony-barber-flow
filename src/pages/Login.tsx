import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Basic validation
    if (!formData.email || !formData.password) {
      toast({
        title: "Erro no login",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!",
      });

      // Redirect based on user role
      const userDoc = await getDoc(doc(db, 'usuarios', userCredential.user.uid));
      if (userDoc.exists() && userDoc.data().isAdmin) {
        navigate("/admin");
      } else {
        navigate("/queue");
      }
    } catch (error: any) {
      console.error("Erro no login:", error);
      let errorMessage = "Erro no login. Verifique suas credenciais.";
      
      if (error.code === "auth/user-not-found") {
        errorMessage = "Usuário não encontrado.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Senha incorreta.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido.";
      }

      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-muted/30 py-20">
        <div className="max-w-md w-full mx-4">
          <Card className="barbershop-card">
            <CardHeader className="text-center space-y-4">
              <CardTitle className="text-3xl font-playfair font-bold">
                Entrar na <span className="text-primary">Confallony</span>
              </CardTitle>
              <p className="text-muted-foreground">
                Acesse sua conta para agendar serviços e acompanhar seu histórico
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 p-2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
                      }
                    />
                    <Label htmlFor="remember" className="text-sm">
                      Lembrar-me
                    </Label>
                  </div>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Esqueci minha senha
                  </Link>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full btn-hero"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Ou</span>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Ainda não tem uma conta?
                </p>
                <Link to="/register">
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    Criar Nova Conta
                  </Button>
                </Link>
              </div>

              {/* Quick Access */}
              <div className="border-t border-border pt-6">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Acesso rápido:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/services">
                    <Button variant="ghost" size="sm" className="w-full">
                      Ver Serviços
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button variant="ghost" size="sm" className="w-full">
                      Contato
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Login;