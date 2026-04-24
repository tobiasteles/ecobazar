"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
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
  Info,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

export default function Index() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Erro ao carregar produtos");
      return response.json();
    },
  });

  const filtered = useMemo(() => {
    if (!products) return [];

    let result = [...products];

    // 1. Filtro de Categoria (Normalizando para minúsculo)
    if (category !== "all") {
      result = result.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase(),
      );
    }

    // 2. Filtro de Busca
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)),
      );
    }

    // 3. Ordenação
    result.sort((a, b) => {
      const priceA = a.price; // doublePrecision já vem como number
      const priceB = b.price;

      switch (sort) {
        case "name_asc":
          return a.name.localeCompare(b.name, "pt-BR");
        case "price_asc":
          return priceA - priceB;
        case "price_desc":
          return priceB - priceA;
        case "newest":
        default:
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-green-100 bg-white sticky top-0 z-10 shadow-sm px-4">
        <div className="container py-3 flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-teal-500 flex items-center justify-center shadow-md overflow-hidden border border-teal-100">
            <img
              className="h-full w-full object-cover"
              src="/logo.jpeg"
              alt="Logo"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-green-900 leading-tight tracking-tight">
              EcoBazar
            </h1>
            <p className="text-[10px] sm:text-xs text-green-700 font-medium italic">
              Escola Salesiana NB · 6º Ano
            </p>
          </div>
          <CartDrawer
            onReserved={() =>
              queryClient.invalidateQueries({ queryKey: ["products"] })
            }
          />
          <Link href="/admin">
            <Button
              variant="ghost"
              size="icon"
              className="text-green-600 hover:bg-green-50 transition-colors"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4">
        {/* Banner / Carousel */}
        <section className="relative overflow-hidden bg-green-50/50 rounded-b-3xl">
          {products && products.length > 0 ? (
            <ProductCarousel products={products.slice(0, 5)} />
          ) : (
            <div className="w-full h-48 bg-teal-50 flex items-center justify-center">
              <Recycle className="h-12 w-12 text-teal-200 animate-pulse" />
            </div>
          )}
        </section>

        {/* Alerta de Regras */}
        <div className="container mt-6">
          <Alert className="bg-blue-50 border-blue-200 text-blue-800 rounded-xl">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs">
              <strong>Regra de Reserva:</strong> Itens reservados sem Pix
              expiram às 10h.
            </AlertDescription>
          </Alert>
        </div>

        {/* Stats */}
        <div className="container mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl shadow-sm border border-green-100 p-3 text-center">
              <p className="text-2xl font-bold text-green-800">{totalCount}</p>
              <p className="text-[10px] uppercase text-green-600 font-bold">
                Produtos
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-green-100 p-3 text-center">
              <p className="text-2xl font-bold text-teal-600">
                {availableCount}
              </p>
              <p className="text-[10px] uppercase text-green-600 font-bold">
                Disponíveis
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-green-100 p-3 text-center flex flex-col items-center justify-center">
              <CalendarDays className="h-5 w-5 text-blue-500" />
              <p className="text-xs font-bold text-green-900">30/05</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-green-100 p-3 text-center flex flex-col items-center justify-center">
              <MapPin className="h-5 w-5 text-blue-500" />
              <p className="text-xs font-bold text-green-900">
                Estande do 6º ano
              </p>
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="container py-8 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              <Input
                placeholder="O que você procura?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-green-100 rounded-xl"
              />
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full sm:w-48 border-green-100 rounded-xl text-green-800">
                <ArrowUpDown className="h-4 w-4 mr-2 text-green-500" />
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mais recentes</SelectItem>
                <SelectItem value="price_asc">Menor preço</SelectItem>
                <SelectItem value="price_desc">Maior preço</SelectItem>
                <SelectItem value="name_asc">A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <CategoryFilter selected={category} onChange={setCategory} />

          {/* Listagem Final */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">Nenhum produto encontrado.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-green-100 bg-green-50/50 py-6 px-4 text-center">
        <div className="flex items-center justify-center gap-1.5 text-sm text-green-700 font-medium">
          <span>Desenvolvido com</span>
          <Heart className="h-4 w-4 text-blue-500 fill-blue-500" />
          <span>pelo 6º Ano - Escola Salesiana NB</span>
        </div>
      </footer>
    </div>
  );
}
