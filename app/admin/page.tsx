"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Product, Reservation } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Lock,
  Package,
  ClipboardList,
  Loader2,
  Phone,
  Mail,
  ImageIcon,
  X,
  Ruler,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { UploadButton } from "@/lib/uploadthing";

const ADMIN_PASSWORD = "bazar2026";

type ReservationWithProduct = Reservation & { product?: { name: string } };

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
  const [formSize, setFormSize] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formStatus, setFormStatus] = useState("available");

  // Busca de Produtos
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      return res.json();
    },
    enabled: authenticated,
  });

  // Busca de Reservas (A parte que havia sumido)
  const { data: reservations, isLoading: reservationsLoading } = useQuery<
    ReservationWithProduct[]
  >({
    queryKey: ["admin-reservations"],
    queryFn: async () => {
      const res = await fetch("/api/reservations");
      return res.json();
    },
    enabled: authenticated,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) setAuthenticated(true);
    else toast.error("Senha incorreta.");
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setFormName("");
    setFormDescription("");
    setFormPrice("");
    setFormCategory("roupas");
    setFormSize("");
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
    setFormSize(product.size || "");
    setFormImageUrl(product.imageUrl || "");
    setFormStatus(product.status);
    setProductModal(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este item permanentemente?"))
      return;

    try {
      const res = await fetch(`/api/products/admin?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();

      toast.success("Produto removido com sucesso!");
      // Atualiza a lista de produtos na tela
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    } catch {
      toast.error("Erro ao excluir o produto.");
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formImageUrl) return toast.error("Envie uma foto!");

    setSaving(true);
    try {
      const res = await fetch("/api/products/admin", {
        method: editingProduct ? "PUT" : "POST",
        body: JSON.stringify({
          id: editingProduct?.id,
          name: formName,
          description: formDescription,
          price: parseFloat(formPrice.replace(",", ".")),
          category: formCategory,
          size: formSize,
          imageUrl: formImageUrl,
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
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <Lock className="h-6 w-6 text-teal-500 mx-auto mb-2" />
            <CardTitle>Painel Administrativo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
              />
              <Button type="submit" className="w-full bg-teal-600 text-white">
                Acessar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4">
      <header className="border-b bg-white sticky top-0 z-10 px-4 py-3 flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-lg font-bold">Painel Admin - EcoBazar</h1>
      </header>

      <main className="container py-6">
        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" /> Itens
            </TabsTrigger>
            <TabsTrigger value="reservations" className="gap-2">
              <ClipboardList className="h-4 w-4" /> Reservados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Gerenciar Itens</h2>
              <Button
                onClick={openNewProduct}
                className="bg-teal-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" /> Novo Item
              </Button>
            </div>

            <div className="border rounded-xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Foto</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tam.</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        <Loader2 className="animate-spin mx-auto text-teal-500" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    products?.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <img
                            src={p.imageUrl || ""}
                            className="h-10 w-10 rounded object-cover border"
                          />
                        </TableCell>
                        <TableCell className="font-bold">{p.name}</TableCell>
                        <TableCell className="text-xs">
                          {p.size || "-"}
                        </TableCell>
                        <TableCell>R$ {Number(p.price).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              p.status === "available" ? "outline" : "default"
                            }
                          >
                            {p.status === "available"
                              ? "Disponível"
                              : "Reservado"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* BOTÃO EDITAR */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditProduct(p)}
                            >
                              <Pencil className="h-4 w-4 text-teal-600" />
                            </Button>

                            {/* BOTÃO REMOVER (LIXEIRA) */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteProduct(p.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="reservations">
            <div className="border rounded-xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Produto Reservado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservationsLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-10">
                        <Loader2 className="animate-spin mx-auto text-teal-500" />
                      </TableCell>
                    </TableRow>
                  ) : reservations?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-10 text-gray-500"
                      >
                        Nenhuma reserva encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    reservations?.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-bold">
                          {r.customerName}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs flex flex-col">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {r.customerPhone}
                            </span>
                            <span className="flex items-center gap-1 text-gray-500">
                              <Mail className="h-3 w-3" /> {r.customerEmail}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {r.product?.name || "Item não identificado"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={productModal} onOpenChange={setProductModal}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Editar Item" : "Novo Item"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveProduct} className="space-y-4">
            {/* CAIXA DE IMAGEM CORRIGIDA */}
            <div className="space-y-2">
              <Label className="font-bold flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Foto do Produto
              </Label>
              {formImageUrl ? (
                <div className="relative h-48 w-full bg-gray-50 rounded-lg border flex items-center justify-center overflow-hidden">
                  <img
                    src={formImageUrl}
                    className="h-full w-full object-contain"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => setFormImageUrl("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-teal-100 bg-teal-50/30 rounded-lg p-8 flex flex-col items-center justify-center transition-colors hover:bg-teal-50">
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      setFormImageUrl(res[0].url);
                      toast.success("Imagem enviada!");
                    }}
                    onUploadError={(error) => {
                      toast.error(`Erro: ${error.message}`);
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Nome do Produto</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ex: Camiseta Vintage"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço (R$)</Label>
                <Input
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="0,00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Ruler className="h-3 w-3" /> Tamanho
                </Label>
                <Input
                  value={formSize}
                  onChange={(e) => setFormSize(e.target.value)}
                  placeholder="Ex: G ou 42"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="roupas">Roupas</SelectItem>
                  <SelectItem value="calcados">Calçados</SelectItem>
                  <SelectItem value="brinquedos">Brinquedos</SelectItem>
                  <SelectItem value="livros">Livros</SelectItem>
                  <SelectItem value="acessorios">Acessórios</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Estado de conservação, cor, etc..."
                className="h-24"
              />
            </div>

            {editingProduct && (
              <div className="space-y-2">
                <Label>Status do Item</Label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="reserved">Reservado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-teal-600 text-white h-12 text-lg"
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="animate-spin mr-2" />
              ) : editingProduct ? (
                "Atualizar Item"
              ) : (
                "Publicar Item"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
