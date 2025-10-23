'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import ProductForm from './ProductForm'; // We'll create this next

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des produits' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (product) => {
    try {
      const response = await fetch(`/api/admin/products/${product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          isActive: !product.isActive
        }),
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Produit ${!product.isActive ? 'activé' : 'désactivé'} avec succès` 
        });
        fetchProducts();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la modification' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion' });
    }
  };

  const handleFeaturedToggle = async (product) => {
    try {
      const response = await fetch(`/api/admin/products/${product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          isFeatured: !product.isFeatured
        }),
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Produit ${!product.isFeatured ? 'ajouté aux' : 'retiré des'} featured avec succès` 
        });
        fetchProducts();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la modification' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion' });
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/admin/products/${selectedProduct._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Produit supprimé avec succès' });
        setDeleteDialogOpen(false);
        setSelectedProduct(null);
        fetchProducts();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la suppression' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion' });
    }
  };

  const handleFormSuccess = () => {
    setDialogOpen(false);
    setSelectedProduct(null);
    fetchProducts();
    setMessage({ type: 'success', text: selectedProduct ? 'Produit mis à jour avec succès' : 'Produit créé avec succès' });
  };

  const openCreateDialog = () => {
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const openEditDialog = (product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const openDeleteDialog = (product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  // DataTable columns configuration
  const columns = [
    {
      key: 'mainImage',
      header: 'Image',
      cell: (product) => (
        product.mainImage ? (
          <img 
            src={product.mainImage} 
            alt={product.name}
            className="w-10 h-10 rounded-md object-cover"
          />
        ) : product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-10 h-10 rounded-md object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
          </div>
        )
      ),
    },
    {
      key: 'name',
      header: 'Nom',
    },
    {
      key: 'brand',
      header: 'Marque',
      cell: (product) => product.brand?.name || 'N/A',
    },
    {
      key: 'category',
      header: 'Catégorie',
      cell: (product) => product.category?.name || 'N/A',
    },
    {
      key: 'price',
      header: 'Prix',
      cell: (product) => `${product.price} MAD`,
    },
    {
      key: 'isActive',
      header: 'Statut',
      cell: (product) => (
        <div className="flex items-center space-x-2">
          <Switch
            checked={product.isActive}
            onCheckedChange={() => handleStatusToggle(product)}
            className="data-[state=checked]:bg-green-500"
          />
          <Badge variant={product.isActive ? "default" : "secondary"}>
            {product.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      ),
    },
    {
      key: 'isFeatured',
      header: 'Featured',
      cell: (product) => (
        <div className="flex items-center space-x-2">
          <Switch
            checked={product.isFeatured}
            onCheckedChange={() => handleFeaturedToggle(product)}
            className="data-[state=checked]:bg-blue-500"
          />
          <Badge variant={product.isFeatured ? "default" : "outline"}>
            {product.isFeatured ? "Oui" : "Non"}
          </Badge>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Produits</h1>
            <p className="text-muted-foreground">
              Gérez votre catalogue de produits
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Nouveau Produit
          </Button>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : message.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Products DataTable */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Produits</CardTitle>
            <CardDescription>
              {products.length} produit(s) au total • {products.filter(p => p.isActive).length} actif(s) • {products.filter(p => p.isFeatured).length} featured
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
            ) : products.length > 0 ? (
              <DataTable
                columns={columns}
                data={products}
                searchKey="name"
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
              />
            ) : (
              <div className="text-center py-12">
                <PackageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun produit</h3>
                <p className="text-muted-foreground mb-6">
                  Commencez par créer votre premier produit
                </p>
                <Button onClick={openCreateDialog}>
                  Créer un Produit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Form Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedProduct ? 'Modifier le Produit' : 'Nouveau Produit'}
              </DialogTitle>
              <DialogDescription>
                {selectedProduct 
                  ? 'Modifiez les informations du produit' 
                  : 'Ajoutez un nouveau produit à votre catalogue'
                }
              </DialogDescription>
            </DialogHeader>
            <ProductForm 
              product={selectedProduct}
              onSuccess={handleFormSuccess}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer le produit</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer le produit "{selectedProduct?.name}" ?
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
    </AdminLayout>
  );
}

// Icon Components
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

function ImageIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}