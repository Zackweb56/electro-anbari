// src/lib/store.js
const API_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// Récupérer tous les produits actifs
export async function getProducts(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    // Ajouter les filtres
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.brand) queryParams.append('brand', filters.brand);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
    if (filters.sort) queryParams.append('sort', filters.sort);
    
    const response = await fetch(`${API_URL}/api/public/products?${queryParams}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) throw new Error('Erreur lors de la récupération des produits');
    
    return await response.json();
  } catch (error) {
    console.error('Erreur getProducts:', error);
    return { products: [], total: 0 };
  }
}

// Récupérer un produit par slug
export async function getProductBySlug(slug) {
  try {
    const response = await fetch(`${API_URL}/api/public/products/${slug}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) throw new Error('Produit non trouvé');
    
    return await response.json();
  } catch (error) {
    console.error('Erreur getProductBySlug:', error);
    return null;
  }
}

// Récupérer les catégories actives
export async function getActiveCategories() {
  try {
    const response = await fetch(`${API_URL}/api/public/categories`, {
      cache: 'no-store'
    });
    
    if (!response.ok) throw new Error('Erreur lors de la récupération des catégories');
    
    return await response.json();
  } catch (error) {
    console.error('Erreur getActiveCategories:', error);
    return [];
  }
}

// Récupérer les marques actives
export async function getActiveBrands() {
  try {
    const response = await fetch(`${API_URL}/api/public/brands`, {
      cache: 'no-store'
    });
    
    if (!response.ok) throw new Error('Erreur lors de la récupération des marques');
    
    return await response.json();
  } catch (error) {
    console.error('Erreur getActiveBrands:', error);
    return [];
  }
}