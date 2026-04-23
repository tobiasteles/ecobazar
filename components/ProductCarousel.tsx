"use client";

import { useEffect, useState, useCallback } from "react";
import type { Product } from "@/db/schema";
import { Badge } from "lucide-react";

interface ProductCarouselProps {
  products: Product[];
}

export function ProductCarousel({ products }: ProductCarouselProps) {
  const [current, setCurrent] = useState(0);
  
  const available = products
    .filter((p) => p.imageUrl && p.status === "available")
    .slice(0, 8);

  const next = useCallback(() => {
    if (available.length === 0) return;
    setCurrent((prev) => (prev + 1) % available.length);
  }, [available.length]);

  useEffect(() => {
    if (available.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, available.length]);

  if (available.length === 0) return null;

  return (
    <div className="relative w-full h-56 sm:h-72 md:h-80 overflow-hidden bg-green-900">
      {available.map((product, i) => (
        <div
          key={product.id}
          className="absolute inset-0 transition-all duration-1000 ease-in-out"
          style={{
            opacity: i === current ? 1 : 0,
            transform: i === current ? "scale(1)" : "scale(1.1)",
          }}
        >
          <img
            src={product.imageUrl!}
            alt={product.name}
            className="w-full h-full object-cover opacity-70"
            loading={i === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}

      {/* Gradiente ajustado para Tailwind moderno */}
      <div className="absolute inset-0 bg-gradient-to-t from-green-900 via-green-900/40 to-transparent" />
      
      <div className="absolute inset-0 flex items-end">
        <div className="container pb-8 md:pb-12 px-6">
          <Badge className="bg-teal-400 text-green-950 font-bold mb-3 border-0">Destaques do Bazar</Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white drop-shadow-md leading-tight">
            Moda com Propósito 🌱
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-teal-50 max-w-md leading-relaxed drop-shadow font-medium">
            Cada peça conta uma história. Garanta a sua online e ajude nosso projeto social.
          </p>
        </div>
      </div>

      {available.length > 1 && (
        <div className="absolute bottom-6 right-8 flex gap-2">
          {available.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-teal-400" : "w-2 bg-white/40 hover:bg-white/80"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}