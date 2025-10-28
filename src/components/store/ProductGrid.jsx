import ProductCard from './ProductCard';

export default function ProductGrid({ products, totalProducts }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 mb-4">
          <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1M9 7h6" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Aucun produit ne correspond à vos critères de recherche. Essayez d'ajuster vos filtres.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-gray-600">
          Affichage de <span className="font-semibold text-gray-900">{products.length}</span> 
          {' '}produit{products.length > 1 ? 's' : ''} sur {totalProducts}
        </p>
      </div>

      {/* Grid 3x3 sur les écrans larges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}