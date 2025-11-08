'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { ImageUpload } from '@/components/ui/image-upload';
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
import { FaTrash } from 'react-icons/fa';

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    isActive: true,
  });
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [imageUploading, setImageUploading] = useState(false); // New state for image upload

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/brands');
      if (response.ok) {
        const data = await response.json();
        setBrands(data);
      } else {
        toast.error('Erreur lors du chargement des marques');
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Erreur de connexion lors du chargement des marques');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (brand) => {
    setUpdatingStatus(brand._id);
    
    try {
      const response = await fetch(`/api/admin/brands/${brand._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...brand,
          isActive: !brand.isActive
        }),
      });

      if (response.ok) {
        toast.success(`Marque ${!brand.isActive ? 'activée' : 'désactivée'} avec succès`);
        fetchBrands();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent submission if image is still uploading
    if (imageUploading) {
      toast.error('Veuillez attendre la fin du téléchargement du logo');
      return;
    }

    setLoading(true);

    try {
      const url = selectedBrand 
        ? `/api/admin/brands/${selectedBrand._id}`
        : '/api/admin/brands';
      
      const method = selectedBrand ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          selectedBrand 
            ? 'Marque mise à jour avec succès' 
            : 'Marque créée avec succès'
        );
        setDialogOpen(false);
        resetForm();
        fetchBrands();
      } else {
        toast.error(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      toast.error('Erreur de connexion lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBrand) return;

    try {
      const response = await fetch(`/api/admin/brands/${selectedBrand._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Marque supprimée avec succès');
        setDeleteDialogOpen(false);
        setSelectedBrand(null);
        fetchBrands();
      } else {
        // This will catch the 400 error when brand has products
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur de connexion lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logo: '',
      isActive: true,
    });
    setSelectedBrand(null);
    setImageUploading(false); // Reset upload state
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (brand) => {
    setSelectedBrand(brand);
    setFormData({
      name: brand.name,
      logo: brand.logo || '',
      isActive: brand.isActive,
    });
    setImageUploading(false); // Reset upload state
    setDialogOpen(true);
  };

  const openDeleteDialog = (brand) => {
    setSelectedBrand(brand);
    setDeleteDialogOpen(true);
  };

  // Handle image upload start
  const handleImageUploadStart = () => {
    setImageUploading(true);
  };

  // Handle image upload end
  const handleImageUploadEnd = () => {
    setImageUploading(false);
  };

  // Helper function to check if brand can be deleted
  const canDeleteBrand = (brand) => {
    return !brand.productCount || brand.productCount === 0;
  };

  const columns = [
    {
      key: 'logo',
      header: 'Logo',
      cell: (brand) => (
        brand.logo ? (
          <Image 
            src={brand.logo} 
            alt={brand.name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-md object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
            <BrandIcon className="w-5 h-5 text-muted-foreground" />
          </div>
        )
      ),
    },
    {
      key: 'name',
      header: 'Nom',
    },
    {
      key: 'productCount',
      header: 'Produits Associés',
      cell: (brand) => (
        <Badge 
          variant={brand.productCount > 0 ? "default" : "secondary"}
          className={brand.productCount > 0 ? "bg-blue-500" : ""}
        >
          {brand.productCount || 0} produit(s)
        </Badge>
      ),
    },
    {
      key: 'isActive',
      header: 'Statut',
      cell: (brand) => (
        <div className="flex items-center space-x-2">
          {updatingStatus === brand._id ? (
            <div className="w-11 h-6 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <Switch
              checked={brand.isActive}
              onCheckedChange={() => handleStatusToggle(brand)}
              disabled={updatingStatus === brand._id}
              className="data-[state=checked]:bg-green-500"
            />
          )}
          <Badge variant={brand.isActive ? "default" : "secondary"}>
            {brand.isActive ? "Active" : "Inactive"}
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
            <h1 className="text-3xl font-bold tracking-tight">Marques</h1>
            <p className="text-muted-foreground">
              Gérez les marques de vos produits
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Nouvelle Marque
          </Button>
        </div>

        {/* Brands DataTable */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Marques</CardTitle>
            <CardDescription>
              {brands.length} marque(s) au total • {brands.filter(b => b.isActive).length} active(s)
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
            ) : brands.length > 0 ? (
              <DataTable
                columns={columns}
                data={brands}
                searchKey="name"
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                canDelete={canDeleteBrand}
              />
            ) : (
              <div className="text-center py-12">
                <TrademarkIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune marque</h3>
                <p className="text-muted-foreground mb-6">
                  Commencez par créer votre première marque pour vos produits
                </p>
                <Button onClick={openCreateDialog}>
                  Créer une Marque
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
                {selectedBrand ? 'Modifier la Marque' : 'Nouvelle Marque'}
              </DialogTitle>
              <DialogDescription>
                {selectedBrand 
                  ? 'Modifiez les informations de la marque' 
                  : 'Ajoutez une nouvelle marque pour vos produits'
                }
              </DialogDescription>
              <p className="text-[10px] mt-2 px-3 py-2 rounded border bg-muted/30 text-muted-foreground">
                Les champs marqués par <span className="text-red-600">*</span> sont obligatoires.
              </p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la marque <span className="text-red-600">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Dell, HP, Apple..."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Logo de la marque</Label>
                <ImageUpload
                  value={formData.logo}
                  onChange={(url) => setFormData(prev => ({ ...prev, logo: url }))}
                  onUploadStart={handleImageUploadStart} // Pass upload start handler
                  onUploadEnd={handleImageUploadEnd} // Pass upload end handler
                  buttonText="Upload Logo"
                  multiple={false}
                />
                {formData.logo && (
                  <div className="mt-2 relative inline-block">
                    <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-md">
                      <Image 
                        src={formData.logo} 
                        alt="Logo preview" 
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, logo: '' }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">
                  Marque active
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Les marques inactives ne seront pas visibles sur le site
              </p>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={loading || imageUploading}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || imageUploading}
                  className="relative"
                >
                  {loading || imageUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      {imageUploading ? 'Téléchargement...' : selectedBrand ? 'Modification...' : 'Création...'}
                    </>
                  ) : (
                    selectedBrand ? 'Modifier' : 'Créer'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {selectedBrand?.productCount > 0 
                  ? 'Suppression impossible' 
                  : 'Supprimer la marque'
                }
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                {selectedBrand?.productCount > 0 ? (
                  <div className="space-y-2">
                    <p>
                      La marque &quot;<b>{selectedBrand?.name}</b>&quot; est liée à{' '}
                      <b>{selectedBrand?.productCount} produit(s)</b>.
                    </p>
                    <p className="text-amber-600 font-medium">
                      Supprimez d&apos;abord les produits associés.
                    </p>
                  </div>
                ) : (
                  <div>
                    Êtes-vous sûr de vouloir supprimer la marque &quot;<b>{selectedBrand?.name}</b>&quot; ?
                    <br />
                    Cette action ne peut pas être annulée.
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              {selectedBrand?.productCount === 0 && (
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

function TrademarkIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function BrandIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}