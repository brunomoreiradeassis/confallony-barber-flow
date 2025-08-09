import { Button } from "@/components/ui/button";
import { Calendar, Scissors, Users } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/barbershop-hero.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Barbearia Confallony - Interior moderno e sofisticado"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient opacity-80"></div>
        <div className="absolute inset-0 bg-background/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-playfair font-bold text-foreground text-glow">
              Barbearia <span className="text-primary">Confallony</span>
            </h1>
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
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;