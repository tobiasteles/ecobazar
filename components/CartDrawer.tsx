"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
// Removido Supabase, usaremos uma action futuramente
import { ShoppingCart, Trash2, Loader2, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";
import { ReservationReceipt } from "@/components/ReservationReceipt";

interface CartDrawerProps {
  onReserved: () => void;
}

export function CartDrawer({ onReserved }: CartDrawerProps) {
  const { items, removeItem, clearCart, total, count } = useCart();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"cart" | "form" | "success">("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    items: typeof items;
    total: number;
    name: string;
    email: string;
    date: string;
  } | null>(null);

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setStep("cart");
    setReceiptData(null);
  };

  const handleClose = (val: boolean) => {
    if (!val) resetForm();
    setOpen(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      toast.error("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      // Aqui chamaremos sua Server Action do Next.js
      const response = await fetch("/api/reservations", {
        method: "POST",
        body: JSON.stringify({
          productIds: items.map((p) => p.id),
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Erro na reserva");

      setReceiptData({
        items: [...items],
        total,
        name: name.trim(),
        email: email.trim(),
        date: new Date().toLocaleDateString("pt-BR"),
      });
      setStep("success");
      onReserved();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao reservar. Tente novamente.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    clearCart();
    handleClose(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative border-green-100 hover:bg-green-50 text-green-700">
          <ShoppingCart className="h-5 w-5" />
          {count > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-blue-500 text-white border-0 shadow-sm">
              {count}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-white">
        {step === "success" && receiptData ? (
          <div className="flex flex-col h-full">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-green-900">
                <CheckCircle className="h-5 w-5 text-teal-500" />
                Reserva confirmada!
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-auto mt-4">
              <ReservationReceipt {...receiptData} />
            </div>
            <div className="pt-4 space-y-2 border-t border-green-100">
              <Button onClick={handleDone} className="w-full bg-teal-500 hover:bg-teal-600 text-white border-0">
                Fechar
              </Button>
            </div>
          </div>
        ) : step === "form" ? (
          <div className="flex flex-col h-full">
            <SheetHeader>
              <SheetTitle className="text-green-900">Seus dados</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cart-name" className="text-green-800">Nome completo</Label>
                <Input id="cart-name" value={name} onChange={(e) => setName(e.target.value)} className="border-green-100 focus-visible:ring-teal-400" placeholder="Seu nome" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cart-phone" className="text-green-800">Telefone</Label>
                <Input id="cart-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="border-green-100 focus-visible:ring-teal-400" placeholder="(61) 99999-9999" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cart-email" className="text-green-800">E-mail</Label>
                <Input id="cart-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border-green-100 focus-visible:ring-teal-400" placeholder="seu@email.com" required />
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-sm border border-green-100">
                <p className="text-green-700">{items.length} {items.length === 1 ? "item" : "itens"}</p>
                <p className="text-lg font-bold text-teal-700">R$ {total.toFixed(2).replace(".", ",")}</p>
              </div>
              <div className="flex-1" />
              <div className="space-y-2">
                <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white border-0 shadow-md" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirmar Reserva
                </Button>
                <Button type="button" variant="ghost" className="w-full text-green-600 hover:bg-green-50" onClick={() => setStep("cart")}>
                  Voltar ao carrinho
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-green-900">
                <ShoppingCart className="h-5 w-5 text-teal-500" />
                Carrinho ({count})
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-auto mt-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-12 text-green-600/50">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Seu carrinho está vazio</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-green-50/50 border border-green-100 rounded-lg p-3">
                    <img
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.name}
                      className="h-14 w-14 rounded-md object-cover border border-green-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-green-900 truncate">{item.name}</p>
                      <p className="text-teal-600 font-bold text-sm">
                        R$ {Number(item.price).toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-400 hover:text-red-500 hover:bg-red-50" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
            {items.length > 0 && (
              <div className="pt-4 space-y-3 border-t border-green-100">
                <div className="flex justify-between items-center">
                  <span className="text-green-700">Total</span>
                  <span className="text-xl font-bold text-teal-700">R$ {total.toFixed(2).replace(".", ",")}</span>
                </div>
                <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white border-0 shadow-md" onClick={() => setStep("form")}>
                  Finalizar Reserva
                </Button>
                <Button variant="ghost" size="sm" className="w-full text-green-500 hover:bg-green-50" onClick={clearCart}>
                  Limpar carrinho
                </Button>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}