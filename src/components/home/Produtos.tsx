import { useRef, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
}

const ProductFlipCardGallery = () => {
  const products: Product[] = [
    {
      id: 1,
      name: 'Barber Premium Shaving Kit',
      price: 89.99,
      image: 'https://m.media-amazon.com/images/I/71W5h9YVxQL._AC_UF1000,1000_QL80_.jpg',
      description: 'Complete shaving set with badger hair brush, safety razor, and premium shaving soap'
    },
    {
      id: 2,
      name: 'Beard Oil - Sandalwood',
      price: 24.99,
      image: 'https://m.media-amazon.com/images/I/61lZz6+1p+L._AC_UF1000,1000_QL80_.jpg',
      description: 'Nourishing beard oil with natural sandalwood fragrance and jojoba oil'
    },
    {
      id: 3,
      name: 'Professional Barber Clippers',
      price: 129.99,
      image: 'https://m.media-amazon.com/images/I/71x0RrYQ1QL._AC_UF1000,1000_QL80_.jpg',
      description: 'Cordless hair clippers with titanium blades and multiple guide combs'
    },
    {
      id: 4,
      name: 'Charcoal Face Scrub',
      price: 19.99,
      image: 'https://m.media-amazon.com/images/I/61+6mQ2QqJL._AC_UF1000,1000_QL80_.jpg',
      description: 'Deep cleansing face scrub with activated charcoal for men'
    },
    {
      id: 5,
      name: 'Boar Bristle Hair Brush',
      price: 34.99,
      image: 'https://m.media-amazon.com/images/I/71eG+FyXHmL._AC_UF1000,1000_QL80_.jpg',
      description: 'Natural boar bristle brush for hair styling and scalp massage'
    },
    {
      id: 6,
      name: 'After Shave Balm',
      price: 29.99,
      image: 'https://m.media-amazon.com/images/I/61QdYwV1XzL._AC_UF1000,1000_QL80_.jpg',
      description: 'Soothing post-shave balm with aloe vera and vitamin E'
    }
  ];

  const scrollRef = useRef<HTMLDivElement>(null);

  // Habilita rolagem horizontal com a roda do mouse
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // Drag-to-scroll
  let isDown = false;
  let startX: number;
  let scrollLeft: number;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDown = true;
    scrollRef.current.classList.add("cursor-grabbing");
    startX = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown = false;
    scrollRef.current?.classList.remove("cursor-grabbing");
  };

  const handleMouseUp = () => {
    isDown = false;
    scrollRef.current?.classList.remove("cursor-grabbing");
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="w-full bg-background py-12 overflow-hidden">
      {/* Header */}
      <div className="text-center space-y-4 mb-5">
          <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-foreground">
            Veja os nossos <span className="text-primary">produtos a venda</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sessão de produtos para você adquirir e usar no dia a dia
          </p>
        </div>
      <div
        ref={scrollRef}
        className="w-full h-[400px] flex gap-8 overflow-x-auto px-8 select-none cursor-grab no-scrollbar"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[300px] h-[350px] flex-shrink-0 relative group perspective-1000"
          >
            <div className="relative w-full h-full transition-transform duration-700 transform-style-preserve-3d group-hover:rotate-y-180">
              {/* Frente */}
              <div className="absolute w-full h-full backface-hidden bg-white rounded-lg shadow-lg overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-3/4 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold truncate">{product.name}</h3>
                  <p className="text-xl font-bold text-primary">${product.price.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">Click to see details</p>
                </div>
              </div>
              
              {/* Verso */}
              <div className="absolute w-full h-full backface-hidden bg-gray-50 rounded-lg shadow-lg rotate-y-180 p-6 flex flex-col">
                <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                <p className="text-gray-600 flex-grow">{product.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</span>
                  <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CSS para ocultar a barra de rolagem */}
      <style>{`
        .no-scrollbar {
          scrollbar-width: none; /* Firefox */
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari */
        }
      `}</style>
    </div>
  );
};

export default ProductFlipCardGallery;
