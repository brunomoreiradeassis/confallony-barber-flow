import { useEffect, useState, useRef } from 'react';

const InfiniteSlidingGallery = () => {
  const clients = [
    {
      id: 1,
      images: [
        '/src/assets/fotos/cliente1/cliente1-1.jpg',
        '/src/assets/fotos/cliente1/cliente1-2.jpg',
        '/src/assets/fotos/cliente1/cliente1-3.jpg',
        '/src/assets/fotos/cliente1/cliente1-4.jpg',
        '/src/assets/fotos/cliente1/cliente1-5.jpg',
        '/src/assets/fotos/cliente1/cliente1-6.jpg'
      ],
      name: '',
    },
    {
      id: 2,
      images: [
        '/src/assets/fotos/cliente2/cliente2-1.jpg',
        '/src/assets/fotos/cliente2/cliente2-2.jpg',
        '/src/assets/fotos/cliente2/cliente2-3.jpg',
        '/src/assets/fotos/cliente2/cliente2-4.jpg',
        '/src/assets/fotos/cliente2/cliente2-5.jpg',
        '/src/assets/fotos/cliente2/cliente2-6.jpg'
      ],
      name: '',
    },
    {
      id: 3,
      images: [
        '/src/assets/fotos/cliente3/cliente3-1.jpg',
        '/src/assets/fotos/cliente3/cliente3-2.jpg',
        '/src/assets/fotos/cliente3/cliente3-3.jpg',
        '/src/assets/fotos/cliente3/cliente3-4.jpg',
        '/src/assets/fotos/cliente3/cliente3-5.jpg',
        '/src/assets/fotos/cliente3/cliente3-6.jpg'
      ],
      name: '',
    },
    {
      id: 4,
      images: [
        '/src/assets/fotos/cliente4/cliente4-1.jpg',
        '/src/assets/fotos/cliente4/cliente4-2.jpg',
        '/src/assets/fotos/cliente4/cliente4-3.jpg',
        '/src/assets/fotos/cliente4/cliente4-4.jpg',
        '/src/assets/fotos/cliente4/cliente4-5.jpg',
        '/src/assets/fotos/cliente4/cliente4-6.jpg'
      ],
      name: '',
    },
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cards = [...clients, ...clients];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [renderPosition, setRenderPosition] = useState(0);
  const [paused, setPaused] = useState(false);
  const positionRef = useRef(0);

  // Troca de imagens
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Movimento infinito
  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const cardWidth = 300 + 64;
    const totalWidth = cardWidth * cards.length;
    const halfWidth = totalWidth / 2;
    const speed = 80;

    let animationFrame: number;
    let lastTimestamp = 0;

    const animate = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (!paused) {
        positionRef.current -= (speed * deltaTime) / 1000;
        if (Math.abs(positionRef.current) >= halfWidth) {
          positionRef.current += halfWidth;
        }
        setRenderPosition(positionRef.current);
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [cards, paused]);

  return (
    <div className="w-full bg-background py-20 overflow-hidden">
      <div className="text-center space-y-1">
        <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-foreground">
          Veja os resultados <span className="text-primary">dos nossos clientes</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto py-2">
          Após aquele talento na <span className="text-primary">Barbearia Confallony</span>
        </p>
      </div>

      {/* Aumentei altura do container */}
      <div ref={containerRef} className="w-full h-[800px] relative">
        <div
          ref={contentRef}
          className="absolute flex h-full items-center"
          style={{
            transform: `translateX(${renderPosition}px)`,
            willChange: 'transform'
          }}
        >
          {cards.map((client, index) => (
            <div
              key={`${client.id}-${index}`}
              className="mx-8 w-[350px] h-[500px] flex-shrink-0 relative group 
                         transition-transform duration-300 hover:scale-110"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {/* Glow gradiente espalhado por baixo */}
              <div className="absolute -inset-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0">
                <div className="w-full h-full rounded-xl bg-gradient-to-r from-pink-500 via-yellow-500 to-purple-500 
                                bg-[length:200%_200%] animate-[gradient-shift_4s_linear_infinite] blur-[100px] opacity-60">
                </div>
              </div>

              {/* Card principal */}
              <div className="relative w-full h-full overflow-hidden rounded-lg 
                              border border-gray-200 dark:border-gray-700 
                              group-hover:border-transparent transition-all duration-300 z-10">
                {client.images.map((image, imgIndex) => (
                  <div
                    key={imgIndex}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      imgIndex === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${client.name} ${imgIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configuração da animação do gradiente */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `
      }} />
    </div>
  );
};

export default InfiniteSlidingGallery;
