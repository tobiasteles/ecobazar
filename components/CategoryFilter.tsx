"use client";

import { Button } from "@/components/ui/button";
import { Shirt, Footprints, Gamepad2, LayoutGrid } from "lucide-react";

// Como você está usando Drizzle, os valores aqui batem com o seu Enums["product_category"]
const categories = [
  { value: "all", label: "Todos", icon: LayoutGrid },
  { value: "roupas", label: "Roupas", icon: Shirt },
  { value: "calcados", label: "Calçados", icon: Footprints },
  { value: "brinquedos", label: "Brinquedos", icon: Gamepad2 },
] as const;

interface CategoryFilterProps {
  selected: string;
  onChange: (cat: string) => void;
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = selected === cat.value;
        
        return (
          <Button
            key={cat.value}
            variant="outline" // Base sempre outline para um look mais limpo
            size="sm"
            onClick={() => onChange(cat.value)}
            className={`gap-1.5 transition-all duration-300 ${
              isActive 
                ? "bg-teal-500 text-white border-teal-500 hover:bg-teal-600 shadow-md" 
                : "border-green-100 text-green-700 hover:bg-green-50 hover:text-green-800"
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-teal-500"}`} />
            {cat.label}
          </Button>
        );
      })}
    </div>
  );
}