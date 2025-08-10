import { useEffect, useState, useRef } from 'react';

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

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Duplicate products for infinite loop
  const cards = [...products, ...products];

  const [renderPosition, setRenderPosition] = useState(0);
  const positionRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const cardWidth = 300 + 64; // Card width + margins
    const totalWidth = cardWidth * cards.length;
    const halfWidth = totalWidth / 2;
    const speed = 60; // px/s

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

      setRenderPosition(positionRef.current);
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [cards]);

  return (
    <div className="w-full bg-background py-12 overflow-hidden">
      <h2 className="text-3xl font-bold text-center mb-8 text-primary">Our Premium Products</h2>
      <div ref={containerRef} className="w-full h-[400px] relative">
        <div
          ref={contentRef}
          className="absolute flex h-full items-center"
          style={{
            transform: `translateX(${renderPosition}px)`,
            willChange: 'transform'
          }}
        >
          {cards.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              className="mx-8 w-[300px] h-[350px] flex-shrink-0 relative group perspective-1000"
            >
              <div className="relative w-full h-full transition-transform duration-700 transform-style-preserve-3d group-hover:rotate-y-180">
                {/* Front of the card */}
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
                
                {/* Back of the card */}
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
      </div>
    </div>
  );
};

export default ProductFlipCardGallery;