import { Button } from "@/components/ui/button";
import { Calendar, Scissors, Users } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/barbershop-hero.jpg";
import confallonyLogo from "@/assets/confallony-logo-gold.png";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Gradient Fade */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Barbearia Confallony - Interior moderno e sofisticado"
          className="w-full h-full object-cover"
        />
        {/* Overlay escuro principal */}
        <div className="absolute inset-0 bg-background opacity-70"></div>
        {/* Overlay adicional para suavizar */}
        <div className="absolute inset-0 bg-gray-950/30"></div>
        {/* Gradiente de fade para o footer */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent"
          style={{ zIndex: 1 }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Logo and Main Heading */}
          <div className="space-y-6">
          <div className="flex justify-center">
              <img 
                src={confallonyLogo} 
                alt="Confallony Barbearia Logo" 
                className="h-40 sm:h-96 lg:h-96 w-auto mix-blend-lighten"
                style={{ 
                  filter: 'drop-shadow(0 0 15px rgba(218, 165, 32, 0.3))',
                  transition: 'filter 0.3s ease'
                }}
              />
            </div>
            <p className="text-xl sm:text-2xl text-foreground/90 max-w-3xl mx-auto leading-relaxed">
              Tradição, estilo e modernidade em cada corte. 
              Experimente o melhor atendimento da cidade.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/booking">
              <Button size="lg" className="btn-hero text-lg px-8 py-4">
                <Calendar className="mr-2 h-5 w-5" />
                Agendar Atendimento
              </Button>
            </Link>
            <Link to="/services">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Scissors className="mr-2 h-5 w-5" />
                Ver Serviços
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                <Users className="mr-2 h-5 w-5" />
                Cadastrar-se
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">5000+</div>
              <div className="text-muted-foreground">Clientes Satisfeitos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">12</div>
              <div className="text-muted-foreground">Serviços Premium</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">15+</div>
              <div className="text-muted-foreground">Anos de Experiência</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;