'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { FaSearch, FaShoppingCart, FaBars, FaTimes, FaChevronDown, FaFolder, FaSpinner } from 'react-icons/fa'
import CartDrawer from '@/components/store/CartDrawer'
import Image from 'next/image';

export default function StoreHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [cartItemsCount, setCartItemsCount] = useState(0)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const pathname = usePathname()

  // Effet pour détecter le scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const response = await fetch('/api/public/categories')
        const data = await response.json()
        if (data.success) {
          setCategories(data.categories)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartItemsCount(cart.reduce((total, item) => total + item.quantity, 0))
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    handleCartUpdate()

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  // Close categories dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.categories-dropdown')) {
        setIsCategoriesOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navigation = [
    { name: 'Accueil', href: '/', current: pathname === '/' },
    { name: 'Boutique', href: '/store', current: pathname === '/store' },
    { name: 'Contact', href: '/contact', current: pathname === '/contact' },
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
                  Electro Anbari
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
              
              {/* Categories Dropdown */}
              <div className="relative categories-dropdown">
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isCategoriesOpen || pathname.startsWith('/store?category=')
                      ? 'text-blue-600 bg-blue-50 font-semibold'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <span>Catégories</span>
                  <FaChevronDown className={`w-3 h-3 transition-transform duration-200 ${
                    isCategoriesOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Dropdown Menu */}
                {isCategoriesOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="max-h-80 overflow-y-auto">
                      {loadingCategories ? (
                        <div className="flex items-center justify-center py-4">
                          <FaSpinner className="w-4 h-4 text-blue-600 animate-spin mr-2" />
                          <span className="text-sm text-gray-600">Chargement...</span>
                        </div>
                      ) : categories.length > 0 ? (
                        categories.map((category) => (
                          <Link
                            key={category._id}
                            href={`/store?category=${category._id}`}
                            onClick={() => setIsCategoriesOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            {category.image ? (
                              <Image fill 
                                src={category.image} 
                                alt={category.name}
                                className="w-6 h-6 rounded object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                                <FaFolder className="w-3 h-3 text-gray-500" />
                              </div>
                            )}
                            <span>{category.name}</span>
                          </Link>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          Aucune catégorie disponible
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
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
                
                {/* Mobile Categories */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="px-4 py-2 text-sm font-semibold text-gray-500 mb-2">
                    Catégories
                  </div>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {loadingCategories ? (
                      <div className="flex items-center justify-center py-4">
                        <FaSpinner className="w-4 h-4 text-blue-600 animate-spin mr-2" />
                        <span className="text-sm text-gray-600">Chargement...</span>
                      </div>
                    ) : categories.length > 0 ? (
                      categories.map((category) => (
                        <Link
                          key={category._id}
                          href={`/store?category=${category._id}`}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                        >
                          {category.image ? (
                            <Image fill 
                              src={category.image} 
                              alt={category.name}
                              className="w-6 h-6 rounded object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                              <FaFolder className="w-3 h-3 text-gray-500" />
                            </div>
                          )}
                          <span>{category.name}</span>
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        Aucune catégorie disponible
                      </div>
                    )}
                  </div>
                </div>
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