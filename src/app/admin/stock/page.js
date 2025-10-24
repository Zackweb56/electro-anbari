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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [formData, setFormData] = useState({
    product: '',
    initialQuantity: 0,
    currentQuantity: 0,
    lowStockAlert: 5,
    isActive: true,
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);

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
        console.log('Stock data:', data); // Debug log
        setStock(data);
      } else {
        console.error('Failed to fetch stock:', response.status);
        setMessage({ type: 'error', text: 'Erreur lors du chargement du stock' });
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
      setMessage({ type: 'error', text: 'Erreur de connexion lors du chargement du stock' });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        console.log('Products data:', data); // Debug log
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleStatusToggle = async (stockItem) => {
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
        setMessage({ 
          type: 'success', 
          text: `Stock ${!stockItem.isActive ? 'activé' : 'désactivé'} avec succès` 
        });
        fetchStock();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la modification' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const url = selectedStock 
        ? `/api/admin/stock/${selectedStock._id}`
        : '/api/admin/stock';
      
      const method = selectedStock ? 'PUT' : 'POST';

      // Prepare data for API
      const submitData = {
        product: formData.product,
        initialQuantity: parseInt(formData.initialQuantity),
        currentQuantity: parseInt(formData.currentQuantity),
        lowStockAlert: parseInt(formData.lowStockAlert),
        isActive: formData.isActive,
      };

      console.log('Submitting data:', submitData); // Debug log

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      console.log('Response data:', data); // Debug log

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: selectedStock 
            ? 'Stock mis à jour avec succès' 
            : 'Stock créé avec succès' 
        });
        setDialogOpen(false);
        resetForm();
        fetchStock();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la sauvegarde' });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setMessage({ type: 'error', text: 'Erreur de connexion' });
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
        setMessage({ type: 'success', text: 'Stock supprimé avec succès' });
        setDeleteDialogOpen(false);
        setSelectedStock(null);
        fetchStock();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la suppression' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion' });
    }
  };

  const resetForm = () => {
    setFormData({
      product: '',
      initialQuantity: 0,
      currentQuantity: 0,
      lowStockAlert: 5,
      isActive: true,
    });
    setSelectedStock(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (stockItem) => {
    console.log('Editing stock item:', stockItem); // Debug log
    setSelectedStock(stockItem);
    setFormData({
      product: stockItem.product?._id || stockItem.product || '',
      initialQuantity: stockItem.initialQuantity || 0,
      currentQuantity: stockItem.currentQuantity || stockItem.initialQuantity || 0,
      lowStockAlert: stockItem.lowStockAlert || 5,
      isActive: stockItem.isActive !== undefined ? stockItem.isActive : true,
    });
    setDialogOpen(true);
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
       stockItem.currentQuantity <= (stockItem.lowStockAlert || 5) ? 'low_stock' : 'in_stock');
    
    const config = statusConfig[status] || statusConfig.in_stock;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getQuantityColor = (quantity, lowStockAlert) => {
    if (quantity === 0) return 'text-red-600 font-semibold';
    if (quantity <= lowStockAlert) return 'text-orange-600 font-semibold';
    return 'text-green-600';
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
          <div className="flex items-center space-x-3">
            {product.images?.[0] ? (
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="w-10 h-10 rounded-md object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                <PackageIcon className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <div className="font-medium">{product.name}</div>
              <div className="text-sm text-muted-foreground">{product.model}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'quantities',
      header: 'Quantités',
      cell: (stockItem) => (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Actuelle:</span>
            <span className={getQuantityColor(stockItem.currentQuantity, stockItem.lowStockAlert)}>
              {stockItem.currentQuantity || 0}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Vendue:</span>
            <span className="text-blue-600">{stockItem.soldQuantity || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Initiale:</span>
            <span className="text-gray-600">{stockItem.initialQuantity || 0}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Statut Stock',
      cell: (stockItem) => getStatusBadge(stockItem),
    },
    {
      key: 'alert',
      header: 'Alerte',
      cell: (stockItem) => (
        <div className="text-center">
          <div className="text-sm font-medium">{stockItem.lowStockAlert || 5}</div>
          <div className="text-xs text-muted-foreground">Seuil</div>
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Statut',
      cell: (stockItem) => (
        <div className="flex items-center space-x-2">
          <Switch
            checked={stockItem.isActive !== undefined ? stockItem.isActive : true}
            onCheckedChange={() => handleStatusToggle(stockItem)}
            className="data-[state=checked]:bg-green-500"
          />
          <Badge variant={stockItem.isActive ? "default" : "secondary"}>
            {stockItem.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      ),
    },
  ];

  // Filter products that don't already have stock
  const availableProducts = products.filter(product => 
    !stock.some(stockItem => {
      const stockProductId = stockItem.product?._id || stockItem.product;
      return stockProductId === product._id;
    }) || 
    (selectedStock && (selectedStock.product?._id || selectedStock.product) === product._id)
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Produits</p>
                  <p className="text-2xl font-bold">{stock.length}</p>
                </div>
                <PackageIcon className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">En Stock</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stock.filter(s => {
                      const status = s.status || 
                        (s.currentQuantity === 0 ? 'out_of_stock' : 
                         s.currentQuantity <= (s.lowStockAlert || 5) ? 'low_stock' : 'in_stock');
                      return status === 'in_stock';
                    }).length}
                  </p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Stock Faible</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stock.filter(s => {
                      const status = s.status || 
                        (s.currentQuantity === 0 ? 'out_of_stock' : 
                         s.currentQuantity <= (s.lowStockAlert || 5) ? 'low_stock' : 'in_stock');
                      return status === 'low_stock';
                    }).length}
                  </p>
                </div>
                <AlertTriangleIcon className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rupture</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stock.filter(s => {
                      const status = s.status || 
                        (s.currentQuantity === 0 ? 'out_of_stock' : 
                         s.currentQuantity <= (s.lowStockAlert || 5) ? 'low_stock' : 'in_stock');
                      return status === 'out_of_stock';
                    }).length}
                  </p>
                </div>
                <XCircleIcon className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Stock DataTable */}
        <Card>
          <CardHeader>
            <CardTitle>Liste du Stock</CardTitle>
            <CardDescription>
              {stock.length} produit(s) en stock • {stock.filter(s => s.isActive !== false).length} active(s)
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

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedStock ? 'Modifier le Stock' : 'Nouveau Stock'}
              </DialogTitle>
              <DialogDescription>
                {selectedStock 
                  ? 'Modifiez les informations du stock' 
                  : 'Ajoutez un nouveau stock pour un produit'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Produit *</Label>
                <Select
                  value={formData.product}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, product: value }))}
                  disabled={!!selectedStock}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionnez un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map((product) => (
                      <SelectItem key={product._id} value={product._id}>
                        {product.name} - {product.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableProducts.length === 0 && !selectedStock && (
                  <p className="text-sm text-red-600">
                    Tous les produits ont déjà du stock ou aucun produit n'est disponible
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="initialQuantity">Quantité Initiale *</Label>
                  <Input
                    id="initialQuantity"
                    type="number"
                    min="0"
                    value={formData.initialQuantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, initialQuantity: parseInt(e.target.value) || 0 }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentQuantity">Quantité Actuelle *</Label>
                  <Input
                    id="currentQuantity"
                    type="number"
                    min="0"
                    value={formData.currentQuantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentQuantity: parseInt(e.target.value) || 0 }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lowStockAlert">Seuil d'Alerte Stock Faible</Label>
                <Input
                  id="lowStockAlert"
                  type="number"
                  min="1"
                  value={formData.lowStockAlert}
                  onChange={(e) => setFormData(prev => ({ ...prev, lowStockAlert: parseInt(e.target.value) || 5 }))}
                />
                <p className="text-sm text-muted-foreground">
                  Alerte lorsque le stock atteint cette quantité
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">
                  Stock actif
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Le stock inactif ne sera pas pris en compte dans les alertes
              </p>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={loading || (!selectedStock && availableProducts.length === 0)}>
                  {loading ? 'Enregistrement...' : selectedStock ? 'Modifier' : 'Créer'}
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
                Êtes-vous sûr de vouloir supprimer le stock pour "{selectedStock?.product?.name}" ?
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
                  <img
                    src={selectedStock.product.mainImage || selectedStock.product.images[0]}
                    alt={selectedStock.product.name}
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
                  <Info label="Seuil alerte" value={selectedStock.lowStockAlert} />
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

// Icon Components (keep the same as before)
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

function CheckCircleIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function AlertTriangleIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  );
}

function XCircleIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
