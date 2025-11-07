'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import ProductForm from './ProductForm'; // We'll create this next
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';
import { DollarSignIcon, Info, ClockIcon, TagsIcon, SettingsIcon, ListIcon, FileTextIcon } from 'lucide-react'

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [viewSheetOpen, setViewSheetOpen] = useState(false);
  // Dans votre ProductsPage, ajoutez ces états et fonctions
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [updatingFeatured, setUpdatingFeatured] = useState(null);

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
    setUpdatingStatus(product._id);
    
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
        toast.success(`Produit ${!product.isActive ? 'activé' : 'désactivé'} avec succès`);
        fetchProducts();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erreur lors de la modification du statut');
      }
    } catch (error) {
      toast.error('Erreur de connexion lors de la modification du statut');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleFeaturedToggle = async (product) => {
    setUpdatingFeatured(product._id);
    
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
        toast.success(`Produit ${!product.isFeatured ? 'ajouté aux' : 'retiré des'} featured avec succès`);
        fetchProducts();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      toast.error('Erreur de connexion lors de la modification');
    } finally {
      setUpdatingFeatured(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/admin/products/${selectedProduct._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Produit supprimé avec succès');
        setDeleteDialogOpen(false);
        setSelectedProduct(null);
        fetchProducts();
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur de connexion lors de la suppression');
    }
  };

  const handleFormSuccess = () => {
    setDialogOpen(false);
    setSelectedProduct(null);
    fetchProducts();
    toast.success(selectedProduct ? 'Produit mis à jour avec succès' : 'Produit créé avec succès');
  };

  const canDeleteProduct = (product) => {
    return !product.stockCount || product.stockCount === 0;
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

  const openViewSheet = (product) => {
    setSelectedProduct(product);
    setViewSheetOpen(true);
  };

  // DataTable columns configuration
  const columns = [
    {
      key: 'product',
      header: 'Produit',
      cell: (product) => (
        <div className="flex items-center space-x-3 max-w-[280px]">
          {product.mainImage || (product.images && product.images.length > 0) ? (
            <Image 
              src={product.mainImage || product.images[0]} 
              alt={product.name}
              width={40}
              height={40}
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
      ),
    },
    {
      key: 'brand',
      header: 'Marque',
      cell: (product) => (
        <div className="text-sm text-muted-foreground">
          {product.brand?.name || 'N/A'}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Catégorie',
      cell: (product) => (
        <div className="text-sm text-muted-foreground">
          {product.category?.name || 'N/A'}
        </div>
      ),
    },
    {
      key: 'stockCount',
      header: 'Stock',
      cell: (product) => (
        <Badge 
          variant={product.stockCount > 0 ? "default" : "secondary"}
          className={product.stockCount > 0 ? "bg-blue-500" : ""}
        >
          {product.stockCount || 0} entrée(s)
        </Badge>
      ),
    },
    {
      key: 'isActive',
      header: 'Statut',
      cell: (product) => (
        <div className="flex items-center space-x-2">
          {updatingStatus === product._id ? (
            <div className="w-11 h-6 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <Switch
              checked={product.isActive}
              onCheckedChange={() => handleStatusToggle(product)}
              disabled={updatingStatus === product._id}
              className="data-[state=checked]:bg-green-500"
            />
          )}
          <Badge variant={product.isActive ? "default" : "secondary"}>
            {product.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      ),
    },
    {
      key: 'isFeatured',
      header: 'Populaire',
      cell: (product) => (
        <div className="flex items-center space-x-2">
          {updatingFeatured === product._id ? (
            <div className="w-11 h-6 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <Switch
              checked={product.isFeatured}
              onCheckedChange={() => handleFeaturedToggle(product)}
              disabled={updatingFeatured === product._id}
              className="data-[state=checked]:bg-blue-500"
            />
          )}
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
                onView={openViewSheet}
                canDelete={canDeleteProduct}
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
              <p className="text-[10px] mt-2 px-3 py-2 rounded border bg-muted/30 text-muted-foreground">
                Les champs marqués par <span className="text-red-600">*</span> sont obligatoires.
              </p>
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
              <AlertDialogTitle>
                {selectedProduct?.stockCount > 0 
                  ? 'Suppression impossible' 
                  : 'Supprimer le produit'
                }
              </AlertDialogTitle>
            </AlertDialogHeader>
            
            <div className="text-sm text-muted-foreground">
              {selectedProduct?.stockCount > 0 ? (
                <div className="space-y-2">
                  <p>
                    Le produit &quot;<b>{selectedProduct?.name}</b>&quot; est associé à{' '}
                    <b>{selectedProduct?.stockCount} entrée(s) de stock</b>.
                  </p>
                  <p className="text-amber-600 font-medium">
                    Supprimez d&apos;abord le stock associé.
                  </p>
                </div>
              ) : (
                <div>
                  Êtes-vous sûr de vouloir supprimer le produit &quot;<b>{selectedProduct?.name}</b>&quot; ?
                  <br />
                  Cette action ne peut pas être annulée.
                </div>
              )}
            </div>
            
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              {selectedProduct?.stockCount === 0 && (
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Supprimer
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Product Details Sheet */}
      <Sheet open={viewSheetOpen} onOpenChange={setViewSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Détails du Produit</SheetTitle>
            <SheetDescription>Informations complètes sur le produit sélectionné</SheetDescription>
          </SheetHeader>

          {selectedProduct ? (
            <div className="p-6 space-y-8">
              {/* Main Info */}
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {selectedProduct.mainImage ? (
                  <Image
                    src={selectedProduct.mainImage}
                    alt={selectedProduct.name}
                    width={160}
                    height={160}
                    className="w-40 h-40 rounded-md object-cover border"
                  />
                ) : (
                  <div className="w-40 h-40 bg-muted flex items-center justify-center rounded-md">
                    <PackageIcon className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}

                <div className="flex-1 space-y-2">
                  <h3 className="text-2xl font-semibold">{selectedProduct.name}</h3>
                  <div>
                    <p className="text-muted-foreground text-xs">SKU</p>
                    <p className="font-medium">{selectedProduct.sku || '—'}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant={selectedProduct.isActive ? 'default' : 'secondary'}>
                      {selectedProduct.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                    {selectedProduct.isFeatured && (
                      <Badge variant="outline" className="border-primary text-primary">
                        Produit Vedette
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Info */}
              <section>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <DollarSignIcon className="w-4 h-4 text-primary" /> Prix & Réduction
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Prix</p>
                    <p className="font-medium">{selectedProduct.price} MAD</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Prix Comparatif</p>
                    <p className="font-medium">
                      {selectedProduct.comparePrice ? `${selectedProduct.comparePrice} MAD` : '—'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Brand & Category */}
              <section>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TagsIcon className="w-4 h-4 text-primary" /> Marque & Catégorie
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Marque</p>
                    <p className="font-medium">{selectedProduct.brand?.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Catégorie</p>
                    <p className="font-medium">{selectedProduct.category?.name || '—'}</p>
                  </div>
                </div>
              </section>

              {/* Specifications */}
              {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
                <section>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4 text-primary" /> Spécifications Techniques
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Processeur</p>
                      <p className="font-medium">{selectedProduct.specifications.processor || '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">RAM</p>
                      <p className="font-medium">{selectedProduct.specifications.ram || '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Stockage</p>
                      <p className="font-medium">{selectedProduct.specifications.storage || '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Écran</p>
                      <p className="font-medium">{selectedProduct.specifications.display || '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Graphiques</p>
                      <p className="font-medium">{selectedProduct.specifications.graphics || '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Graphiques (secondaire)</p>
                      <p className="font-medium">{selectedProduct.specifications.graphics2 || '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Batterie</p>
                      <p className="font-medium">{selectedProduct.specifications.battery || '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Clavier</p>
                      <p className="font-medium">{selectedProduct.specifications.keyboard || '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Système d’exploitation</p>
                      <p className="font-medium">{selectedProduct.specifications.operatingSystem || '—'}</p>
                    </div>
                  </div>
                </section>
              )}

              {/* Features */}
              {selectedProduct.features && selectedProduct.features.length > 0 && (
                <section>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ListIcon className="w-4 h-4 text-primary" /> Fonctionnalités
                  </h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {selectedProduct.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Description */}
              {selectedProduct.description && (
                <section>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FileTextIcon className="w-4 h-4 text-primary" /> Description
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {selectedProduct.description}
                  </p>
                </section>
              )}

              {/* Secondary Images */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <section>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" /> Images Supplémentaires
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {selectedProduct.images.map((img, idx) => (
                      <Image
                        key={idx}
                        src={img}
                        alt={`Image ${idx + 1}`}
                        width={96}
                        height={96}
                        className="w-full h-24 object-cover rounded-md border"
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Dates */}
              <section>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-primary" /> Historique
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Créé le</p>
                    <p className="font-medium">
                      {selectedProduct.createdAt
                        ? new Date(selectedProduct.createdAt).toLocaleDateString('fr-FR')
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Mis à jour le</p>
                    <p className="font-medium">
                      {selectedProduct.updatedAt
                        ? new Date(selectedProduct.updatedAt).toLocaleDateString('fr-FR')
                        : '—'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Close Button */}
              <SheetClose asChild>
                <Button className="mt-8 w-full" variant="outline">
                  Fermer
                </Button>
              </SheetClose>
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              Aucun produit sélectionné.
            </div>
          )}
        </SheetContent>
      </Sheet>

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