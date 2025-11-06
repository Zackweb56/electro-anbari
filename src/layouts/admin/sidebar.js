'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

// SVG Icons (garder le même code)
const Icons = {
  Tableau: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    </svg>
  ),
  Catégories: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  Marques: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
    </svg>
  ),
  Produits: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Stock: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  Commandes: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  Rapports: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
};

export default function AdminSidebar({ isMobileOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeLink, setActiveLink] = useState(null);

  useEffect(() => {
    setActiveLink(null);
  }, [pathname]);

  const menuItems = [
    { href: '/admin/dashboard', label: 'Tableau de Bord', icon: Icons.Tableau },
    { href: '/admin/categories', label: 'Catégories', icon: Icons.Catégories },
    { href: '/admin/brands', label: 'Marques', icon: Icons.Marques },
    { href: '/admin/products', label: 'Produits', icon: Icons.Produits },
    { href: '/admin/stock', label: 'Gestion de Stock', icon: Icons.Stock },
    { href: '/admin/orders', label: 'Commandes', icon: Icons.Commandes },
  ];

  // Fonction de fermeture par défaut si onClose n'est pas fourni
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleItemClick = (href) => {
    setActiveLink(href);
    handleClose(); // Fermer le menu mobile après clic
    router.push(href);
  };

  return (
    <>
      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-card border-r border-border text-card-foreground transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header avec bouton fermer sur mobile */}
        <div className="px-8 py-3 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-card-foreground">Electro Anbari</h1>
            <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
              Gestion de Magasin d&apos;Ordinateurs
            </p>
          </div>
          {/* Bouton fermer - visible seulement sur mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="lg:hidden h-8 w-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Menu */}
        <ScrollArea className="h-full">
          <nav className="p-4">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={`w-full justify-start text-left ${
                      isActive
                        ? 'bg-secondary text-secondary-foreground'
                        : 'text-card-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                    onClick={() => handleItemClick(item.href)}
                  >
                    <span className="flex-shrink-0 mr-3">{item.icon}</span>
                    <span className="font-medium flex-1 text-left">{item.label}</span>
                    {activeLink === item.href && (
                      <div className="ml-2 animate-spin">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    )}
                  </Button>
                );
              })}
            </div>
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
}