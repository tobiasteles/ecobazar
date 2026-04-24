"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Product, Reservation } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft, Plus, Pencil, Lock, Package, ClipboardList, Loader2, Phone, Mail, User } from "lucide-react";
import { toast } from "sonner";

const ADMIN_PASSWORD = "bazar2026";

// Tipo estendido para incluir os dados do produto na reserva
type ReservationWithProduct = Reservation & { product: { name: string } };

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [productModal, setProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCategory, setFormCategory] = useState("roupas");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formStatus, setFormStatus] = useState("available");

  // Queries
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Erro ao carregar");
      return res.json();
    },
    enabled: authenticated,
  });

  const { data: reservations, isLoading: reservationsLoading } = useQuery<ReservationWithProduct[]>({
    queryKey: ["admin-reservations"],
    queryFn: async () => {
      const res = await fetch("/api/reservations"); // Rota corrigida aqui
      if (!res.ok) throw new Error("Erro ao carregar");
      return res.json();
    },
    enabled: authenticated,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      toast.error("Senha incorreta.");
    }
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setFormName("");
    setFormDescription("");
    setFormPrice("");
    setFormCategory("roupas");
    setFormImageUrl("");
    setFormStatus("available");
    setProductModal(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormDescription(product.description || "");
    setFormPrice(String(product.price));
    setFormCategory(product.category);
    setFormImageUrl(product.imageUrl || "");
    setFormStatus(product.status);
    setProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(formPrice.replace(",", "."));
    setSaving(true);
    try {
      // Nota: Você precisará criar uma rota /api/products/admin para POST/PUT se ainda não tiver
      const res = await fetch("/api/products/admin", {
        method: editingProduct ? "PUT" : "POST",
        body: JSON.stringify({
          id: editingProduct?.id,
          name: formName.trim(),
          description: formDescription.trim(),
          price,
          category: formCategory,
          imageUrl: formImageUrl.trim(),
          status: formStatus,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Sucesso!");
      setProductModal(false);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
        <Card className="w-full max-w-sm border-green-100 shadow-xl">
          <CardHeader className="text-center">
            <div className="h-12 w-12 rounded-xl bg-teal-500 flex items-center justify-center mx-auto mb-2 shadow-md">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-green-900 font-bold">Painel Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-pass" className="text-green-800">Senha de Acesso</Label>
                <Input id="admin-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="border-green-100" autoFocus />
              </div>
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 font-bold">Entrar</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-green-100 bg-white sticky top-0 z-10 px-4">
        <div className="container py-3 flex items-center gap-3">
          <Link href="/"><Button variant="ghost" size="icon" className="text-green-600"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-green-900 leading-tight">Painel Admin</h1>
            <p className="text-xs text-green-600">EcoBazar · 6º Ano</p>
          </div>
        </div>
      </header>

      <main className="container py-6 px-4">
        <Tabs defaultValue="products">
          <TabsList className="mb-6 bg-green-50 border border-green-100">
            <TabsTrigger value="products" className="gap-2"><Package className="h-4 w-4" /> Produtos</TabsTrigger>
            <TabsTrigger value="reservations" className="gap-2"><ClipboardList className="h-4 w-4" /> Reservas</TabsTrigger>
          </TabsList>

          {/* ABA DE PRODUTOS */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-green-700 font-medium">{products?.length ?? 0} itens</p>
              <Button onClick={openNewProduct} className="bg-teal-600 hover:bg-teal-700"><Plus className="h-4 w-4 mr-2" /> Novo Produto</Button>
            </div>
            {productsLoading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-500" /></div> : (
              <div className="rounded-lg border border-green-100 overflow-hidden">
                <Table>
                  <TableHeader className="bg-green-50">
                    <TableRow><TableHead>Imagem</TableHead><TableHead>Nome</TableHead><TableHead>Preço</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ação</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {products?.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell><img src={p.imageUrl || "/placeholder.svg"} className="h-10 w-10 rounded object-cover" /></TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>R$ {Number(p.price).toFixed(2).replace(".", ",")}</TableCell>
                        <TableCell><Badge className={p.status === "available" ? "bg-teal-500" : "bg-blue-500"}>{p.status === "available" ? "Disponível" : "Reservado"}</Badge></TableCell>
                        <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => openEditProduct(p)}><Pencil className="h-4 w-4" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* ABA DE RESERVAS - AQUI ESTÁ A NOVIDADE */}
          <TabsContent value="reservations">
            <div className="mb-4">
              <p className="text-sm text-green-700 font-medium">{reservations?.length ?? 0} reservas efetuadas</p>
            </div>
            {reservationsLoading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-500" /></div> : (
              <div className="rounded-lg border border-green-100 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-green-50">
                    <TableRow>
                      <TableHead className="text-green-900">Cliente</TableHead>
                      <TableHead className="text-green-900">Contato</TableHead>
                      <TableHead className="text-green-900">Produto</TableHead>
                      <TableHead className="text-green-900">Data/Hora</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations?.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-10 text-gray-400">Nenhuma reserva encontrada.</TableCell></TableRow>
                    ) : (
                      reservations?.map((r) => (
                        <TableRow key={r.id} className="hover:bg-green-50/30">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-teal-500" />
                              <span className="font-bold text-green-900">{r.customerName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 text-xs">
                              <div className="flex items-center gap-1.5 text-green-700"><Phone className="h-3 w-3" /> {r.customerPhone}</div>
                              <div className="flex items-center gap-1.5 text-green-700"><Mail className="h-3 w-3" /> {r.customerEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-teal-200 text-teal-700 bg-teal-50">
                              {r.product?.name || "Produto excluído"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">
                            {new Date(r.reservedAt).toLocaleString("pt-BR")}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal de Produto permanece igual... */}
      <Dialog open={productModal} onOpenChange={setProductModal}>
        <DialogContent className="sm:max-w-lg border-green-100">
          <DialogHeader>
            <DialogTitle className="text-green-900">{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveProduct} className="space-y-4">
             <div className="space-y-2">
               <Label className="text-green-800">Nome do Produto *</Label>
               <Input value={formName} onChange={(e) => setFormName(e.target.value)} required className="border-green-100" />
             </div>
             <div className="space-y-2">
               <Label className="text-green-800">Descrição</Label>
               <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="border-green-100" />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label className="text-green-800">Preço (R$) *</Label>
                 <Input value={formPrice} onChange={(e) => setFormPrice(e.target.value)} required className="border-green-100" />
               </div>
               <div className="space-y-2">
                 <Label className="text-green-800">Categoria</Label>
                 <Select value={formCategory} onValueChange={setFormCategory}>
                   <SelectTrigger className="border-green-100"><SelectValue /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="roupas">Roupas</SelectItem>
                     <SelectItem value="calcados">Calçados</SelectItem>
                     <SelectItem value="brinquedos">Brinquedos</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             </div>
             <div className="space-y-2">
               <Label className="text-green-800">URL da Imagem</Label>
               <Input value={formImageUrl} onChange={(e) => setFormImageUrl(e.target.value)} className="border-green-100" />
             </div>
             <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 font-bold" disabled={saving}>
               {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               {editingProduct ? "Salvar Alterações" : "Cadastrar Produto"}
             </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}