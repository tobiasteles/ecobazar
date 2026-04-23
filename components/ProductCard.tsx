"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/db/schema";
import { ShoppingCart, Shirt, Footprints, Gamepad2, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const categoryLabels: Record<string, string> = {
  roupas: "Roupas",
  calcados: "Calçados",
  brinquedos: "Brinquedos",
};

const categoryIcons: Record<string, React.ReactNode> = {
  roupas: <Shirt className="h-3.5 w-3.5" />,
  calcados: <Footprints className="h-3.5 w-3.5" />,
  brinquedos: <Gamepad2 className="h-3.5 w-3.5" />,
};

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem, removeItem, isInCart } = useCart();
  const isReserved = product.status === "reserved";
  const inCart = isInCart(product.id);

  const handleToggleCart = () => {
    if (isReserved) return;
    if (inCart) {
      removeItem(product.id);
      toast.info(`${product.name} removido`);
    } else {
      addItem(product);
      toast.success(`${product.name} no carrinho!`);
    }
  };

  return (
    <Card
      className="overflow-hidden border-green-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group bg-white rounded-2xl"
      // Removi opacity-0 e animate-fade-in-up que estavam escondendo o card
    >
      <div className="relative aspect-square overflow-hidden bg-green-50">
        <img
          src={product.imageUrl || "/placeholder.svg"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {isReserved && (
          <div className="absolute inset-0 bg-green-900/40 backdrop-blur-[2px] flex items-center justify-center">
            <Badge className="bg-white text-green-900 text-xs font-bold px-3 py-1 gap-1 border-0">
              <Check className="h-3 w-3" />
              Reservado
            </Badge>
          </div>
        )}

        {inCart && !isReserved && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-blue-500 border-0 gap-1 shadow-md text-white font-bold">
              <ShoppingCart className="h-3 w-3" />
              No carrinho
            </Badge>
          </div>
        )}

        <Badge
          variant="outline"
          className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-teal-700 border-teal-100 text-[10px] font-bold gap-1 shadow-sm"
        >
          {categoryIcons[product.category as keyof typeof categoryIcons]}
          {categoryLabels[product.category as keyof typeof categoryLabels]}
        </Badge>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-green-900 line-clamp-1 text-sm">{product.name}</h3>
          <p className="text-[11px] text-green-600/80 line-clamp-2 mt-1 min-h-[32px]">
            {product.description || "Peça selecionada para o bazar sustentável."}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-extrabold text-teal-700">
            R$ {Number(product.price).toFixed(2).replace(".", ",")}
          </span>

          <Button
            size="sm"
            variant={inCart ? "outline" : "default"}
            onClick={handleToggleCart}
            disabled={isReserved}
            className={`h-8 px-3 text-[11px] font-bold rounded-lg transition-all ${
              isReserved 
                ? "bg-gray-100 text-gray-400" 
                : inCart 
                  ? "border-blue-500 text-blue-500 hover:bg-blue-50" 
                  : "bg-teal-500 hover:bg-teal-600 text-white border-0 shadow-sm"
            }`}
          >
            {isReserved ? "Vendido" : inCart ? "Remover" : "Reservar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}