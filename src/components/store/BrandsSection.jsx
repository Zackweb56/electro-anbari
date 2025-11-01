'use client';

import Image from 'next/image';

export default function BrandsSection({ brands }) {
  const activeBrands = brands.filter(b => b.isActive);
  if (!activeBrands.length) return null;

  // Duplicate multiple times so mobile always sees a full loop
  const loopBrands = [...activeBrands, ...activeBrands, ...activeBrands];

  return (
    <section className="py-12 bg-white border-t border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">Nos Marques</h2>
        <p className="text-gray-500 text-sm mt-1">Partenaires de confiance</p>
      </div>

      <div className="relative overflow-hidden">
        {/* gradient fade edges */}
        <div className="pointer-events-none absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-white to-transparent z-10" />

        {/* wrapper (track) */}
        <div className="flex gap-8 px-8 animate-marquee whitespace-nowrap">
          {loopBrands.map((brand, index) => (
            <div
              key={index}
              className="inline-flex w-28 sm:w-36 md:w-40 h-16 sm:h-20 flex items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              {brand.logo ? (
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={120}
                  height={60}
                  className="object-contain max-h-10 sm:max-h-12 opacity-80 hover:opacity-100 transition-opacity duration-300"
                />
              ) : (
                <span className="text-gray-400 text-xs">{brand.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* keyframes */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }

        .animate-marquee:hover {
          animation-play-state: paused;
        }

        /* responsive speed tuning */
        @media (max-width: 640px) {
          .animate-marquee {
            animation-duration: 40s;
          }
        }
      `}</style>
    </section>
  );
}
