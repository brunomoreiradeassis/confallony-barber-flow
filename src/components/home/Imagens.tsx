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

  // Mantém as imagens duplicadas para loop contínuo
  const cards = [...clients, ...clients];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [renderPosition, setRenderPosition] = useState(0);

  // Ref para posição interna sem re-render
  const positionRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const cardWidth = 300 + 64; // Largura do card + margens
    const totalWidth = cardWidth * cards.length;
    const halfWidth = totalWidth / 2;
    const speed = 80; // px/s

    let animationFrame: number;
    let lastTimestamp = 0;

    const animate = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      positionRef.current -= (speed * deltaTime) / 1000;

      if (Math.abs(positionRef.current) >= halfWidth) {
        positionRef.current += halfWidth;
      }

      // Atualiza a posição para renderização
      setRenderPosition(positionRef.current);

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [cards]);

  return (
    <div className="w-full bg-background py-12 overflow-hidden">
      <div ref={containerRef} className="w-full h-[400px] relative">
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
              className="mx-8 w-[300px] h-[350px] flex-shrink-0 relative group"
            >
              <div className="relative w-full h-full overflow-hidden rounded-lg">
                {client.images.map((image, imgIndex) => (
                  <div
                    key={imgIndex}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      imgIndex === currentImageIndex
                        ? 'opacity-100'
                        : 'opacity-0'
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
    </div>
  );
};

export default InfiniteSlidingGallery;
