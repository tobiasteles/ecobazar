"use client"; // Obrigatório no Next.js para usar hooks e Context

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import type { Product } from "@/db/schema"; // Importando do seu novo schema

interface CartContextType {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      // Evita duplicados
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const isInCart = useCallback(
    (productId: string) => items.some((p) => p.id === productId),
    [items]
  );

  // useMemo para performance no cálculo do total
  const total = useMemo(() => {
    return items.reduce((sum, p) => sum + Number(p.price), 0);
  }, [items]);

  const count = items.length;

  return (
    <CartContext.Provider 
      value={{ 
        items, 
        addItem, 
        removeItem, 
        clearCart, 
        isInCart, 
        total, 
        count 
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return ctx;
}