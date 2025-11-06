'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { FaSearch, FaShoppingCart, FaBars, FaTimes, FaChevronDown, FaFolder, FaSpinner, FaBox, FaTag } from 'react-icons/fa'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState(null)
  const searchInputRef = useRef(null)
  const searchDropdownRef = useRef(null)
  const pathname = usePathname()
  const router = useRouter()

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

  // Enhanced search functionality with debouncing
  const searchProducts = useCallback(async (query) => {
    if (query.length < 3) {
      setSearchSuggestions([])
      setShowSearchDropdown(false)
      return
    }

    setSearchLoading(true)
    try {
      const response = await fetch(`/api/public/products/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error('Search failed')
      const data = await response.json()
      setSearchSuggestions(data)
      setShowSearchDropdown(data.length > 0)
    } catch (error) {
      console.error('Search error:', error)
      setSearchSuggestions([])
      setShowSearchDropdown(false)
    } finally {
      setSearchLoading(false)
    }
  }, [])

  // Debounced search effect
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    if (searchQuery.length >= 3) {
      const timer = setTimeout(() => {
        searchProducts(searchQuery)
      }, 300)
      setSearchTimeout(timer)
    } else {
      setSearchSuggestions([])
      setShowSearchDropdown(false)
    }

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchQuery, searchProducts])

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close categories dropdown
      if (!event.target.closest('.categories-dropdown')) {
        setIsCategoriesOpen(false)
      }
      
      // Close search dropdown
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSearchDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim().length >= 3) {
      router.push(`/store?search=${encodeURIComponent(searchQuery)}`)
      setShowSearchDropdown(false)
      setSearchQuery('')
    }
  }

  // Handle product selection from search
  const handleProductSelect = (productSlug) => {
    router.push(`/product/${productSlug}`)
    setShowSearchDropdown(false)
    setSearchQuery('')
    setIsMenuOpen(false)
  }

  // Highlight matching text in search results
  const highlightMatch = (text, query) => {
    if (!text || !query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600">$1</mark>');
  };

  const navigation = [
    { name: 'Accueil', href: '/home', current: pathname === '/home' },
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
                className="flex items-center space-x-3 group"
              >
                <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm group-hover:border-blue-300 transition-colors duration-300">
                  <span className="text-blue-600 font-bold text-sm tracking-tight">EA</span>
                </div>
                
                <div className="border-l border-gray-200 pl-3">
                  <span className="text-xl font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    Electro Anbari
                  </span>
                </div>
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
                              <Image 
                                width={80}
                                height={80}
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
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Rechercher un produit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length >= 3 && setShowSearchDropdown(true)}
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FaSearch className="w-4 h-4 text-gray-400" />
                  </div>
                  {searchQuery.length >= 3 && (
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700"
                    >
                      <FaSearch className="w-4 h-4" />
                    </button>
                  )}
                </form>
                
                {/* Search Dropdown */}
                {showSearchDropdown && (
                  <div 
                    ref={searchDropdownRef}
                    className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto"
                  >
                    {searchLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <FaSpinner className="w-5 h-5 text-blue-600 animate-spin mr-3" />
                        <span className="text-sm text-gray-600">Recherche en cours...</span>
                      </div>
                    ) : searchSuggestions.length > 0 ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Produits trouvés ({searchSuggestions.length})
                          </div>
                        </div>
                        {searchSuggestions.map((product) => (
                          <button
                            key={product._id}
                            onClick={() => handleProductSelect(product.slug)}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors group"
                          >
                            {product.mainImage ? (
                              <Image
                                src={product.mainImage}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200 group-hover:border-blue-300 transition-colors"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <FaBox className="w-5 h-5 text-gray-500 group-hover:text-blue-500" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div 
                                className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors text-sm mb-1"
                                dangerouslySetInnerHTML={{ 
                                  __html: highlightMatch(product.name, searchQuery) 
                                }}
                              />
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                {product.brand?.name && (
                                  <span className="flex items-center space-x-1">
                                    <FaTag className="w-3 h-3" />
                                    <span>{product.brand.name}</span>
                                  </span>
                                )}
                                {product.category?.name && (
                                  <span>• {product.category.name}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-blue-600">
                                {product.price} MAD
                              </div>
                              {product.comparePrice && product.comparePrice > product.price && (
                                <div className="text-xs text-gray-400 line-through">
                                  {product.comparePrice} MAD
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </>
                    ) : searchQuery.length >= 3 ? (
                      <div className="px-4 py-6 text-center">
                        <FaBox className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <div className="text-sm text-gray-500">
                          Aucun produit trouvé pour "<span className="font-medium text-gray-700">{searchQuery}</span>"
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Essayez d'autres termes de recherche
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
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
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Rechercher un produit..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </form>
                
                {/* Mobile Search Dropdown */}
                {showSearchDropdown && (
                  <div className="mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
                    {searchLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <FaSpinner className="w-5 h-5 text-blue-600 animate-spin mr-3" />
                        <span className="text-sm text-gray-600">Recherche...</span>
                      </div>
                    ) : searchSuggestions.length > 0 ? (
                      searchSuggestions.map((product) => (
                        <button
                          key={product._id}
                          onClick={() => handleProductSelect(product.slug)}
                          className="flex items-center space-x-3 w-full px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-blue-50 transition-colors"
                        >
                          {product.mainImage ? (
                            <Image
                              src={product.mainImage}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                              <FaBox className="w-4 h-4 text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1 text-left">
                            <div className="font-medium text-sm text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500">
                              {product.brand?.name} • {product.price} MAD
                            </div>
                          </div>
                        </button>
                      ))
                    ) : searchQuery.length >= 3 ? (
                      <div className="px-4 py-6 text-center">
                        <div className="text-sm text-gray-500">
                          Aucun produit trouvé
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
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
                            <Image 
                              width={80}
                              height={80} 
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