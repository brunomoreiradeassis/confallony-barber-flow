import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, DollarSign, Package } from "lucide-react";

interface Product {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  categoria: string;
  ativo: boolean;
}

const ProductManagement = () => {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    estoque: "",
    categoria: ""
  });

  const categorias = [
    "Pomadas",
    "Shampoos",
    "Condicionadores",
    "Óleos para Barba",
    "Bálsamos",
    "Perfumes",
    "Acessórios",
    "Outros"
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "produtos"));
      const productsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsList);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.nome || !formData.preco || !formData.categoria) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    try {
      const productData = {
        nome: formData.nome,
        descricao: formData.descricao,
        preco: parseFloat(formData.preco),
        estoque: parseInt(formData.estoque) || 0,
        categoria: formData.categoria,
        ativo: true,
        dataAtualizacao: new Date()
      };

      if (editingProduct) {
        await updateDoc(doc(db, "produtos", editingProduct.id), productData);
        toast({
          title: "Sucesso!",
          description: "Produto atualizado com sucesso."
        });
      } else {
        await addDoc(collection(db, "produtos"), {
          ...productData,
          dataCriacao: new Date()
        });
        toast({
          title: "Sucesso!",
          description: "Produto criado com sucesso."
        });
      }

      setFormData({ nome: "", descricao: "", preco: "", estoque: "", categoria: "" });
      setEditingProduct(null);
      setIsDialogOpen(false);
      await loadProducts();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar produto.",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      nome: product.nome,
      descricao: product.descricao,
      preco: product.preco.toString(),
      estoque: product.estoque.toString(),
      categoria: product.categoria
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      await deleteDoc(doc(db, "produtos", productId));
      toast({
        title: "Sucesso!",
        description: "Produto excluído com sucesso."
      });
      await loadProducts();
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir produto.",
        variant: "destructive"
      });
    }
  };

  const handleSale = async (product: Product) => {
    if (product.estoque <= 0) {
      toast({
        title: "Erro",
        description: "Produto sem estoque.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Atualizar estoque
      await updateDoc(doc(db, "produtos", product.id), {
        estoque: product.estoque - 1,
        dataAtualizacao: new Date()
      });

      // Registrar venda
      await addDoc(collection(db, "vendas"), {
        produtoId: product.id,
        nomeProduto: product.nome,
        preco: product.preco,
        clienteId: userData?.uid,
        nomeCliente: userData?.nome,
        dataVenda: new Date(),
        formaPagamento: "local" // Pagamento no local
      });

      toast({
        title: "Venda registrada!",
        description: `${product.nome} vendido com sucesso.`
      });

      await loadProducts();
    } catch (error) {
      console.error("Erro ao registrar venda:", error);
      toast({
        title: "Erro",
        description: "Erro ao registrar venda.",
        variant: "destructive"
      });
    }
  };

  const toggleProductStatus = async (product: Product) => {
    try {
      await updateDoc(doc(db, "produtos", product.id), {
        ativo: !product.ativo,
        dataAtualizacao: new Date()
      });
      await loadProducts();
      toast({
        title: "Sucesso!",
        description: `Produto ${product.ativo ? 'desativado' : 'ativado'} com sucesso.`
      });
    } catch (error) {
      console.error("Erro ao alterar status do produto:", error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do produto.",
        variant: "destructive"
      });
    }
  };

  if (!userData?.isAdmin) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
            <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-muted/30 py-20">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-playfair font-bold">Gerenciamento de Produtos</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="btn-hero flex items-center gap-2"
                  onClick={() => {
                    setEditingProduct(null);
                    setFormData({ nome: "", descricao: "", preco: "", estoque: "", categoria: "" });
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Novo Produto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? "Editar Produto" : "Novo Produto"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome do Produto *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: Pomada Modeladora"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria *</Label>
                    <select
                      id="categoria"
                      value={formData.categoria}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      required
                    >
                      <option value="">Selecione uma categoria</option>
                      {categorias.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descrição do produto..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preco">Preço (R$) *</Label>
                      <Input
                        id="preco"
                        type="number"
                        step="0.01"
                        value={formData.preco}
                        onChange={(e) => setFormData(prev => ({ ...prev, preco: e.target.value }))}
                        placeholder="15.00"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estoque">Estoque</Label>
                      <Input
                        id="estoque"
                        type="number"
                        value={formData.estoque}
                        onChange={(e) => setFormData(prev => ({ ...prev, estoque: e.target.value }))}
                        placeholder="10"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="btn-hero" disabled={isLoading}>
                      {isLoading ? "Salvando..." : editingProduct ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="barbershop-card">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{product.nome}</CardTitle>
                    <Badge variant={product.ativo ? "default" : "secondary"}>
                      {product.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {product.categoria}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.descricao && (
                    <p className="text-muted-foreground text-sm">{product.descricao}</p>
                  )}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-primary">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">R$ {product.preco.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>{product.estoque} un.</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleSale(product)}
                      disabled={product.estoque <= 0 || !product.ativo}
                      className="flex-1"
                    >
                      Vender
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={product.ativo ? "secondary" : "default"}
                      size="sm"
                      onClick={() => toggleProductStatus(product)}
                      className="flex-1"
                    >
                      {product.ativo ? "Desativar" : "Ativar"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {products.length === 0 && (
            <Card className="barbershop-card">
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground">
                  <div className="mb-4">Nenhum produto cadastrado ainda.</div>
                  <p>Clique em "Novo Produto" para começar.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductManagement;