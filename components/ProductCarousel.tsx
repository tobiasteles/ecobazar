"use client";

import { useEffect, useState, useCallback } from "react";
import type { Product } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Leaf } from "lucide-react"; // Adicionei Leaf para o selo

interface ProductCarouselProps {
  products: Product[];
}

export function ProductCarousel({ products }: ProductCarouselProps) {
  const [current, setCurrent] = useState(0);

  // 1. Criamos os slides: Primeiro a Logo, depois os produtos disponíveis
  const slides = [
    {
      id: "logo-slide",
      name: "EcoBazar 2026",
      description: "Sustentabilidade e Educação: Projeto Pedagógico da Escola Salesiana NB.",
      imageUrl: "/logo-simbolo.jpeg", // COLOQUE O CAMINHO DA IMAGEM DO SÍMBOLO AQUI
      isLogo: true,
    },
    ...products
      .filter((p) => p.imageUrl && p.status === "available")
      .slice(0, 5) // Pegamos 5 produtos + 1 logo = 6 slides
  ];

  const next = useCallback(() => {
    if (slides.length === 0) return;
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full h-100 sm:h-112.5 overflow-hidden bg-green-950">
      {slides.map((item, i) => (
        <div
          key={item.id}
          className="absolute inset-0 transition-all duration-1000 ease-in-out"
          style={{
            opacity: i === current ? 1 : 0,
            zIndex: i === current ? 10 : 0,
          }}
        >
          {/* BACKGROUND BLURRED */}
          <div 
            className="absolute inset-0 scale-110 blur-2xl opacity-30"
            style={{
              backgroundImage: `url(${item.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />

          {/* MAIN IMAGE */}
          <div className="relative h-full w-full flex items-center justify-center p-8 sm:p-12">
            <img
              src={item.imageUrl!}
              alt={item.name}
              className={`h-full w-full max-w-4xl object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-transform duration-[6000ms] ${
                i === current ? "scale-105" : "scale-100"
              } ${'isLogo' in item ? 'max-h-[80%]' : ''}`} // Se for logo, reduz um pouco pra não bater no texto
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        </div>
      ))}

      {/* GRADIENTS */}
      <div className="absolute inset-0 z-20 bg-linear-to-t from-green-950 via-transparent to-green-950/30" />
      
      {/* CONTENT */}
      <div className="absolute inset-0 z-30 flex items-end">
        <div className="container pb-12 px-8">
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-700">
            
            {/* BADGE DINÂMICO */}
            <Badge className={`${'isLogo' in slides[current] ? 'bg-amber-400 text-amber-950' : 'bg-teal-400 text-green-950'} border-0 font-bold px-3 py-1 gap-1.5 shadow-lg`}>
              {'isLogo' in slides[current] ? <Leaf className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
              {'isLogo' in slides[current] ? 'Selo Oficial' : 'Destaque do Bazar'}
            </Badge>
            
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-5xl font-black text-white drop-shadow-2xl leading-[1.1] tracking-tight">
                {slides[current].name}
              </h2>
              <p className="mt-3 text-sm sm:text-base text-teal-50/90 max-w-md font-medium drop-shadow-md">
                {slides[current].description}
              </p>
            </div>

            {/* PREÇO SÓ APARECE SE NÃO FOR LOGO */}
            { !('isLogo' in slides[current]) && (
              <div className="pt-2">
                 <span className="text-2xl font-black text-teal-300 drop-shadow-md">
                   R$ {Number((slides[current] as Product).price).toFixed(2).replace(".", ",")}
                 </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INDICATORS */}
      <div className="absolute bottom-8 right-8 z-40 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`group relative h-1 transition-all duration-300 ${i === current ? "w-12" : "w-4"}`}
          >
            <div className={`h-full w-full rounded-full transition-all ${i === current ? "bg-teal-400" : "bg-white/30"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}