"use client"; // Importante: Componente interativo com hooks

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// Removido supabase e inserido import do tipo do Drizzle que criamos antes
import type { Product } from "@/db/schema"; 
import { ProductCard } from "@/components/ProductCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductCarousel } from "@/components/ProductCarousel";
import { Loader2, Recycle, Search, ArrowUpDown, Settings, CalendarDays, MapPin, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link"; // No Next.js usamos o link do next/link

type SortOption = "name_asc" | "name_desc" | "price_asc" | "price_desc" | "newest";

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
    if (category !== "all") result = result.filter((p) => p.category === category);
    
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) => 
          p.name.toLowerCase().includes(q) || 
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    result = [...result].sort((a, b) => {
      switch (sort) {
        case "name_asc": return a.name.localeCompare(b.name, "pt-BR");
        case "name_desc": return b.name.localeCompare(a.name, "pt-BR");
        case "price_asc": return a.price - b.price;
        case "price_desc": return b.price - a.price;
        default: 
          // Ajuste para lidar com o objeto Date do Drizzle/Postgres
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return result;
  }, [products, category, search, sort]);

  const availableCount = products?.filter((p) => p.status === "available").length ?? 0;
  const totalCount = products?.length ?? 0;

  const handleReserved = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="container py-3 flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <Recycle className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground leading-tight">EcoBazar</h1>
            <p className="text-xs text-muted-foreground">Escola Salesiana do Núcleo Bandeirante · 6º Ano</p>
          </div>
          <CartDrawer onReserved={handleReserved} />
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          {products && products.length > 0 ? (
            <ProductCarousel products={products} />
          ) : (
            <div className="w-full h-48 sm:h-64 md:h-72 bg-primary/20 flex items-center justify-center">
              <Recycle className="h-16 w-16 text-primary/30" />
            </div>
          )}
        </section>

        {/* Info Cards */}
        <div className="container -mt-5 relative z-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-card rounded-xl shadow-md border p-3 text-center">
              <p className="text-2xl font-bold text-primary">{totalCount}</p>
              <p className="text-xs text-muted-foreground">Produtos</p>
            </div>
            <div className="bg-card rounded-xl shadow-md border p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{availableCount}</p>
              <p className="text-xs text-muted-foreground">Disponíveis</p>
            </div>
            <div className="bg-card rounded-xl shadow-md border p-3 text-center flex flex-col items-center justify-center gap-0.5">
              <CalendarDays className="h-5 w-5 text-orange-500" />
              <p className="text-xs font-semibold text-foreground">30/05</p>
              <p className="text-[10px] text-muted-foreground">Data do evento</p>
            </div>
            <div className="bg-card rounded-xl shadow-md border p-3 text-center flex flex-col items-center justify-center gap-0.5">
              <MapPin className="h-5 w-5 text-orange-500" />
              <p className="text-xs font-semibold text-foreground">6º Ano</p>
              <p className="text-[10px] text-muted-foreground">Estande</p>
            </div>
          </div>
        </div>

        <div className="container py-6 space-y-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar produtos..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="pl-10" 
              />
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
              <SelectTrigger className="w-full sm:w-50">
                <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
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

          <CategoryFilter selected={category} onChange={setCategory} />

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "produto encontrado" : "produtos encontrados"}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 space-y-2">
              <Search className="h-12 w-12 text-muted-foreground/50 mx-auto" />
              <p className="text-muted-foreground">Nenhum produto encontrado.</p>
              {search && (
                <Button variant="link" onClick={() => setSearch("")} className="text-primary">
                  Limpar busca
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t bg-card">
        <div className="container py-6 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>Feito com</span>
            <Heart className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
            <span>pelo 6º Ano</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 EcoBazar · Escola Salesiana do Núcleo Bandeirante</p>
        </div>
      </footer>
    </div>
  );3
}