"use client";

import Image from 'next/image';

const BrandsGrid = ({ brands }) => {
  if (!brands || brands.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune marque partenaire pour le moment
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
      {brands.slice(0, 6).map((brand) => (
        <div
          key={brand._id}
          className="bg-white rounded-lg p-4 flex items-center justify-center h-20 shadow-sm hover:shadow-md transition duration-300"
        >
          {brand.logo ? (
            <div className="relative w-full h-12">
              <Image
                src={brand.logo}
                alt={brand.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100px, 150px"
              />
            </div>
          ) : (
            <span className="text-xl font-semibold text-gray-700">{brand.name}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default BrandsGrid;