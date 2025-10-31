"use client";

import Link from 'next/link';
import Image from 'next/image';

const CategoriesGrid = ({ categories }) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune catégorie disponible pour le moment
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {categories.slice(0, 6).map((category) => (
        <Link
          key={category._id}
          href={`/product?category=${category._id}`}
          className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition duration-300 border border-gray-200 group"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-gray-200 transition duration-300 overflow-hidden">
            {category.image ? (
              <Image
                src={category.image}
                alt={category.name}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {category.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <h3 className="font-semibold text-gray-800 text-sm">{category.name}</h3>
        </Link>
      ))}
    </div>
  );
};

export default CategoriesGrid;