"use client";

import { useEffect, useState, useCallback } from "react";
import type { Product } from "@/db/schema"; // Importando do Drizzle

interface ProductCarouselProps {
  products: Product[];
}

export function ProductCarousel({ products }: ProductCarouselProps) {
  const [current, setCurrent] = useState(0);
  
  // Filtra produtos com imagem e disponíveis (Drizzle usa imageUrl e camelCase)
  const available = products
    .filter((p) => p.imageUrl && p.status === "available")
    .slice(0, 10);

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
    <div className="relative w-full h-48 sm:h-64 md:h-72 overflow-hidden bg-green-900">
      {available.map((product, i) => (
        <div
          key={product.id}
          className="absolute inset-0 transition-all duration-700 ease-in-out"
          style={{
            opacity: i === current ? 1 : 0,
            transform: i === current ? "scale(1)" : "scale(1.05)",
          }}
        >
          <img
            src={product.imageUrl!}
            alt={product.name}
            className="w-full h-full object-cover opacity-80" // Leve opacidade para o gradiente agir
            loading={i === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}

      {/* Gradiente: Verde Escuro -> Azul Marinho -> Transparente */}
      <div className="absolute inset-0 bg-linear-to-t from-green-900/90 via-blue-900/40 to-transparent" />
      
      <div className="absolute inset-0 flex items-end">
        <div className="container pb-6 md:pb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
            Bazar Escolar Sustentável 🌱
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-teal-50 max-w-lg leading-relaxed drop-shadow">
            Roupas, calçados e brinquedos a preços acessíveis. Reserve online e retire na 
            <span className="font-semibold text-teal-300"> Escola Salesiana!</span>
          </p>
        </div>
      </div>

      {/* Indicadores (Dots) em Branco/Verde Água */}
      {available.length > 1 && (
        <div className="absolute bottom-4 right-6 flex gap-1.5">
          {available.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-teal-400" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Ir para slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}