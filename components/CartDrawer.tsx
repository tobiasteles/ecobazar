"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Trash2, Loader2, CheckCircle, AlertTriangle, Copy, Check } from "lucide-react";
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
  const [copied, setCopied] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const pixKey = "094.257.101-04";

  const copyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    toast.success("Chave PIX copiada!");
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setStep("cart");
    setReceiptData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: items.map((p) => p.id),
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
        }),
      });

      if (!response.ok) throw new Error("Erro ao processar reserva");

      setReceiptData({
        items: [...items],
        total,
        name,
        email,
        date: new Date().toLocaleDateString("pt-BR"),
      });
      
      setStep("success");
      onReserved();
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível finalizar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(val) => { setOpen(val); if(!val) resetForm(); }}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative border-green-100 hover:bg-green-50">
          <ShoppingCart className="h-5 w-5 text-green-700" />
          {count > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
              {count}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md flex flex-col bg-white p-0">
        <div className="flex flex-col h-full p-6">
          
          {step === "success" ? (
            <div className="flex flex-col h-full animate-in fade-in zoom-in duration-300">
              <div className="text-center py-6">
                <div className="h-16 w-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <h2 className="text-xl font-bold text-green-900">Reserva Realizada!</h2>
                <p className="text-sm text-green-600">Agora é só realizar o PIX e retirar no evento.</p>
              </div>
              <div className="flex-1 overflow-auto border-y border-dashed border-gray-200 my-4 py-4">
                <ReservationReceipt {...receiptData} />
              </div>
              <Button onClick={() => { clearCart(); setOpen(false); }} className="w-full bg-teal-500 hover:bg-teal-600">
                Concluir
              </Button>
            </div>

          ) : step === "form" ? (
            <div className="flex flex-col h-full">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-green-900">Finalizar Reserva</SheetTitle>
              </SheetHeader>

              {/* BOX DO PIX */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-blue-500 p-1.5 rounded-lg text-white">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-900 leading-tight">Pagamento via PIX</p>
                    <p className="text-[11px] text-blue-700">Para garantir seus itens, pague agora e guarde o comprovante.</p>
                  </div>
                </div>
                
                <div 
                  onClick={copyPix}
                  className="bg-white border border-blue-200 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors group"
                >
                  <div>
                    <p className="text-[9px] uppercase font-bold text-blue-400">Chave PIX (CNPJ/CPF)</p>
                    <p className="font-mono font-bold text-blue-900">{pixKey}</p>
                  </div>
                  {copied ? <Check className="h-4 w-4 text-teal-500" /> : <Copy className="h-4 w-4 text-blue-300 group-hover:text-blue-500" />}
                </div>
                
                <p className="text-[10px] text-center mt-3 text-blue-500 italic">
                  * Reservas sem pagamento expiram às 10h no dia 30/05.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-green-800">Seu Nome</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Como quer ser chamado?" required className="rounded-xl border-green-100" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-green-800">WhatsApp</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(00) 00000-0000" required className="rounded-xl border-green-100" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-green-800">E-mail</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="para receber o comprovante" required className="rounded-xl border-green-100" />
                </div>

                <div className="mt-auto pt-6 border-t border-gray-100">
                  <div className="flex justify-between mb-4">
                    <span className="text-green-700 font-medium">Total a pagar</span>
                    <span className="text-xl font-black text-teal-600">R$ {total.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-teal-500 hover:bg-teal-600 h-12 rounded-xl text-md font-bold shadow-lg shadow-teal-100">
                    {loading ? <Loader2 className="animate-spin" /> : "Confirmar e Reservar"}
                  </Button>
                  <Button variant="ghost" onClick={() => setStep("cart")} className="w-full mt-2 text-gray-400 text-xs">
                    Voltar ao carrinho
                  </Button>
                </div>
              </form>
            </div>

          ) : (
            <div className="flex flex-col h-full">
              <SheetHeader className="mb-6">
                <SheetTitle className="flex items-center gap-2 text-green-900">
                  <ShoppingCart className="h-5 w-5 text-teal-500" />
                  Carrinho
                </SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-auto -mx-2 px-2 space-y-3">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <ShoppingCart className="h-12 w-12 mb-2 opacity-10" />
                    <p className="text-sm italic">O carrinho está vazio</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                      <img src={item.imageUrl!} className="h-16 w-16 rounded-xl object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-green-900 line-clamp-1">{item.name}</p>
                        <p className="text-teal-600 font-bold">R$ {Number(item.price).toFixed(2).replace(".", ",")}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-red-300 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="pt-6 border-t border-gray-100 mt-4">
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-500 font-medium">Total</span>
                    <span className="text-xl font-black text-teal-600">R$ {total.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <Button onClick={() => setStep("form")} className="w-full bg-teal-500 hover:bg-teal-600 h-12 rounded-xl text-md font-bold">
                    Continuar
                  </Button>
                  <Button variant="ghost" onClick={clearCart} className="w-full mt-2 text-red-400 text-xs">
                    Esvaziar carrinho
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}