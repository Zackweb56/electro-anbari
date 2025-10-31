import Link from 'next/link';
import ProductCard from '@/components/store/ProductCard';
import CategoriesGrid from '@/components/store/CategoriesGrid';
import BrandsGrid from '@/components/store/BrandsGrid';
import ContactInfo from '@/components/store/ContactInfo';

// React Icons imports for benefits and contact sections
import { 
  FaTruck, 
  FaLock, 
  FaHeadset, 
  FaPhone, 
  FaEnvelope, 
  FaClock, 
  FaMapMarkerAlt 
} from 'react-icons/fa';

// Fetch featured products with stock information
async function getFeaturedProducts() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/products?featured=true`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch featured products');
    }
    
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

// Fetch latest products (last 4 added)
async function getLatestProducts() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/products?limit=4`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch latest products');
    }
    
    const data = await res.json();
    return Array.isArray(data) ? data.slice(0, 4) : []; // Ensure we only get 4 products
  } catch (error) {
    console.error('Error fetching latest products:', error);
    return [];
  }
}

// Fetch active categories
async function getCategories() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/categories`, {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    const data = await res.json();
    return data.success ? data.categories : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Fetch active brands
async function getBrands() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/brands`, {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch brands');
    }
    
    const data = await res.json();
    return data.success ? data.brands : [];
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
}

export default async function HomePage() {
  // Fetch data in parallel
  const [featuredProducts, latestProducts, categories, brands] = await Promise.all([
    getFeaturedProducts(),
    getLatestProducts(),
    getCategories(),
    getBrands()
  ]);

  // Ensure we always have arrays
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeBrands = Array.isArray(brands) ? brands : [];
  const safeFeaturedProducts = Array.isArray(featuredProducts) ? featuredProducts : [];
  const safeLatestProducts = Array.isArray(latestProducts) ? latestProducts : [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Bienvenue dans Notre Boutique
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Découvrez les meilleurs produits tech au meilleur prix
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/store" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
            >
              Voir tous les produits
            </Link>
            <Link 
              href="/store" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition duration-300"
            >
              Notre Magasin
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Catégories</h2>
          <CategoriesGrid categories={safeCategories} />
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Produits Populaires</h2>
            <Link 
              href="/store" 
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Voir tous →
            </Link>
          </div>
          
          {safeFeaturedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {safeFeaturedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucun produit populaire pour le moment
            </div>
          )}
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Marques Partenaires</h2>
          <BrandsGrid brands={safeBrands} />
        </div>
      </section>

      {/* Latest Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Nouveaux Produits</h2>
            <Link 
              href="/store" 
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Voir tous →
            </Link>
          </div>
          
          {safeLatestProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {safeLatestProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucun nouveau produit pour le moment
            </div>
          )}
        </div>
      </section>

      {/* YouTube Video Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Dernière Vidéo YouTube</h2>
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">
                [Intégration YouTube - Dernière vidéo de la chaîne]
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits/Features Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Pourquoi Nous Choisir ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTruck className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Livraison Rapide</h3>
              <p className="opacity-90">Expédition sous 24h pour toutes les commandes</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaLock className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Paiement Sécurisé</h3>
              <p className="opacity-90">Transactions 100% sécurisées</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHeadset className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Support 7j/7</h3>
              <p className="opacity-90">Notre équipe à votre écoute</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <ContactInfo />
    </div>
  );
}