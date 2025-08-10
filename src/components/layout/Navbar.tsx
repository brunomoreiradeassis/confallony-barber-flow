import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Scissors, User, Calendar, LogOut, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="bg-background border-b border-border fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo/Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <Scissors className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-bold">BarberShop</span>
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center justify-center flex-1 space-x-8 mx-8">
            <Link to="/services" className="text-foreground hover:text-primary transition-colors">
              Serviços
            </Link>
            <Link to="/booking" className="text-foreground hover:text-primary transition-colors">
              Agendar
            </Link>
            <Link to="/queue" className="text-foreground hover:text-primary transition-colors">
              Fila
            </Link>
            {userData?.isAdmin && (
              <Link to="/admin" className="text-foreground hover:text-primary transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* Desktop Profile Dropdown - Right */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userData?.avatar_url} />
                      <AvatarFallback>
                        {userData?.nome ? getInitials(userData.nome) : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{userData?.nome.split(' ')[0]}</span>
                      <span className="text-xs text-muted-foreground">Minha conta</span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="p-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={userData?.avatar_url} />
                        <AvatarFallback>
                          {userData?.nome ? getInitials(userData.nome) : <User className="h-5 w-5" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{userData?.nome}</p>
                        <p className="text-xs text-muted-foreground">{userData?.email}</p>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="w-full">
                      <User className="mr-2 h-4 w-4" />
                      Meu perfil
                    </Link>
                  </DropdownMenuItem>
                  {userData?.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="w-full">
                        <Settings className="mr-2 h-4 w-4" />
                        Painel Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">
                    Entrar
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" className="btn-hero">
                    Cadastrar
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={toggleMenu}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-card border-t border-border">
              <Link
                to="/services"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={toggleMenu}
              >
                Serviços
              </Link>
              <Link
                to="/booking"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={toggleMenu}
              >
                Agendar
              </Link>
              <Link
                to="/queue"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={toggleMenu}
              >
                Fila
              </Link>
              {userData?.isAdmin && (
                <Link
                  to="/admin"
                  className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                  onClick={toggleMenu}
                >
                  Admin
                </Link>
              )}
              
              <div className="border-t border-border pt-4">
                {currentUser ? (
                  <>
                    <div className="flex items-center px-3 py-2 mb-2">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={userData?.avatar_url} />
                        <AvatarFallback>
                          {userData?.nome ? getInitials(userData.nome) : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{userData?.nome}</p>
                        <p className="text-xs text-muted-foreground">{userData?.email}</p>
                      </div>
                    </div>
                    <Link to="/profile" onClick={toggleMenu}>
                      <Button variant="ghost" className="w-full justify-start mb-2">
                        <User className="h-4 w-4 mr-2" />
                        Meu perfil
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => {
                        handleLogout();
                        toggleMenu();
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={toggleMenu}>
                      <Button variant="ghost" className="w-full mb-2">
                        Entrar
                      </Button>
                    </Link>
                    <Link to="/register" onClick={toggleMenu}>
                      <Button className="w-full btn-hero">
                        Cadastrar
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;