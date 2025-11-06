// components/store/ProductFilters.jsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { FaFilter, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';

// Sub-component for filter sections
const FilterSection = ({ title, isOpen, onToggle, children }) => (
  <div className="mb-6">
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full text-left mb-3"
      aria-expanded={isOpen}
    >
      <span className="font-semibold text-gray-900">{title}</span>
      {isOpen ? (
        <FaChevronUp className="w-4 h-4 text-gray-500" />
      ) : (
        <FaChevronDown className="w-4 h-4 text-gray-500" />
      )}
    </button>
    {isOpen && children}
  </div>
);

// Sub-component for filter items
const FilterItem = ({ id, name, count, type, value, checked, onChange }) => (
  <label
    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
      checked
        ? 'bg-blue-50 border-blue-200 text-blue-700'
        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
    }`}
  >
    <div className="flex items-center gap-3">
      <input
        type="radio"
        name={type}
        value={id}
        checked={checked}
        onChange={(e) => onChange(type, e.target.value)}
        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
      />
      <span className="font-medium text-sm">{name}</span>
    </div>
    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full min-w-8 text-center">
      {count}
    </span>
  </label>
);

// Sub-component for active filter tags
const ActiveFilterTag = ({ label, value, onRemove }) => (
  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
    {label}: {value}
    <button
      onClick={onRemove}
      className="hover:text-blue-900 ml-1"
      aria-label={`Remove ${label} filter`}
    >
      ×
    </button>
  </span>
);

// Mobile Filter Button Component
const MobileFilterButton = ({ onClick, productCount, totalProductCount }) => (
  <button
    onClick={onClick}
    className="lg:hidden fixed bottom-4 left-4 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center gap-2"
  >
    <FaFilter className="w-4 h-4" />
    <span className="text-xs font-medium">Filtres</span>
    <span className="bg-white text-blue-600 text-xs px-1.5 py-0.5 rounded-full min-w-5 h-5 flex items-center justify-center">
      {productCount}
    </span>
  </button>
);

export default function ProductFilters({
  categories,
  brands,
  filters,
  onFilterChange,
  onClearFilters,
  productCount,
  totalProductCount
}) {
  const [openSections, setOpenSections] = useState({
    categories: true,
    brands: true,
    price: true
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile drawer when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  // Memoize category and brand counts for better performance
  const categoryCountMap = useMemo(() => {
    const map = new Map();
    categories.forEach(category => {
      map.set(category._id, category.productCount || 0);
    });
    return map;
  }, [categories]);

  const brandCountMap = useMemo(() => {
    const map = new Map();
    brands.forEach(brand => {
      map.set(brand._id, brand.productCount || 0);
    });
    return map;
  }, [brands]);

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePriceChange = (type, value) => {
    // Prevent negative prices and ensure valid numbers
    const numValue = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
    
    // If min price is set and max price exists, ensure min <= max
    if (type === 'minPrice' && filters.maxPrice && numValue > parseFloat(filters.maxPrice)) {
      onFilterChange('maxPrice', '');
    }
    
    // If max price is set and min price exists, ensure max >= min
    if (type === 'maxPrice' && filters.minPrice && numValue < parseFloat(filters.minPrice)) {
      onFilterChange('minPrice', '');
    }
    
    onFilterChange(type, numValue.toString());
  };

  const clearPriceFilter = () => {
    onFilterChange('minPrice', '');
    onFilterChange('maxPrice', '');
  };

  const handleClearFilters = () => {
    onClearFilters();
    // Close mobile drawer after clearing filters
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  };

  const hasActiveFilters = filters.category || filters.brand || filters.minPrice || filters.maxPrice;

  // Filter content component (reused for both desktop and mobile)
  const FilterContent = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full lg:h-auto lg:sticky lg:top-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <FaFilter className="w-4 h-4 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
            >
              <FaTimes className="w-3 h-3" />
              Effacer tout
            </button>
          )}
          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-800 font-medium text-center">
          {productCount} produit{productCount !== 1 ? 's' : ''} sur {totalProductCount}
        </p>
      </div>

      {/* Categories Section */}
      <FilterSection
        title="Catégories"
        isOpen={openSections.categories}
        onToggle={() => toggleSection('categories')}
      >
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {categories.map((category) => {
            const count = categoryCountMap.get(category._id) || 0;
            return (
              <FilterItem
                key={category._id}
                id={category._id}
                name={category.name}
                count={count}
                type="category"
                value={filters.category}
                checked={filters.category === category._id}
                onChange={onFilterChange}
              />
            );
          })}
        </div>
      </FilterSection>

      {/* Brands Section */}
      <FilterSection
        title="Marques"
        isOpen={openSections.brands}
        onToggle={() => toggleSection('brands')}
      >
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {brands.map((brand) => {
            const count = brandCountMap.get(brand._id) || 0;
            return (
              <FilterItem
                key={brand._id}
                id={brand._id}
                name={brand.name}
                count={count}
                type="brand"
                value={filters.brand}
                checked={filters.brand === brand._id}
                onChange={onFilterChange}
              />
            );
          })}
        </div>
      </FilterSection>

      {/* Price Range Section */}
      <FilterSection
        title="Prix"
        isOpen={openSections.price}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Min (MAD)
              </label>
              <input
                type="number"
                placeholder="0"
                min="0"
                value={filters.minPrice}
                onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Max (MAD)
              </label>
              <input
                type="number"
                placeholder="Max"
                min="0"
                value={filters.maxPrice}
                onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {(filters.minPrice || filters.maxPrice) && (
            <button
              onClick={clearPriceFilter}
              className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Effacer le filtre de prix
            </button>
          )}
        </div>
      </FilterSection>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-600 mb-2">Filtres actifs:</p>
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <ActiveFilterTag
                label="Catégorie"
                value={categories.find(c => c._id === filters.category)?.name}
                onRemove={() => onFilterChange('category', '')}
              />
            )}
            {filters.brand && (
              <ActiveFilterTag
                label="Marque"
                value={brands.find(b => b._id === filters.brand)?.name}
                onRemove={() => onFilterChange('brand', '')}
              />
            )}
            {filters.minPrice && (
              <ActiveFilterTag
                label="Min"
                value={`${filters.minPrice} MAD`}
                onRemove={() => onFilterChange('minPrice', '')}
              />
            )}
            {filters.maxPrice && (
              <ActiveFilterTag
                label="Max"
                value={`${filters.maxPrice} MAD`}
                onRemove={() => onFilterChange('maxPrice', '')}
              />
            )}
          </div>
        </div>
      )}

      {/* Apply Button for Mobile */}
      <div className="lg:hidden mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={() => setIsMobileOpen(false)}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Voir les produits ({productCount})
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-full lg:w-80 flex-shrink-0">
        <FilterContent />
      </div>

      {/* Mobile Filter Button */}
      <MobileFilterButton 
        onClick={() => setIsMobileOpen(true)}
        productCount={productCount}
        totalProductCount={totalProductCount}
      />

      {/* Mobile Overlay and Drawer */}
      {isMobileOpen && (
        <>
          {/* Overlay */}
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 animate-in fade-in duration-200"
            onClick={() => setIsMobileOpen(false)}
          />
          
          {/* Drawer */}
          <div className="lg:hidden fixed inset-y-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300 md:animate-in md:slide-in-from-left md:duration-300">
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto bg-white m-4 rounded-2xl">
                <FilterContent />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}