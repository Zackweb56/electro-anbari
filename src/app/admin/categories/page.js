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
import { FaTrash } from 'react-icons/fa';
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    isActive: true,
  });
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        toast.error('Erreur lors du chargement des catégories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Erreur de connexion lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (category) => {
    setUpdatingStatus(category._id);
    
    try {
      const response = await fetch(`/api/admin/categories/${category._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...category,
          isActive: !category.isActive
        }),
      });

      if (response.ok) {
        toast.success(`Catégorie ${!category.isActive ? 'activée' : 'désactivée'} avec succès`);
        fetchCategories();
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
    setLoading(true);

    try {
      const url = selectedCategory 
        ? `/api/admin/categories/${selectedCategory._id}`
        : '/api/admin/categories';
      
      const method = selectedCategory ? 'PUT' : 'POST';

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
          selectedCategory 
            ? 'Catégorie mise à jour avec succès' 
            : 'Catégorie créée avec succès'
        );
        setDialogOpen(false);
        resetForm();
        fetchCategories();
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
    if (!selectedCategory) return;

    try {
      const response = await fetch(`/api/admin/categories/${selectedCategory._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Catégorie supprimée avec succès');
        setDeleteDialogOpen(false);
        setSelectedCategory(null);
        fetchCategories();
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur de connexion lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      image: '',
      isActive: true,
    });
    setSelectedCategory(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      image: category.image || '',
      isActive: category.isActive,
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const canDeleteCategory = (category) => {
    return !category.productCount || category.productCount === 0;
  };

  const columns = [
    {
      key: 'image',
      header: 'Image',
      cell: (category) => (
        category.image ? (
          <Image 
            src={category.image} 
            alt={category.name}
            width={40}
            height={40}
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
      key: 'productCount',
      header: 'Produits Associés',
      cell: (category) => (
        <Badge 
          variant={category.productCount > 0 ? "default" : "secondary"}
          className={category.productCount > 0 ? "bg-blue-500" : ""}
        >
          {category.productCount || 0} produit(s)
        </Badge>
      ),
    },
    {
      key: 'isActive',
      header: 'Statut',
      cell: (category) => (
        <div className="flex items-center space-x-2">
          {updatingStatus === category._id ? (
            <div className="w-11 h-6 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <Switch
              checked={category.isActive}
              onCheckedChange={() => handleStatusToggle(category)}
              disabled={updatingStatus === category._id}
              className="data-[state=checked]:bg-green-500"
            />
          )}
          <Badge variant={category.isActive ? "default" : "secondary"}>
            {category.isActive ? "Active" : "Inactive"}
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
            <h1 className="text-3xl font-bold tracking-tight">Catégories</h1>
            <p className="text-muted-foreground">
              Gérez les catégories de vos produits
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Nouvelle Catégorie
          </Button>
        </div>

        {/* Categories DataTable */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Catégories</CardTitle>
            <CardDescription>
              {categories.length} catégorie(s) au total • {categories.filter(c => c.isActive).length} active(s)
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
            ) : categories.length > 0 ? (
              <DataTable
                columns={columns}
                data={categories}
                searchKey="name"
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                canDelete={canDeleteCategory}
              />
            ) : (
              <div className="text-center py-12">
                <FolderIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune catégorie</h3>
                <p className="text-muted-foreground mb-6">
                  Commencez par créer votre première catégorie pour organiser vos produits
                </p>
                <Button onClick={openCreateDialog}>
                  Créer une Catégorie
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
                {selectedCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
              </DialogTitle>
              <DialogDescription>
                {selectedCategory 
                  ? 'Modifiez les informations de la catégorie' 
                  : 'Ajoutez une nouvelle catégorie pour vos produits'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la catégorie *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Ordinateurs Portables, Accessoires..."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Image de la catégorie</Label>
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                  buttonText="Upload Image"
                  multiple={false}
                />
                {formData.image && (
                  <div className="mt-2 relative inline-block">
                    <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-md">
                      <Image 
                        src={formData.image} 
                        alt="Image preview" 
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
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
                  Catégorie active
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Les catégories inactives ne seront pas visibles sur le site
              </p>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      {selectedCategory ? 'Modification...' : 'Création...'}
                    </>
                  ) : (
                    selectedCategory ? 'Modifier' : 'Créer'
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
                {selectedCategory?.productCount > 0 
                  ? 'Suppression impossible' 
                  : 'Supprimer la catégorie'
                }
              </AlertDialogTitle>
            </AlertDialogHeader>
            
            {/* Remplacer AlertDialogDescription par un div régulier */}
            <div className="text-sm text-muted-foreground">
              {selectedCategory?.productCount > 0 ? (
                <div className="space-y-2">
                  <p>
                    La catégorie &quot;<b>{selectedCategory?.name}</b>&quot; est liée à{' '}
                    <b>{selectedCategory?.productCount} produit(s)</b>.
                  </p>
                  <p className="text-amber-600 font-medium">
                    Supprimez d&apos;abord les produits associés.
                  </p>
                </div>
              ) : (
                <div>
                  Êtes-vous sûr de vouloir supprimer la catégorie &quot;<b>{selectedCategory?.name}</b>&quot; ?
                  <br />
                  Cette action ne peut pas être annulée.
                </div>
              )}
            </div>
            
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              {selectedCategory?.productCount === 0 && (
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

// Icon Components (keep the same)
function PlusIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function FolderIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
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