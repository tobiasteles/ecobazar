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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft, Plus, Pencil, Lock, Package, ClipboardList, Loader2, Phone, Mail, User, Trash2 } from "lucide-react";
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

  // NOVA FUNÇÃO: DELETAR
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este item permanentemente?")) return;

    try {
      const res = await fetch(`/api/products/admin?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      toast.success("Item removido com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch {
      toast.error("Erro ao excluir item.");
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

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-green-700 font-medium">{products?.length ?? 0} itens</p>
              <Button onClick={openNewProduct} className="bg-teal-600 hover:bg-teal-700"><Plus className="h-4 w-4 mr-2" /> Novo Produto</Button>
            </div>
            {productsLoading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal-500" /></div> : (
              <div className="rounded-lg border border-green-100 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-green-50">
                    <TableRow>
                      <TableHead>Imagem</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products?.map((p) => (
                      <TableRow key={p.id} className="hover:bg-green-50/20">
                        <TableCell><img src={p.imageUrl || "/placeholder.svg"} className="h-10 w-10 rounded object-cover border" /></TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>R$ {Number(p.price).toFixed(2).replace(".", ",")}</TableCell>
                        <TableCell>
                          <Badge className={p.status === "available" ? "bg-teal-500" : "bg-blue-500"}>
                            {p.status === "available" ? "Disponível" : "Reservado"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="text-teal-600 hover:bg-teal-50" onClick={() => openEditProduct(p)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteProduct(p.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* ... restante do componente reservations igual ao anterior ... */}
          <TabsContent value="reservations">
            {/* O código das reservas que te mandei antes deve ser mantido aqui */}
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal Dialog igual... */}
      <Dialog open={productModal} onOpenChange={setProductModal}>
        {/* ... conteúdo do dialog igual ao que você já tem ... */}
      </Dialog>
    </div>
  );
}