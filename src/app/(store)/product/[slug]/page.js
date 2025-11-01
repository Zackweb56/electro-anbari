'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ProductGallery, 
  ProductInfo, 
  ProductSpecs, 
  ProductActions 
} from '@/components/store/product-details';

export default function ProductDetailPage() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/public/products/${params.slug}`);
        const data = await response.json();
        
        if (data.success) {
          setProduct(data.product);
        } else {
          setError(data.error || 'Produit non trouvé');
        }
      } catch (error) {
        setError('Erreur lors du chargement du produit');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Produit non trouvé</h2>
          <p className="text-gray-600 mb-4">{error || 'Le produit demandé n\'existe pas.'}</p>
          <a 
            href="/store" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à la boutique
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Fil d'Ariane */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link href="/home" className="hover:text-blue-600">Accueil</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link href="/store" className="hover:text-blue-600">Boutique</Link></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium truncate">{product.name}</li>
          </ol>
        </nav>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Colonne gauche - Galerie */}
          <div>
            <ProductGallery 
              images={product.images} 
              mainImage={product.mainImage}
              productName={product.name}
            />
          </div>

          {/* Colonne droite - Informations */}
          <div className="space-y-6">
            <ProductInfo product={product} />
            <ProductActions product={product} />
          </div>
        </div>

        {/* Spécifications techniques */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <ProductSpecs specifications={product.specifications} />
        )}
      </div>
    </div>
  );
}