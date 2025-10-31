'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { FaSearch, FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa'
import CartDrawer from '@/components/store/CartDrawer'

export default function StoreHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [cartItemsCount, setCartItemsCount] = useState(0)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const pathname = usePathname()

  // Effet pour détecter le scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Listen for cart updates
  // In your StoreHeader component, add this useEffect:
  useEffect(() => {
    const handleCartUpdate = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartItemsCount(cart.reduce((total, item) => total + item.quantity, 0))
    }

    // Listen for cart updates from ProductCard
    window.addEventListener('cartUpdated', handleCartUpdate)
    
    // Initial cart count
    handleCartUpdate()

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  const navigation = [
    { name: 'Accueil', href: '/', current: pathname === '/' },
    { name: 'Boutique', href: '/store', current: pathname === '/store' },
    { name: 'Catégories', href: '/categories', current: pathname === '/categories' },
    { name: 'Nouveautés', href: '/new', current: pathname === '/new' },
    { name: 'Promotions', href: '/sale', current: pathname === '/sale' },
  ]

  return (
    <>
      <header className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
          : 'bg-white border-b border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link 
                href="/" 
                className="flex items-center space-x-2 group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">YS</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                  EliteShop
                </span>
              </Link>
            </div>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    item.current
                      ? 'text-blue-600 bg-blue-50 font-semibold'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                  {item.current && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* Search - Desktop Only */}
              <div className="hidden sm:block relative">
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <FaSearch className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Cart - Desktop Only */}
              <button 
                className="hidden sm:flex p-2 text-gray-600 hover:text-blue-600 transition-colors relative"
                onClick={() => setIsCartOpen(true)}
              >
                <FaShoppingCart className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-medium animate-pulse">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              {/* Mobile menu button */}
              <button 
                className="lg:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <FaTimes className="w-6 h-6" />
                ) : (
                  <FaBars className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200 bg-white/95 backdrop-blur-md">
              {/* Mobile Search */}
              <div className="mb-4 px-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              <div className="flex flex-col space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      item.current
                        ? 'text-blue-600 bg-blue-50 font-semibold border-l-4 border-blue-600'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Mobile Cart Button */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => {
                    setIsMenuOpen(false)
                    setIsCartOpen(true)
                  }}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <FaShoppingCart className="w-5 h-5" />
                  <span>Voir mon panier ({cartItemsCount})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItemsCount={cartItemsCount}
      />
    </>
  )
}