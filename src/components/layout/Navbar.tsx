import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Scissors, User, Calendar, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import confallonyLogo from "@/assets/confallony-logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This will be managed by auth context later

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar-glass fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src={confallonyLogo} 
              alt="Confallony Logo" 
              className="h-10 w-auto"
            />
            <span className="text-xl font-playfair font-bold text-foreground">
              Barbearia <span className="text-primary">Confallony</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Início
            </Link>
            <Link to="/services" className="text-foreground hover:text-primary transition-colors">
              Serviços
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">
              Sobre
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
              Contato
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Perfil
                  </Button>
                </Link>
                <Link to="/booking">
                  <Button variant="default" size="sm" className="btn-hero">
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => setIsLoggedIn(false)}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm" className="btn-hero">
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
                to="/"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={toggleMenu}
              >
                Início
              </Link>
              <Link
                to="/services"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={toggleMenu}
              >
                Serviços
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={toggleMenu}
              >
                Sobre
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={toggleMenu}
              >
                Contato
              </Link>
              
              <div className="border-t border-border pt-4">
                {isLoggedIn ? (
                  <>
                    <Link to="/profile" onClick={toggleMenu}>
                      <Button variant="ghost" className="w-full justify-start mb-2">
                        <User className="h-4 w-4 mr-2" />
                        Perfil
                      </Button>
                    </Link>
                    <Link to="/booking" onClick={toggleMenu}>
                      <Button className="w-full btn-hero mb-2">
                        <Calendar className="h-4 w-4 mr-2" />
                        Agendar
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => {
                        setIsLoggedIn(false);
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