// src/app/(store)/store/page.js
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductGrid from '@/components/store/ProductGrid';
import ProductFilters from '@/components/store/ProductFilters';
import { FaSearch, FaHome, FaStore } from "react-icons/fa";
import Link from 'next/link';

// Composant principal avec Suspense
function StoreContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    brand: '',
    minPrice: '',
    maxPrice: '',
  });
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Charger les données avec filtrage des produits en stock
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [productsRes, categoriesRes, brandsRes] = await Promise.all([
          fetch('/api/public/products'),
          fetch('/api/public/categories'),
          fetch('/api/public/brands')
        ]);

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        const brandsData = await brandsRes.json();

        const productsArray = Array.isArray(productsData) ? productsData : (productsData.products || []);
        const categoriesArray = categoriesData.success ? categoriesData.categories : (categoriesData.categories || []);
        const brandsArray = brandsData.success ? brandsData.brands : (brandsData.brands || []);

        // Filter products to only show those with available stock
        const availableProducts = productsArray.filter(product => {
          const hasStock = product.stock && 
                          product.stock.currentQuantity > 0 && 
                          product.stock.status !== 'out_of_stock';
          const isActive = product.isActive !== false;
          return hasStock && isActive;
        });

        setProducts(availableProducts);
        setCategories(categoriesArray);
        setBrands(brandsArray);
        setFilteredProducts(availableProducts);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setProducts([]);
        setCategories([]);
        setBrands([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Appliquer les filtres
  useEffect(() => {
    let filtered = products;

    if (filters.category) {
      filtered = filtered.filter(product => 
        product.category?._id === filters.category
      );
    }

    if (filters.brand) {
      filtered = filtered.filter(product => 
        product.brand?._id === filters.brand
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter(product => 
        product.price >= parseFloat(filters.minPrice)
      );
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(product => 
        product.price <= parseFloat(filters.maxPrice)
      );
    }

    setFilteredProducts(filtered);
  }, [products, filters]);

  // Effet pour synchroniser avec les paramètres d'URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setFilters(prev => ({
        ...prev,
        category: categoryFromUrl
      }));
    }
  }, [searchParams]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
    });
    // Optionnel: Rediriger vers la page store sans paramètres
    window.history.replaceState(null, '', '/store');
  };

  const clearCategoryFilter = () => {
    setFilters(prev => ({
      ...prev,
      category: ''
    }));
    window.history.replaceState(null, '', '/store');
  };

  // Trouver la catégorie sélectionnée
  const selectedCategory = categories.find(cat => cat._id === filters.category);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des produits...</p>
        </div>
      </div>
    );
  }

    // Calculate product counts for categories and brands
    const categoriesWithCounts = categories.map(category => ({
      ...category,
      productCount: products.filter(product => product.category?._id === category._id).length
    }));
  
    const brandsWithCounts = brands.map(brand => ({
      ...brand,
      productCount: products.filter(product => product.brand?._id === brand._id).length
    }));

  return (
    <div className="min-h-screen bg-white">
      {/* Mini Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black py-12 lg:py-16 overflow-hidden">
        {/* Diagonal Pattern Background */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_49%,rgba(59,130,246,0.05)_50%,transparent_51%)] bg-[size:10px_10px]"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Breadcrumb */}
            <nav className="mb-4 flex items-center justify-center gap-2 text-sm text-gray-400">
              <Link href="/home" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                <FaHome className="w-3 h-3" />
                Accueil
              </Link>
              <span className="opacity-50">/</span>
              <span className="text-blue-400 font-medium flex items-center gap-1.5">
                <FaStore className="w-3 h-3" />
                Boutique
              </span>
            </nav>

            {/* Title */}
            <div className="mb-4">
              <div className="relative inline-block">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold text-white mb-2 tracking-tight">
                  Notre Boutique
                </h1>
                {/* Decorative underline */}
                <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Découvrez notre collection exclusive de produits high-tech et électroniques
            </p>

          </div>
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute top-10 left-10 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-8 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar des filtres */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <ProductFilters
              categories={categoriesWithCounts}
              brands={brandsWithCounts}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              productCount={filteredProducts.length}
              totalProductCount={products.length}
            />
          </div>
          
          {/* Grille des produits */}
          <div className="flex-1">
            <div className="mb-8">
              {/* Titre dynamique */}
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory ? selectedCategory.name : 'Tous les Produits'}
              </h2>
              <p className="text-gray-600 mt-2">
                {selectedCategory 
                  ? `Découvrez nos produits dans la catégorie ${selectedCategory.name}`
                  : 'Explorez notre collection complète de produits disponibles'
                }
              </p>
              
              {/* Indicateur de filtre de catégorie actif */}
              {selectedCategory && (
                <div className="mt-4 flex items-center space-x-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex-1">
                    <span className="text-sm text-blue-800 font-medium">
                      Filtre actif : {selectedCategory.name}
                    </span>
                  </div>
                  <button
                    onClick={clearCategoryFilter}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center space-x-1"
                  >
                    <span>×</span>
                    <span>Supprimer</span>
                  </button>
                </div>
              )}
              
              {/* Results counter */}
              <div className={`mt-4 flex items-center justify-between ${selectedCategory ? 'mt-6' : ''}`}>
                <p className="text-sm text-gray-600">
                  {filteredProducts.length === products.length 
                    ? `${products.length} produit${products.length !== 1 ? 's' : ''} disponible${products.length !== 1 ? 's' : ''}`
                    : `${filteredProducts.length} produit${filteredProducts.length !== 1 ? 's' : ''} sur ${products.length} disponible${products.length !== 1 ? 's' : ''}`
                  }
                </p>
                
                {filteredProducts.length !== products.length && !selectedCategory && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Effacer les filtres
                  </button>
                )}
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gradient-to-b from-gray-50 to-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-blue-500 text-7xl mb-6 animate-bounce-slow">
                  <FaSearch />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Aucun produit trouvé
                </h3>
                <p className="text-gray-600 max-w-md mb-6">
                  {selectedCategory 
                    ? `Aucun produit disponible dans la catégorie "${selectedCategory.name}". Essayez une autre catégorie ou consultez tous nos produits.`
                    : products.length === 0 
                      ? "Aucun produit n'est actuellement disponible en stock. Revenez bientôt pour découvrir nos nouvelles arrivées!"
                      : "Aucun produit ne correspond à vos critères de recherche. Essayez de modifier vos filtres ou explorez d'autres catégories."
                  }
                </p>
                <div className="flex space-x-3">
                  {selectedCategory && (
                    <button
                      onClick={clearCategoryFilter}
                      className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all"
                    >
                      Voir tous les produits
                    </button>
                  )}
                  {products.length > 0 && !selectedCategory && (
                    <button
                      onClick={clearFilters}
                      className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all"
                    >
                      Effacer tous les filtres
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// Page principale avec Suspense
export default function StorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <StoreContent />
    </Suspense>
  );
}