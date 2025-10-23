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
import { Switch } from '@/components/ui/switch'; // Add this import
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

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    isActive: true, // Add isActive to form data
  });
  const [message, setMessage] = useState({ type: '', text: '' });

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
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des marques' });
    } finally {
      setLoading(false);
    }
  };

  // Add this function to handle status toggle
  const handleStatusToggle = async (brand) => {
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
        setMessage({ 
          type: 'success', 
          text: `Marque ${!brand.isActive ? 'activée' : 'désactivée'} avec succès` 
        });
        fetchBrands(); // Refresh the list
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
        setMessage({ 
          type: 'success', 
          text: selectedBrand 
            ? 'Marque mise à jour avec succès' 
            : 'Marque créée avec succès' 
        });
        setDialogOpen(false);
        resetForm();
        fetchBrands();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la sauvegarde' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion' });
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

      if (response.ok) {
        setMessage({ type: 'success', text: 'Marque supprimée avec succès' });
        setDeleteDialogOpen(false);
        setSelectedBrand(null);
        fetchBrands();
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
      name: '',
      logo: '',
      isActive: true,
    });
    setSelectedBrand(null);
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
    setDialogOpen(true);
  };

  const openDeleteDialog = (brand) => {
    setSelectedBrand(brand);
    setDeleteDialogOpen(true);
  };

  // Updated DataTable columns configuration with switch
  const columns = [
    {
      key: 'logo',
      header: 'Logo',
      cell: (brand) => (
        brand.logo ? (
          <img 
            src={brand.logo} 
            alt={brand.name}
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
      key: 'isActive',
      header: 'Statut',
      cell: (brand) => (
        <div className="flex items-center space-x-2">
          <Switch
            checked={brand.isActive}
            onCheckedChange={() => handleStatusToggle(brand)}
            className="data-[state=checked]:bg-green-500"
          />
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
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la marque *</Label>
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
                    buttonText="Upload Logo"
                    multiple={false} // Explicitly set to false
                />
                {formData.logo && (
                    <div className="mt-2">
                    <img 
                        src={formData.logo} 
                        alt="Logo preview" 
                        className="w-20 h-20 object-cover rounded-md"
                    />
                    </div>
                )}
                </div>

              {/* Add Switch for isActive in the form */}
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
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Enregistrement...' : selectedBrand ? 'Modifier' : 'Créer'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer la marque</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer la marque "{selectedBrand?.name}" ?
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

// Icon Components (keep the same)
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