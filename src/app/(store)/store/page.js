'use client';

import { useState, useEffect } from 'react';
import ProductGrid from '@/components/store/ProductGrid';
import ProductFilters from '@/components/store/ProductFilters';
import { FaSearch } from "react-icons/fa";

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
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

        // Handle the new API response format
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        const brandsData = await brandsRes.json();

        // Extract data based on API response format
        const productsArray = Array.isArray(productsData) ? productsData : (productsData.products || []);
        const categoriesArray = categoriesData.success ? categoriesData.categories : (categoriesData.categories || []);
        const brandsArray = brandsData.success ? brandsData.brands : (brandsData.brands || []);

        // Filter products to only show those with available stock
        const availableProducts = productsArray.filter(product => {
          // Check if product has stock and it's available
          const hasStock = product.stock && 
                          product.stock.currentQuantity > 0 && 
                          product.stock.status !== 'out_of_stock';
          
          // Also check if product is active
          const isActive = product.isActive !== false;
          
          return hasStock && isActive;
        });

        console.log(`Total products: ${productsArray.length}, Available: ${availableProducts.length}`);

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
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar des filtres */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <ProductFilters
              categories={categories}
              brands={brands}
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
              <h1 className="text-3xl font-bold text-gray-900">Notre Boutique</h1>
              <p className="text-gray-600 mt-2">
                Découvrez notre collection de produits disponibles
              </p>
              
              {/* Results counter */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {filteredProducts.length === products.length 
                    ? `${products.length} produit${products.length !== 1 ? 's' : ''} disponible${products.length !== 1 ? 's' : ''}`
                    : `${filteredProducts.length} produit${filteredProducts.length !== 1 ? 's' : ''} sur ${products.length} disponible${products.length !== 1 ? 's' : ''}`
                  }
                </p>
                
                {filteredProducts.length !== products.length && (
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
                  {products.length === 0 
                    ? "Aucun produit n'est actuellement disponible en stock. Revenez bientôt pour découvrir nos nouvelles arrivées!"
                    : "Aucun produit ne correspond à vos critères de recherche. Essayez de modifier vos filtres ou explorez d'autres catégories."
                  }
                </p>
                {products.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-md hover:shadow-lg"
                  >
                    Effacer tous les filtres
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}