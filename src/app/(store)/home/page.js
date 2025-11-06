import Link from 'next/link';
import ContactInfo from '@/components/store/ContactInfo';
// Composant Slider pour les produits
import ProductsSlider from '@/components/store/ProductsSlider';
import BrandsSection from '@/components/store/BrandsSection';

// React Icons imports
import { 
  FaArrowRight,
  FaArrowCircleRight,
  FaTag,
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

async function getLatestProducts(limit = 5) {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/products?limit=${limit}&sort=newest`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch latest products');
    const data = await res.json();
    
    // Filter products to only show those with available stock
    const productsArray = Array.isArray(data) ? data : (data.products || []);
    const availableProducts = productsArray.filter(product => {
      const hasStock = product.stock && 
                      product.stock.currentQuantity > 0 && 
                      product.stock.status !== 'out_of_stock';
      const isActive = product.isActive !== false;
      return hasStock && isActive;
    });

    console.log(`Latest products: Total ${productsArray.length}, Available: ${availableProducts.length}`);
    
    return availableProducts;
  } catch (error) {
    console.error('Error fetching latest products:', error);
    return [];
  }
}

async function getDiscountedProducts() {
  try {
    // Fetch all products to get ALL discounted ones
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/products`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch discounted products');
    const data = await res.json();
    
    // Filter products to only show those with available stock AND comparePrice (discount)
    const productsArray = Array.isArray(data) ? data : (data.products || []);
    const discountedProducts = productsArray.filter(product => {
      const hasStock = product.stock && 
                      product.stock.currentQuantity > 0 && 
                      product.stock.status !== 'out_of_stock';
      const hasDiscount = product.comparePrice && product.comparePrice > product.price;
      const isActive = product.isActive !== false;
      return hasStock && hasDiscount && isActive;
    });

    console.log(`Discounted products: Total ${productsArray.length}, Discounted & Available: ${discountedProducts.length}`);
    
    return discountedProducts;
  } catch (error) {
    console.error('Error fetching discounted products:', error);
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

async function getConfig() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/config`, {
      next: { revalidate: 300 }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.config || null;
  } catch (err) {
    console.error('Error fetching public config:', err);
    return null;
  }
}

function toYouTubeEmbed(url) {
  if (!url) return null;
  try {
    const u = url.trim();

    // If already an embed URL, return as-is
    if (u.includes('youtube.com/embed')) return u;

    // Helper to parse a time string like "1h2m3s" or "87s" or numeric seconds
    const parseTimeParam = (t) => {
      if (!t) return 0;
      const s = String(t);
      // Matches h, m, s groups (e.g. 1h2m3s, 2m30s, 45s)
      const parts = s.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
      if (parts && (parts[1] || parts[2] || parts[3])) {
        const h = parseInt(parts[1] || '0', 10);
        const m = parseInt(parts[2] || '0', 10);
        const sec = parseInt(parts[3] || '0', 10);
        return h * 3600 + m * 60 + sec;
      }
      // Fallback: extract digits
      const num = parseInt(s.replace(/\D/g, ''), 10);
      return Number.isNaN(num) ? 0 : num;
    };

    // Extract video id from v= param
    const vMatch = u.match(/[?&]v=([^&]+)/);
    let id = vMatch && vMatch[1] ? vMatch[1] : null;

    // Extract from youtu.be short link
    if (!id) {
      const shortMatch = u.match(/youtu\.be\/([^?&]+)/);
      if (shortMatch && shortMatch[1]) id = shortMatch[1];
    }

    if (!id) return null;

    // Try to get time parameter (t= or start=)
    let start = 0;
    const tMatch = u.match(/[?&]t=([^&]+)/);
    if (tMatch && tMatch[1]) start = parseTimeParam(tMatch[1]);
    const startMatch = u.match(/[?&]start=(\d+)/);
    if (startMatch && startMatch[1]) start = parseInt(startMatch[1], 10) || start;

    return `https://www.youtube.com/embed/${id}${start ? `?start=${start}` : ''}`;
  } catch (e) {
    return null;
  }
}

export default async function HomePage() {
  // Change this number to display more or less latest products
  const LATEST_PRODUCTS_COUNT = 5;
  
  const [featuredProducts, latestProducts, discountedProducts, brands, config] = await Promise.all([
    getFeaturedProducts(),
    getLatestProducts(LATEST_PRODUCTS_COUNT),
    getDiscountedProducts(),
    getBrands(),
    getConfig()
  ]);

  const safeFeaturedProducts = Array.isArray(featuredProducts) ? featuredProducts : [];
  const safeLatestProducts = Array.isArray(latestProducts) ? latestProducts : [];
  const safeDiscountedProducts = Array.isArray(discountedProducts) ? discountedProducts : [];
  const safeBrands = Array.isArray(brands) ? brands : [];

  return (
    <div className="min-h-screen">
        {/* Section Hero */}
        <section className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_49%,rgba(59,130,246,0.05)_50%,transparent_51%)] bg-[size:10px_10px]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl mx-auto text-center">
                <div className="mb-8 relative">
                <div className="relative inline-block">
                    <h1 className="text-5xl md:text-7xl font-sans font-semibold text-white mb-2 tracking-tight">
                        ELECTRO
                    </h1>
                    <h2 className="text-4xl md:text-6xl font-sans font-medium text-blue-400/90 relative">
                        ANBARI
                        {/* Ligne de soulignement décorative */}
                        <div className="absolute -bottom-2 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                    </h2>
                </div>
                </div>

            <p className="text-base md:text-lg text-gray-300 mb-8 md:mb-12 max-w-md mx-auto leading-relaxed">
                Bienvenue dans votre boutique de technologie premium
            </p>

            <Link 
                href="/store" 
                className="group inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 md:px-10 md:py-4 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm md:text-base"
                >
                <span className="flex items-center gap-2">
                    Explorer Notre Boutique
                    <FaArrowCircleRight className="text-xs md:text-sm transition-transform group-hover:translate-x-1" />
                </span>
            </Link>
            </div>
        </div>
        </section>

      {/* YouTube Video (if configured) */}
      {config?.youtubeVideo && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">Notre Chaîne YouTube</h2>
              <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={toYouTubeEmbed(config.youtubeVideo) || ''}
                  title="YouTube video"
                  className="absolute inset-0 w-full h-full"
                  // frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section Marques */}
      {safeBrands.length > 0 && (
        <BrandsSection brands={safeBrands} />
      )}

      {/* Offres Spéciales - Discounted Products */}
      {safeDiscountedProducts.length > 0 && (
        <section className="py-12 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Offres Spéciales</h2>
                  <p className="text-gray-600 text-sm">Profitez de nos promotions exceptionnelles</p>
                </div>
              </div>
              <Link 
                href="/store?sort=discount" 
                className="text-gray-600 hover:text-gray-900 font-medium text-sm flex items-center gap-1 transition-colors"
              >
                Voir toutes
                <FaArrowRight className="text-xs" />
              </Link>
            </div>
            <ProductsSlider 
              products={safeDiscountedProducts} 
              autoPlay={true}
              interval={3000}
            />
          </div>
        </section>
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
                Voir tous
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
                  <p className="text-gray-600 text-sm">Nos {LATEST_PRODUCTS_COUNT} dernières arrivages en stock</p>
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
              products={safeLatestProducts} 
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