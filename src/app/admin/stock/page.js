'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { BarChartIcon, ActivityIcon, ClockIcon } from 'lucide-react';

export default function StockPage() {
  const [stock, setStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [createFormData, setCreateFormData] = useState({
    product: '',
    initialQuantity: 0,
    currentQuantity: 0,
    isActive: true,
  });
  const [editFormData, setEditFormData] = useState({
    newSales: 0,
  });
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState({});

  useEffect(() => {
    fetchStock();
    fetchProducts();
  }, []);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stock');
      if (response.ok) {
        const data = await response.json();
        setStock(data);
      } else {
        console.error('Failed to fetch stock:', response.status);
        toast.error('Erreur lors du chargement du stock');
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
      toast.error('Erreur de connexion lors du chargement du stock');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleStatusToggle = async (stockItem) => {
    setUpdatingStatus(prev => ({ ...prev, [stockItem._id]: true }));
    
    try {
      const response = await fetch(`/api/admin/stock/${stockItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...stockItem,
          isActive: !stockItem.isActive
        }),
      });

      if (response.ok) {
        toast.success(`Stock ${!stockItem.isActive ? 'activé' : 'désactivé'} avec succès`);
        fetchStock();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [stockItem._id]: false }));
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        product: createFormData.product,
        initialQuantity: parseInt(createFormData.initialQuantity),
        currentQuantity: parseInt(createFormData.currentQuantity),
        soldQuantity: 0,
        lowStockAlert: 1, // Default to 1 instead of letting admin choose
        isActive: createFormData.isActive,
      };

      const response = await fetch('/api/admin/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Stock créé avec succès');
        setCreateDialogOpen(false);
        resetCreateForm();
        fetchStock();
      } else {
        toast.error(data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Create error:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStock) return;

    setLoading(true);

    try {
      const newSales = parseInt(editFormData.newSales) || 0;
      
      const newSoldQuantity = (selectedStock.soldQuantity || 0) + newSales;
      const newCurrentQuantity = selectedStock.currentQuantity - newSales;

      const submitData = {
        soldQuantity: newSoldQuantity,
        currentQuantity: newCurrentQuantity,
      };

      const response = await fetch(`/api/admin/stock/${selectedStock._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${newSales} vente(s) WhatsApp ajoutée(s) avec succès`);
        setEditDialogOpen(false);
        resetEditForm();
        fetchStock();
      } else {
        toast.error(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStock) return;

    try {
      const response = await fetch(`/api/admin/stock/${selectedStock._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Stock supprimé avec succès');
        setDeleteDialogOpen(false);
        setSelectedStock(null);
        fetchStock();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    }
  };

  const resetCreateForm = () => {
    setCreateFormData({
      product: '',
      initialQuantity: 0,
      currentQuantity: 0,
      isActive: true,
    });
  };

  const resetEditForm = () => {
    setEditFormData({
      newSales: 0,
    });
    setSelectedStock(null);
  };

  const openCreateDialog = () => {
    resetCreateForm();
    setCreateDialogOpen(true);
  };

  const openEditDialog = (stockItem) => {
    setSelectedStock(stockItem);
    setEditFormData({
      newSales: 0,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (stockItem) => {
    setSelectedStock(stockItem);
    setDeleteDialogOpen(true);
  };

  const openViewDrawer = (stockItem) => {
    setSelectedStock(stockItem);
    setViewDrawerOpen(true);
  };

  const getStatusBadge = (stockItem) => {
    if (!stockItem) return null;
    
    const statusConfig = {
      'in_stock': { label: 'En Stock', variant: 'default' },
      'low_stock': { label: 'Stock Faible', variant: 'secondary' },
      'out_of_stock': { label: 'Rupture', variant: 'destructive' }
    };
    
    const status = stockItem.status || 
      (stockItem.currentQuantity === 0 ? 'out_of_stock' : 
       stockItem.currentQuantity <= (stockItem.lowStockAlert || 1) ? 'low_stock' : 'in_stock');
    
    const config = statusConfig[status] || statusConfig.in_stock;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns = [
    {
      key: 'product',
      header: 'Produit',
      cell: (stockItem) => {
        const product = stockItem.product;
        if (!product) {
          return <div className="text-red-500">Produit non trouvé</div>;
        }
        
        return (
          <div className="flex items-center space-x-3 max-w-[280px]">
            {product.mainImage || product.images?.[0] ? (
              <Image 
                src={product.mainImage || product.images[0]} 
                alt={product.name}
                width={48}
                height={48}
                className="w-10 h-10 rounded-md object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                <PackageIcon className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="font-medium text-sm truncate leading-tight" title={product.name}>
                {product.name}
              </div>
              <div className="text-[10px] text-muted-foreground truncate leading-tight">
                SKU: {product.sku || 'N/A'}
              </div>
              <div className="text-xs text-blue-600 font-semibold leading-tight">
                {product.price} MAD
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'stockInfo',
      header: 'Quantité du Stock',
      cell: (stockItem) => (
        <div className="space-y-2 min-w-[120px]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Initial:</span>
            <span className="text-sm font-semibold text-blue-600">
              {stockItem.initialQuantity || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Vendu:</span>
            <span className="text-sm font-medium text-orange-600">
              {stockItem.soldQuantity || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Restant:</span>
            <span className={`text-sm font-semibold ${
              stockItem.currentQuantity === 0 
                ? 'text-red-600' 
                : stockItem.currentQuantity <= (stockItem.lowStockAlert || 1)
                ? 'text-orange-600'
                : 'text-green-600'
            }`}>
              {stockItem.currentQuantity || 0}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Stock',
      cell: (stockItem) => (
        <div className="flex flex-col items-start space-y-1 min-w-[100px]">
          {getStatusBadge(stockItem)}
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Statut',
      cell: (stockItem) => (
        <div className="flex items-center space-x-2">
          {updatingStatus[stockItem._id] ? (
            <div className="w-11 h-6 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <Switch
              checked={stockItem.isActive !== undefined ? stockItem.isActive : true}
              onCheckedChange={() => handleStatusToggle(stockItem)}
              className="data-[state=checked]:bg-green-500"
            />
          )}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              stockItem.isActive ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            <span className="text-sm text-muted-foreground">
              {stockItem.isActive ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'performance',
      header: 'Performance',
      cell: (stockItem) => {
        const initialQuantity = stockItem.initialQuantity || 0;
        const soldQuantity = stockItem.soldQuantity || 0;
        const sellThroughRate = initialQuantity > 0 ? (soldQuantity / initialQuantity) * 100 : 0;
        
        return (
          <div className="space-y-2 min-w-[120px]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Taux vente:</span>
              <span className={`text-sm font-medium ${
                sellThroughRate > 50 ? 'text-green-600' : 
                sellThroughRate > 20 ? 'text-orange-600' : 'text-red-600'
              }`}>
                {sellThroughRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-neutral-800 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${
                  sellThroughRate > 50 ? 'bg-green-500' : 
                  sellThroughRate > 20 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(sellThroughRate, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Seuil:</span>
              <span className="text-xs font-medium">
                {stockItem.lowStockAlert || 1}
              </span>
            </div>
          </div>
        );
      },
    },
  ];

  const totalCurrentQuantity = stock.reduce((sum, item) => sum + (item.currentQuantity || 0), 0);
  const totalSoldQuantity = stock.reduce((sum, item) => sum + (item.soldQuantity || 0), 0);
  const totalInitialQuantity = stock.reduce((sum, item) => sum + (item.initialQuantity || 0), 0);
  const totalValue = stock.reduce((sum, item) => {
    const productPrice = item.product?.price || 0;
    return sum + (productPrice * (item.currentQuantity || 0));
  }, 0);
  
  const lowStockItems = stock.filter(s => {
    const status = s.status || 
      (s.currentQuantity === 0 ? 'out_of_stock' : 
       s.currentQuantity <= (s.lowStockAlert || 1) ? 'low_stock' : 'in_stock');
    return status === 'low_stock';
  });
  
  const outOfStockItems = stock.filter(s => {
    const status = s.status || 
      (s.currentQuantity === 0 ? 'out_of_stock' : 
       s.currentQuantity <= (s.lowStockAlert || 1) ? 'low_stock' : 'in_stock');
    return status === 'out_of_stock';
  });

  const activeStockItems = stock.filter(s => s.isActive !== false);

  const availableProducts = products.filter(product => 
    !stock.some(stockItem => {
      const stockProductId = stockItem.product?._id || stockItem.product;
      return stockProductId === product._id;
    })
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion du Stock</h1>
            <p className="text-muted-foreground">
              Gérez le stock de vos produits
            </p>
          </div>
          <Button onClick={openCreateDialog} disabled={products.length === 0}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Nouveau Stock
          </Button>
        </div>

        {/* Enhanced Stats - Compact Version */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-border bg-card">
            <CardContent className="px-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-muted-foreground">Stock Actuel</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {totalCurrentQuantity.toLocaleString('fr-FR')}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    {stock.length} produit(s)
                  </p>
                </div>
                <PackageIcon className="w-5 h-5 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="px-3 py-0">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-muted-foreground">Ventes Totales</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {totalSoldQuantity.toLocaleString('fr-FR')}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    {totalInitialQuantity > 0 ? 
                      `${((totalSoldQuantity / totalInitialQuantity) * 100).toFixed(1)}%` 
                      : '0%'
                    } taux
                  </p>
                </div>
                <TrendingUpIcon className="w-5 h-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="px-3 py-0">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-muted-foreground">Valeur Stock</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {totalValue.toLocaleString('fr-FR')}
                  </p>
                  <p className="text-[12px] text-muted-foreground">MAD</p>
                </div>
                <CoinsIcon className="w-5 h-5 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="px-3 py-0">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-muted-foreground">Revenus Ventes</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {stock.reduce((total, item) => {
                      const productPrice = item.product?.price || 0;
                      const soldQuantity = item.soldQuantity || 0;
                      return total + (productPrice * soldQuantity);
                    }, 0).toLocaleString('fr-FR')} MAD
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    {totalSoldQuantity} unités vendues
                  </p>
                </div>
                <CoinsIcon className="w-5 h-5 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Status Overview */}
        <div className="flex flex-wrap justify-between gap-2 sm:grid sm:grid-cols-3 sm:gap-3">
          <Card className="flex-1 min-w-[32%] border-border bg-card">
            <CardContent className="px-3 py-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium">En Stock</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 text-xs">
                  {stock.length - lowStockItems.length - outOfStockItems.length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[32%] border-border bg-card">
            <CardContent className="px-3 py-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-xs font-medium">Stock Faible</span>
                </div>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 text-xs">
                  {lowStockItems.length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[32%] border-border bg-card">
            <CardContent className="px-3 py-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs font-medium">Rupture</span>
                </div>
                <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 text-xs">
                  {outOfStockItems.length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Stock DataTable */}
        <Card>
          <CardHeader>
            <CardTitle>Vue d&apos;ensemble du Stock</CardTitle>
            <CardDescription>
              {stock.length} produit(s) • {activeStockItems.length} actif(s) • 
              Stock total: {totalCurrentQuantity} unités • 
              Ventes: {totalSoldQuantity} unités
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            ) : stock.length > 0 ? (
              <DataTable
                columns={columns}
                data={stock}
                searchKey="product.name"
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                onView={openViewDrawer}
              />
            ) : (
              <div className="text-center py-12">
                <PackageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun stock</h3>
                <p className="text-muted-foreground mb-6">
                  {products.length === 0 
                    ? 'Créez d\'abord des produits avant de gérer le stock' 
                    : 'Commencez par créer votre premier stock pour vos produits'
                  }
                </p>
                <Button onClick={openCreateDialog} disabled={products.length === 0}>
                  Créer un Stock
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CREATE STOCK DIALOG */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nouveau Stock</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau stock pour un produit
              </DialogDescription>
              <p className="text-[10px] mt-2 px-3 py-2 rounded border bg-muted/30 text-muted-foreground">
                Les champs marqués par <span className="text-red-600">*</span> sont obligatoires.
              </p>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Produit <span className="text-red-600">*</span></Label>
                <Select
                  value={createFormData.product}
                  onValueChange={(value) => setCreateFormData(prev => ({ ...prev, product: value }))}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionnez un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map((product) => (
                      <SelectItem key={product._id} value={product._id}>
                        {product.name} - {product.sku}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableProducts.length === 0 && (
                  <p className="text-sm text-red-600">
                    Tous les produits ont déjà du stock ou aucun produit n&apos;est disponible
                  </p>
                )}
              </div>
          
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="initialQuantity">Quantité Initiale <span className="text-red-600">*</span></Label>
                  <Input
                    id="initialQuantity"
                    type="number"
                    min="0"
                    value={createFormData.initialQuantity}
                    onChange={(e) => {
                      const initial = parseInt(e.target.value) || 0;
                      setCreateFormData(prev => ({ 
                        ...prev, 
                        initialQuantity: initial,
                        currentQuantity: initial
                      }));
                    }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentQuantity">Quantité Actuelle <span className="text-red-600">*</span></Label>
                  <Input
                    id="currentQuantity"
                    type="number"
                    min="0"
                    max={createFormData.initialQuantity}
                    value={createFormData.currentQuantity}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, currentQuantity: parseInt(e.target.value) || 0 }))}
                    required
                  />
                </div>
              </div>

              {/* Removed lowStockAlert input - now defaults to 1 */}

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={createFormData.isActive}
                  onCheckedChange={(checked) => setCreateFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">
                  Stock actif
                </Label>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={loading || availableProducts.length === 0}>
                  {loading ? 'Création...' : 'Créer'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* EDIT STOCK DIALOG (SALES ONLY) */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter des Ventes WhatsApp</DialogTitle>
              <DialogDescription>
                Ajoutez de nouvelles ventes WhatsApp pour {selectedStock?.product?.name}
              </DialogDescription>
              <p className="text-[10px] mt-2 px-3 py-2 rounded border bg-muted/30 text-muted-foreground">
                Les champs marqués par <span className="text-red-600">*</span> sont obligatoires.
              </p>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Product Info (Readonly) */}
              <div className="space-y-2">
                <Label>Produit</Label>
                <div className="p-3 bg-muted/50 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    {selectedStock?.product?.mainImage || selectedStock?.product?.images?.[0] ? (
                      <Image 
                        src={selectedStock.product.mainImage || selectedStock.product.images[0]} 
                        alt={selectedStock.product.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-md object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                        <PackageIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-foreground">{selectedStock?.product?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Stock initial: {selectedStock?.initialQuantity || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Stock Summary */}
              <div className="bg-primary/5 p-3 rounded-lg border border-border">
                <h4 className="text-sm font-semibold text-foreground mb-2">État Actuel du Stock</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <div className="text-primary font-bold">{selectedStock?.initialQuantity || 0}</div>
                    <div className="text-muted-foreground text-xs">Initial</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-600 dark:text-green-400 font-bold">{selectedStock?.currentQuantity || 0}</div>
                    <div className="text-muted-foreground text-xs">Actuel</div>
                  </div>
                  <div className="text-center">
                    <div className="text-orange-600 dark:text-orange-400 font-bold">{selectedStock?.soldQuantity || 0}</div>
                    <div className="text-muted-foreground text-xs">Déjà Vendu</div>
                  </div>
                </div>
              </div>

              {/* NEW SALES Input */}
              <div className="space-y-2">
                <Label htmlFor="newSales">Nouvelles Ventes WhatsApp <span className="text-red-600">*</span></Label>
                <Input
                  id="newSales"
                  type="number"
                  min="0"
                  max={selectedStock?.currentQuantity || 0}
                  value={editFormData.newSales || 0}
                  onChange={(e) => {
                    const newSales = parseInt(e.target.value) || 0;
                    const currentStock = selectedStock?.currentQuantity || 0;
                    
                    const validatedNewSales = Math.min(newSales, currentStock);
                    
                    setEditFormData({ newSales: validatedNewSales });
                  }}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Saisissez le nombre de nouvelles ventes (max: {selectedStock?.currentQuantity || 0} unités disponibles)
                </p>
                
                {/* Preview of new values */}
                {selectedStock && (
                  <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded border border-green-200 dark:border-green-800">
                    <h5 className="text-sm font-semibold text-green-800 dark:text-green-400 mb-2">Résultat après mise à jour:</h5>
                    <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <div className="flex justify-between">
                        <span>Nouveau stock actuel:</span>
                        <strong>{selectedStock.currentQuantity - (editFormData.newSales || 0)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Total vendu:</span>
                        <strong>{(selectedStock.soldQuantity || 0) + (editFormData.newSales || 0)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Nouvelles ventes ajoutées:</span>
                        <strong>{editFormData.newSales || 0}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={loading || (editFormData.newSales || 0) === 0}>
                  {loading ? 'Mise à jour...' : 'Ajouter les Ventes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer le stock</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer le stock pour &quot;<b>{selectedStock?.product?.name}</b>&quot; ?
                Cette action ne peut pas être annulée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* View Sheet */}
      <Sheet open={viewDrawerOpen} onOpenChange={setViewDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="text-lg font-semibold">
              Détails du Stock
            </SheetTitle>
            <SheetDescription>
              Consultez les informations détaillées de ce produit en stock.
            </SheetDescription>
          </SheetHeader>

          {selectedStock ? (
            <div className="p-6 space-y-6">
              {/* Product Info */}
              <div className="flex items-start gap-4">
                {/* Main Image */}
                {selectedStock.product?.mainImage || selectedStock.product?.images?.[0] ? (
                  <Image
                    src={selectedStock.product.mainImage || selectedStock.product.images[0]}
                    alt={selectedStock.product.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-md object-cover border shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center border">
                    <PackageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}

                {/* Product Details */}
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold leading-tight">
                    {selectedStock.product?.name || "Produit inconnu"}
                  </h3>

                  {selectedStock.product?.sku && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">SKU:</span> {selectedStock.product.sku}
                    </p>
                  )}

                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Prix:</span> {selectedStock.product?.price?.toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' }) || "—"}
                  </p>

                  {selectedStock.product?.comparePrice && (
                    <p className="text-sm text-muted-foreground line-through text-red-500">
                      {selectedStock.product.comparePrice.toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' })}
                    </p>
                  )}
                </div>
              </div>

              <hr className="border-muted" />

              {/* Quantities */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BarChartIcon className="w-4 h-4 text-primary" />
                  Quantités
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <Info label="Quantité initiale" value={selectedStock.initialQuantity} />
                  <Info label="Quantité actuelle" value={selectedStock.currentQuantity} />
                  <Info label="Quantité vendue" value={selectedStock.soldQuantity || 0} />
                  <Info label="Seuil alerte" value={selectedStock.lowStockAlert || 1} />
                </div>
              </div>

              <hr className="border-muted" />

              {/* Stock Status */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ActivityIcon className="w-4 h-4 text-primary" />
                  Statut du Stock
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <Info label="État" value={getStatusBadge(selectedStock)} />
                  <Info
                    label="Statut"
                    value={selectedStock.isActive ? "✅ Actif" : "❌ Inactif"}
                  />
                </div>
              </div>

              <hr className="border-muted" />

              {/* Meta Info */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-primary" />
                  Informations
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <Info
                    label="Ajouté le"
                    value={selectedStock.createdAt
                      ? new Date(selectedStock.createdAt).toLocaleDateString("fr-FR")
                      : "—"}
                  />
                  <Info
                    label="Dernière mise à jour"
                    value={selectedStock.updatedAt
                      ? new Date(selectedStock.updatedAt).toLocaleDateString("fr-FR")
                      : "—"}
                  />
                </div>
              </div>

              <SheetClose asChild>
                <Button className="mt-6 w-full" variant="outline">
                  Fermer
                </Button>
              </SheetClose>
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              Aucun stock sélectionné.
            </div>
          )}
        </SheetContent>
      </Sheet>

    </AdminLayout>
  );
}

// Icon components remain the same...
function TrendingUpIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function CoinsIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function PlusIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function PackageIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  );
}

function Info({ label, value }) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}