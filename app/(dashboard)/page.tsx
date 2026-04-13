"use client"; // Importante: Componente interativo com hooks

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// Inserido import do tipo do Drizzle que criamos antes
import type { Product } from "@/db/schema";
import { ProductCard } from "@/components/ProductCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductCarousel } from "@/components/ProductCarousel";
import {
  Loader2,
  Recycle,
  Search,
  ArrowUpDown,
  Settings,
  CalendarDays,
  MapPin,
  Heart,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link"; // No Next.js usamos o link do next/link

type SortOption =
  | "name_asc"
  | "name_desc"
  | "price_asc"
  | "price_desc"
  | "newest";

export default function Index() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const queryClient = useQueryClient();

  // Substituímos a chamada direta do Supabase por um fetch para sua API do Next.js
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Erro ao carregar produtos");
      return response.json();
    },
  });

  const filtered = useMemo(() => {
    let result = products ?? [];
    if (category !== "all")
      result = result.filter((p) => p.category === category);

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)),
      );
    }

    result = [...result].sort((a, b) => {
      switch (sort) {
        case "name_asc":
          return a.name.localeCompare(b.name, "pt-BR");
        case "name_desc":
          return b.name.localeCompare(a.name, "pt-BR");
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        default:
          // Ajuste para lidar com o objeto Date do Drizzle/Postgres
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });
    return result;
  }, [products, category, search, sort]);

  const availableCount =
    products?.filter((p) => p.status === "available").length ?? 0;
  const totalCount = products?.length ?? 0;

  const handleReserved = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    // Fundo principal: Branco
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header com fundo branco e borda verde sutil */}
      <header className="border-b border-green-100 bg-white sticky top-0 z-10 shadow-sm">
        <div className="container py-3 flex items-center gap-3">
          {/* Ícone: Fundo Verde Água, Ícone Branco */}
          <div className="h-11 w-11 rounded-xl bg-teal-500 flex items-center justify-center shadow-md">
            <Recycle className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            {/* Título: Verde Escuro */}
            <h1 className="text-lg font-bold text-green-900 leading-tight">
              EcoBazar
            </h1>
            {/* Subtítulo: Verde Médio */}
            <p className="text-xs text-green-700">
              Escola Salesiana do Núcleo Bandeirante· 6º Ano
            </p>
          </div>
          {/* O CartDrawer e Botão de Settings devem usar tons de azul/verde água em seus componentes internos */}
          <CartDrawer onReserved={handleReserved} />
          <Link href="/admin">
            <Button
              variant="ghost"
              size="icon"
              className="text-green-600 hover:text-green-800 hover:bg-green-50"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Seção do Carrossel com fundo Verde muito claro */}
        <section className="relative overflow-hidden bg-green-50/50">
          {products && products.length > 0 ? (
            <ProductCarousel products={products} />
          ) : (
            // Placeholder: Verde Água claro
            <div className="w-full h-48 sm:h-64 md:h-72 bg-teal-50 flex items-center justify-center">
              <Recycle className="h-16 w-16 text-teal-200" />
            </div>
          )}
        </section>

        {/* Info Cards */}
        <div className="container -mt-5 relative z-[1]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Card Produtos: Texto Verde Escuro */}
            <div className="bg-white rounded-xl shadow-md border border-green-100 p-3 text-center">
              <p className="text-2xl font-bold text-green-800">{totalCount}</p>
              <p className="text-xs text-green-600">Produtos</p>
            </div>
            {/* Card Disponíveis: Texto Verde Água */}
            <div className="bg-white rounded-xl shadow-md border border-green-100 p-3 text-center">
              <p className="text-2xl font-bold text-teal-600">
                {availableCount}
              </p>
              <p className="text-xs text-green-600">Disponíveis</p>
            </div>
            {/* Card Data: Ícone Azul */}
            <div className="bg-white rounded-xl shadow-md border border-green-100 p-3 text-center flex flex-col items-center justify-center gap-0.5">
              <CalendarDays className="h-5 w-5 text-blue-500" />
              <p className="text-xs font-semibold text-green-900">30/05</p>
              <p className="text-[10px] text-green-600">Data do evento</p>
            </div>
            {/* Card Estande: Ícone Azul */}
            <div className="bg-white rounded-xl shadow-md border border-green-100 p-3 text-center flex flex-col items-center justify-center gap-0.5">
              <MapPin className="h-5 w-5 text-blue-500" />
              <p className="text-xs font-semibold text-green-900">6º Ano</p>
              <p className="text-[10px] text-green-600">Estande</p>
            </div>
          </div>
        </div>

        <div className="container py-6 space-y-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              {/* Input com borda verde sutil e foco verde água */}
              <Input
                placeholder="Buscar produtos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-green-100 focus-visible:ring-teal-400"
              />
            </div>
            {/* Selects e Triggers devem ser ajustados em seus próprios componentes para usar azul/verde água */}
            <Select
              value={sort}
              onValueChange={(v) => setSort(v as SortOption)}
            >
              <SelectTrigger className="w-full sm:w-50 border-green-100 text-green-800">
                <ArrowUpDown className="h-4 w-4 mr-2 text-green-500" />
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mais recentes</SelectItem>
                <SelectItem value="name_asc">Nome A-Z</SelectItem>
                <SelectItem value="name_desc">Nome Z-A</SelectItem>
                <SelectItem value="price_asc">Menor preço</SelectItem>
                <SelectItem value="price_desc">Maior preço</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* O Componente CategoryFilter precisa ser ajustado para usar a nova paleta */}
          <CategoryFilter selected={category} onChange={setCategory} />

          {isLoading ? (
            <div className="flex justify-center py-20">
              {/* Loader em Verde Água */}
              <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            </div>
          ) : filtered.length > 0 ? (
            <>
              <p className="text-sm text-green-700">
                {filtered.length}{" "}
                {filtered.length === 1
                  ? "produto encontrado"
                  : "produtos encontrados"}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* O ProductCard precisa ser ajustado internamente para usar a nova paleta */}
                {filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 space-y-2">
              <Search className="h-12 w-12 text-green-200 mx-auto" />
              <p className="text-green-700">Nenhum produto encontrado.</p>
              {search && (
                <Button
                  variant="link"
                  onClick={() => setSearch("")}
                  className="text-teal-600 hover:text-teal-800"
                >
                  Limpar busca
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer com fundo verde muito claro e borda sutil */}
      <footer className="border-t border-green-100 bg-green-50/50">
        <div className="container py-6 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm text-green-700">
            <span>Feito com</span>
            {/* Coração em Azul */}
            <Heart className="h-3.5 w-3.5 text-blue-500 fill-blue-500" />
            <span>pelo 6º Ano</span>
          </div>
          <p className="text-xs text-green-600">
            © 2026 EcoBazar · Escola Salesiana
          </p>
        </div>
      </footer>
    </div>
  );
}
