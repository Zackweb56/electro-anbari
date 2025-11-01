import Link from 'next/link';
import ContactInfo from '@/components/store/ContactInfo';
// Composant Slider pour les produits
import ProductsSlider from '@/components/store/ProductsSlider';
import BrandsSection from '@/components/store/BrandsSection';

// React Icons imports
import { 
  FaArrowRight,
  FaArrowCircleRight,
} from 'react-icons/fa';

// Fonctions de récupération des données
async function getFeaturedProducts() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/products?featured=true&limit=8`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch featured products');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

async function getLatestProducts() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/products?limit=8&sort=newest`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch latest products');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching latest products:', error);
    return [];
  }
}

async function getBrands() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/brands`, {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch brands');
    const data = await res.json();

    // CORRECTION : Accédez à data.brands au lieu de data
    return Array.isArray(data.brands) ? data.brands : [];
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
}

export default async function HomePage() {
  const [featuredProducts, latestProducts, brands] = await Promise.all([
    getFeaturedProducts(),
    getLatestProducts(),
    getBrands()
  ]);

  const safeFeaturedProducts = Array.isArray(featuredProducts) ? featuredProducts : [];
  const safeLatestProducts = Array.isArray(latestProducts) ? latestProducts : [];
  const safeBrands = Array.isArray(brands) ? brands : [];

  return (
    <div className="min-h-screen">
      {/* Section Hero */}
      <section className="bg-white border-b border-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4 tracking-tight">
            Excellence Technologique
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Découvrez des produits technologiques premium sélectionnés pour leur qualité et performance
          </p>
          <Link 
            href="/store" 
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors duration-200"
          >
            Acheter Maintenant
            <FaArrowCircleRight className="text-sm" />
          </Link>
        </div>
      </section>

      {/* Section Marques */}
      {safeBrands.length > 0 && (
        <BrandsSection brands={safeBrands} />
      )}

      {/* Meilleures Ventes */}
      {safeFeaturedProducts.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Meilleures Ventes</h2>
                  <p className="text-gray-600 text-sm">Produits les plus populaires</p>
                </div>
              </div>
              <Link 
                href="/store?sort=featured" 
                className="text-gray-600 hover:text-gray-900 font-medium text-sm flex items-center gap-1 transition-colors"
              >
                Voir tout
                <FaArrowRight className="text-xs" />
              </Link>
            </div>
            <ProductsSlider 
              products={safeFeaturedProducts.slice(0, 8)} 
              autoPlay={true}
              interval={4000}
            />
          </div>
        </section>
      )}

      {/* Nouveautés */}
      {safeLatestProducts.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Nouveautés</h2>
                  <p className="text-gray-600 text-sm">Nos dernières arrivages</p>
                </div>
              </div>
              <Link 
                href="/store?sort=newest" 
                className="text-gray-600 hover:text-gray-900 font-medium text-sm flex items-center gap-1 transition-colors"
              >
                Voir tout
                <FaArrowRight className="text-xs" />
              </Link>
            </div>
            <ProductsSlider 
              products={safeLatestProducts.slice(0, 8)} 
              autoPlay={true}
              interval={3500}
            />
          </div>
        </section>
      )}

      {/* Contact Info */}
      <ContactInfo />
    </div>
  );
}