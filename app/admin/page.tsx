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
import { 
  ArrowLeft, Plus, Pencil, Lock, Package, 
  ClipboardList, Loader2, Phone, Mail, User, Trash2 
} from "lucide-react";
import { toast } from "sonner";

const ADMIN_PASSWORD = "bazar2026";

type ReservationWithProduct = Reservation & { product: { name: string } };

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [productModal, setProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  // Estados do Formulário
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCategory, setFormCategory] = useState("roupas");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formStatus, setFormStatus] = useState("available");

  // Fetch de Produtos
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Erro ao carregar");
      return res.json();
    },
    enabled: authenticated,
  });

  // Fetch de Reservas
  const { data: reservations, isLoading: reservationsLoading } = useQuery<ReservationWithProduct[]>({
    queryKey: ["admin-reservations"],
    queryFn: async () => {
      const res = await fetch("/api/reservations");
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

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.")) return;

    try {
      const res = await fetch(`/api/products/admin?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      
      toast.success("Produto removido!");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    } catch {
      toast.error("Erro ao excluir produto.");
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(formPrice.replace(",", "."));
    setSaving(true);
    try {
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
      toast.success(editingProduct ? "Produto atualizado!" : "Produto cadastrado!");
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
            <CardTitle className="text-green-900 font-bold">Painel Administrativo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-pass" className="text-green-800">Senha do Bazar</Label>
                <Input id="admin-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="border-green-100" autoFocus />
              </div>
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 font-bold">Acessar</Button>
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
            <h1 className="text-lg font-bold text-green-900">Painel Admin</h1>
            <p className="text-xs text-green-600 font-medium">Controle de Inventário e Reservas</p>
          </div>
        </div>
      </header>

      <main className="container py-6 px-4">
        <Tabs defaultValue="products">
          <TabsList className="mb-6 bg-green-50 border border-green-100 p-1">
            <TabsTrigger value="products" className="gap-2 px-6"><Package className="h-4 w-4" /> Produtos</TabsTrigger>
            <TabsTrigger value="reservations" className="gap-2 px-6"><ClipboardList className="h-4 w-4" /> Reservas</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center bg-green-50/50 p-3 rounded-lg border border-green-100">
              <p className="text-sm text-green-800 font-semibold">{products?.length ?? 0} Itens Cadastrados</p>
              <Button onClick={openNewProduct} className="bg-teal-600 hover:bg-teal-700 shadow-sm"><Plus className="h-4 w-4 mr-2" /> Novo Item</Button>
            </div>

            {productsLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-500" /></div>
            ) : (
              <div className="rounded-xl border border-green-100 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-green-50">
                    <TableRow>
                      <TableHead className="w-[80px]">Foto</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products?.map((p) => (
                      <TableRow key={p.id} className="hover:bg-green-50/30">
                        <TableCell><img src={p.imageUrl || "/placeholder.svg"} className="h-10 w-10 rounded-md object-cover border border-green-100" /></TableCell>
                        <TableCell className="font-bold text-green-900">{p.name}</TableCell>
                        <TableCell className="font-medium">R$ {Number(p.price).toFixed(2).replace(".", ",")}</TableCell>
                        <TableCell>
                          <Badge className={p.status === "available" ? "bg-teal-500 text-white" : "bg-blue-500 text-white"}>
                            {p.status === "available" ? "Disponível" : "Reservado"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditProduct(p)} className="text-teal-600 hover:bg-teal-50"><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(p.id)} className="text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reservations">
            <div className="mb-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-blue-800 text-sm font-semibold">
              Total de {reservations?.length ?? 0} reservas confirmadas
            </div>
            {reservationsLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-500" /></div>
            ) : (
              <div className="rounded-xl border border-green-100 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-green-50">
                    <TableRow>
                      <TableHead className="text-green-900 font-bold">Cliente</TableHead>
                      <TableHead className="text-green-900 font-bold">Contato</TableHead>
                      <TableHead className="text-green-900 font-bold">Produto</TableHead>
                      <TableHead className="text-green-900 font-bold">Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations?.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-20 text-gray-400">Nenhuma reserva até o momento.</TableCell></TableRow>
                    ) : (
                      reservations?.map((r) => (
                        <TableRow key={r.id} className="hover:bg-green-50/20">
                          <TableCell className="font-bold text-green-900">{r.customerName}</TableCell>
                          <TableCell>
                            <div className="text-xs space-y-1">
                              <div className="flex items-center gap-1.5 text-green-700 font-medium"><Phone className="h-3 w-3" /> {r.customerPhone}</div>
                              <div className="flex items-center gap-1.5 text-gray-500"><Mail className="h-3 w-3" /> {r.customerEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline" className="border-teal-200 text-teal-700">{r.product?.name || "Item Excluído"}</Badge></TableCell>
                          <TableCell className="text-xs text-gray-400 font-medium">{new Date(r.reservedAt).toLocaleDateString("pt-BR")}</TableCell>
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

      {/* MODAL DE PRODUTO */}
      <Dialog open={productModal} onOpenChange={setProductModal}>
        <DialogContent className="sm:max-w-lg border-green-100 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-green-900 text-xl font-black">{editingProduct ? "Editar Item" : "Novo Item"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveProduct} className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label className="text-green-800 font-bold">Nome do Produto</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} required placeholder="Ex: Camiseta Vintage" className="border-green-100" />
            </div>
            <div className="space-y-2">
              <Label className="text-green-800 font-bold">Descrição (Tamanho, Estado...)</Label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Ex: Tamanho M, em ótimo estado." className="border-green-100 resize-none h-24" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-green-800 font-bold">Preço (R$)</Label>
                <Input value={formPrice} onChange={(e) => setFormPrice(e.target.value)} required placeholder="15,00" className="border-green-100" />
              </div>
              <div className="space-y-2">
                <Label className="text-green-800 font-bold">Categoria</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="border-green-100"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="roupas">Roupas</SelectItem>
                    <SelectItem value="calcados">Calçados</SelectItem>
                    <SelectItem value="acessorios">Acessórios</SelectItem>
                    <SelectItem value="brinquedos">Brinquedos</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-green-800 font-bold">Link da Foto (Supabase/URL)</Label>
              <Input value={formImageUrl} onChange={(e) => setFormImageUrl(e.target.value)} placeholder="https://..." className="border-green-100" />
            </div>
            {editingProduct && (
              <div className="space-y-2">
                <Label className="text-green-800 font-bold">Status do Item</Label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger className="border-green-100"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="reserved">Reservado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 h-12 text-lg font-black shadow-lg" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : editingProduct ? "Atualizar" : "Publicar no Bazar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}