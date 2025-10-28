'use client';

import { useState, useEffect } from 'react';
import ProductGrid from '@/components/store/ProductGrid';
import ProductFilters from '@/components/store/ProductFilters';

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

  // Charger les données
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

        setProducts(productsData.products || []);
        setCategories(categoriesData.categories || []);
        setBrands(brandsData.brands || []);
        setFilteredProducts(productsData.products || []);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
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
                Découvrez notre incroyable collection de produits
              </p>
            </div>

            <ProductGrid 
              products={filteredProducts}
              totalProducts={products.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
}