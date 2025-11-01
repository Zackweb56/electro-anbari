// Updated ProductForm.js with multiple image support and main image selection
'use client';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Plus, Star } from 'lucide-react';
import { FaTrash } from 'react-icons/fa';
import Image from 'next/image';

export default function ProductForm({ product, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [validationErrors, setValidationErrors] = useState({});
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    images: [],
    mainImage: '', // Add main image field
    brand: '',
    category: '',
    specifications: {
      processor: '',
      ram: '',
      storage: '',
      display: '',
      graphics: '',
      operatingSystem: ''
    },
    features: [],
    sku: '',
    isActive: true,
    isFeatured: false
  });

  const [newFeature, setNewFeature] = useState('');

  // CORRECTION 
  const fetchDropdownData = useCallback(async () => {
    setLoadingDropdowns(true);
    try {
      const [brandsResponse, categoriesResponse] = await Promise.all([
        fetch('/api/admin/brands/active'),
        fetch('/api/admin/categories/active')
      ]);

      let brandsData = [];
      let categoriesData = [];

      if (brandsResponse.ok) {
        brandsData = await brandsResponse.json();
        setBrands(brandsData);
      } else {
        console.error('Failed to fetch brands');
      }

      if (categoriesResponse.ok) {
        categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      } else {
        console.error('Failed to fetch categories');
      }

      // If we have a product, ensure brand and category are set correctly after data is loaded
      if (product) {
        setFormData(prev => ({
          ...prev,
          brand: product.brand?._id || product.brand || prev.brand,
          category: product.category?._id || product.category || prev.category
        }));
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des marques et catégories' });
    } finally {
      setLoadingDropdowns(false);
    }
  }, [product]); // ← AJOUTER CETTE LIGNE AVEC LES DÉPENDANCES

  // CORRECTION
  useEffect(() => {
    fetchDropdownData();
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        comparePrice: product.comparePrice || '',
        images: product.images || [],
        mainImage: product.mainImage || (product.images && product.images.length > 0 ? product.images[0] : ''),
        brand: product.brand?._id || product.brand || '', // Handle both object and ID
        category: product.category?._id || product.category || '', // Handle both object and ID
        specifications: product.specifications || {
          processor: '',
          ram: '',
          storage: '',
          display: '',
          graphics: '',
          operatingSystem: ''
        },
        features: product.features || [],
        sku: product.sku || '',
        isActive: product.isActive !== undefined ? product.isActive : true,
        isFeatured: product.isFeatured !== undefined ? product.isFeatured : false
      });
    }
  }, [product, fetchDropdownData]); // ← AJOUTER fetchDropdownData ICI

  const clearFieldError = (fieldName) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    setValidationErrors({});

    // Validation
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Le nom du produit est requis';
    if (!formData.description.trim()) errors.description = 'La description est requise';
    if (!formData.price || parseFloat(formData.price) <= 0) errors.price = 'Le prix doit être supérieur à 0';
    if (!formData.brand) errors.brand = 'La marque est requise';
    if (!formData.category) errors.category = 'La catégorie est requise';
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      setMessage({ type: 'error', text: 'Veuillez corriger les erreurs dans le formulaire' });
      setActiveTab('basic'); // Go back to basic tab to show errors
      return;
    }

    try {
      const url = product 
        ? `/api/admin/products/${product._id}`
        : '/api/admin/products';
      
      const method = product ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
        features: formData.features.filter(feature => feature.trim() !== ''),
        // Ensure mainImage is included
        mainImage: formData.mainImage || (formData.images.length > 0 ? formData.images[0] : '')
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la sauvegarde' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (url) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, url],
      // Set as main image if it's the first one
      mainImage: prev.images.length === 0 ? url : prev.mainImage
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      const removedImage = prev.images[index];
      
      return {
        ...prev,
        images: newImages,
        // If we removed the main image, set a new main image
        mainImage: prev.mainImage === removedImage ? (newImages.length > 0 ? newImages[0] : '') : prev.mainImage
      };
    });
  };

  const setAsMainImage = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      mainImage: imageUrl
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSpecificationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Message Alert */}
      {message.text && (
        <div className={`p-3 rounded-lg ${
          message.type === 'error' 
            ? 'bg-red-50 text-red-800 border border-red-200' 
            : 'bg-green-50 text-green-800 border border-green-200'
        }`}>
          {message.text}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-full justify-between md:grid md:grid-cols-4 gap-1 p-1 bg-muted/50">
            <TabsTrigger 
            value="basic" 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-2 data-[state=active]:bg-background"
            >
            <InfoIcon className="w-5 h-5" />
            <span className="hidden md:inline">Informations de base</span>
            </TabsTrigger>
            <TabsTrigger 
            value="media" 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-2 data-[state=active]:bg-background"
            >
            <ImageIcon className="w-5 h-5" />
            <span className="hidden md:inline">Images</span>
            </TabsTrigger>
            <TabsTrigger 
            value="specs" 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-2 data-[state=active]:bg-background"
            >
            <CpuIcon className="w-5 h-5" />
            <span className="hidden md:inline">Configurations</span>
            </TabsTrigger>
            <TabsTrigger 
            value="settings" 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-2 data-[state=active]:bg-background"
            >
            <SettingsIcon className="w-5 h-5" />
            <span className="hidden md:inline">Paramètres</span>
            </TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nom du produit *</Label>
                <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                  clearFieldError('name');
                }}
                placeholder="Ex: MacBook Pro 14"
                required
                className={validationErrors.name ? 'border-red-500 focus:border-red-500' : ''}
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-sm">{validationErrors.name}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="Laissé vide pour générer automatiquement"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, description: e.target.value }));
                  clearFieldError('description');
                }}
                placeholder="Description détaillée du produit..."
                rows={4}
                required
                className={validationErrors.description ? 'border-red-500 focus:border-red-500' : ''}
                />
                {validationErrors.description && (
                  <p className="text-red-500 text-sm">{validationErrors.description}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Brand Select */}
              <div className="space-y-2">
                <Label htmlFor="brand">Marque *</Label>
                <Select 
                  value={formData.brand} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, brand: value }));
                    clearFieldError('brand');
                  }}
                >
                  <SelectTrigger className={`w-full ${validationErrors.brand ? 'border-red-500 focus:border-red-500' : ''}`}>
                    <SelectValue placeholder={loadingDropdowns ? "Chargement..." : "Sélectionnez une marque"} />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand._id} value={brand._id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.brand && (
                  <p className="text-red-500 text-sm">{validationErrors.brand}</p>
                )}
              </div>

              {/* Category Select */}
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, category: value }));
                    clearFieldError('category');
                  }}
                >
                  <SelectTrigger className={`w-full ${validationErrors.category ? 'border-red-500 focus:border-red-500' : ''}`}>
                    <SelectValue placeholder={loadingDropdowns ? "Chargement..." : "Sélectionnez une catégorie"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.category && (
                  <p className="text-red-500 text-sm">{validationErrors.category}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="price">Prix (MAD) *</Label>
                <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, price: e.target.value }));
                      clearFieldError('price');
                    }}
                    placeholder="99.99"
                    required
                    className={validationErrors.price ? 'border-red-500 focus:border-red-500' : ''}
                />
                {validationErrors.price && (
                  <p className="text-red-500 text-sm">{validationErrors.price}</p>
                )}
                </div>

                <div className="space-y-2">
                <Label htmlFor="comparePrice">Prix de comparaison (MAD)</Label>
                <Input
                    id="comparePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.comparePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, comparePrice: e.target.value }))}
                    placeholder="129.99"
                />
                </div>
            </div>
            </div>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label>Images du produit</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Cliquez sur une image pour la définir comme image principale. L&apos;image principale a une bordure verte.
              </p>
              
              {/* Images Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
                {formData.images.map((image, index) => (
                  <div 
                    key={index} 
                    className="relative cursor-pointer transition-all duration-200 group"
                    onClick={() => setAsMainImage(image)}
                  >
                    {/* Image Container */}
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                      <Image 
                        src={image} 
                        width={150}
                        height={150}
                        alt={`Product image ${index + 1}`}
                        className={`w-full h-full object-cover transition-all duration-200 ${
                          formData.mainImage === image 
                            ? 'border-2 border-green-500 shadow-md' 
                            : 'border border-gray-200'
                        }`}
                        onLoad={(e) => {
                          // Hide loading when image is loaded
                          e.target.parentElement.querySelector('.image-loading')?.classList.add('hidden');
                        }}
                        onError={(e) => {
                          // Hide loading on error too
                          e.target.parentElement.querySelector('.image-loading')?.classList.add('hidden');
                        }}
                      />
                      
                      {/* Loading Overlay - Hidden by default when image loads */}
                      <div className="image-loading absolute inset-0 bg-gray-100 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      
                      {/* Main Image Badge */}
                      {formData.mainImage === image && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1 shadow-sm">
                          <Star className="w-3 h-3 fill-current" />
                        </div>
                      )}
                      
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                      
                      {/* Image Index */}
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Image Upload */}
              <ImageUpload
                onMultipleUpload={(urls) => {
                  setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, ...urls],
                    mainImage: prev.mainImage || (urls.length > 0 ? urls[0] : '')
                  }));
                }}
                buttonText="Ajouter des images"
                multiple={true}
                maxFiles={10}
              />
              
              <p className="text-xs text-muted-foreground mt-2">
                {formData.images.length} image(s) téléchargée(s)
              </p>
            </div>

            {/* Main Image Preview */}
            {formData.mainImage && (
              <div className="mt-6 p-4 border rounded-lg bg-muted/20">
                <Label className="text-base font-medium">Aperçu de l&apos;image principale</Label>
                <div className="mt-3 flex flex-col items-center">
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden max-w-xs aspect-square">
                    <Image 
                      src={formData.mainImage} 
                      width={200}
                      height={200}
                      alt="Image principale"
                      className="w-full h-full object-contain"
                      onLoad={(e) => {
                        e.target.parentElement.querySelector('.main-image-loading')?.classList.add('hidden');
                      }}
                      onError={(e) => {
                        e.target.parentElement.querySelector('.main-image-loading')?.classList.add('hidden');
                      }}
                    />
                    {/* Loading for main image */}
                    <div className="main-image-loading absolute inset-0 bg-gray-100 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-3 max-w-md">
                    Cette image sera affichée comme image principale du produit sur le site
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Specifications Tab */}
        <TabsContent value="specs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="processor">Processeur</Label>
              <Input
                id="processor"
                value={formData.specifications.processor}
                onChange={(e) => handleSpecificationChange('processor', e.target.value)}
                placeholder="Ex: Intel Core i7"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ram">Mémoire RAM</Label>
              <Input
                id="ram"
                value={formData.specifications.ram}
                onChange={(e) => handleSpecificationChange('ram', e.target.value)}
                placeholder="Ex: 16GB DDR4"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storage">Stockage</Label>
              <Input
                id="storage"
                value={formData.specifications.storage}
                onChange={(e) => handleSpecificationChange('storage', e.target.value)}
                placeholder="Ex: 512GB SSD"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display">Écran</Label>
              <Input
                id="display"
                value={formData.specifications.display}
                onChange={(e) => handleSpecificationChange('display', e.target.value)}
                placeholder="Ex: 14' Retina"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="graphics">Carte graphique</Label>
              <Input
                id="graphics"
                value={formData.specifications.graphics}
                onChange={(e) => handleSpecificationChange('graphics', e.target.value)}
                placeholder="Ex: NVIDIA GeForce RTX 3060"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operatingSystem">Système d&apos;exploitation</Label>
              <Input
                id="operatingSystem"
                value={formData.specifications.operatingSystem}
                onChange={(e) => handleSpecificationChange('operatingSystem', e.target.value)}
                placeholder="Ex: Windows 11, macOS"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Caractéristiques</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Ajouter une caractéristique"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFeature();
                  }
                }}
              />
              <Button type="button" onClick={addFeature} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statut du produit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Produit actif</Label>
                  <p className="text-sm text-muted-foreground">
                    Le produit sera visible sur le site
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isFeatured">Produit en vedette</Label>
                  <p className="text-sm text-muted-foreground">
                    Le produit sera mis en avant sur le site
                  </p>
                </div>
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4 border-t">
        <div className="flex gap-2">
            <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 sm:flex-none"
            >
            Annuler
            </Button>
        </div>
        
        <div className="flex gap-2 mb-3 sm:mb-0">
            {activeTab !== 'basic' && (
            <Button
                type="button"
                variant="outline"
                onClick={() => {
                const tabs = ['basic', 'media', 'specs', 'settings'];
                const currentIndex = tabs.indexOf(activeTab);
                if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1]);
                }
                }}
                className="flex-1 sm:flex-none"
            >
                ← Précédent
            </Button>
            )}
            
            {activeTab !== 'settings' ? (
            <Button
                type="button"
                onClick={() => {
                const tabs = ['basic', 'media', 'specs', 'settings'];
                const currentIndex = tabs.indexOf(activeTab);
                if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1]);
                }
                }}
                className="flex-1 sm:flex-none"
            >
                Suivant →
            </Button>
            ) : (
            <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 sm:flex-none"
            >
                {loading ? 'Enregistrement...' : product ? 'Modifier' : 'Créer'}
            </Button>
            )}
        </div>
        </div>
    </form>
  );
}

// Add these icon components at the bottom of ProductForm.js

// Icon Components
function InfoIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function CpuIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  );
}

function SettingsIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}