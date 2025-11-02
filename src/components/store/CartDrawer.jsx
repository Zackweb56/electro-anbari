// src/components/store/CartDrawer.jsx
'use client'
import Image from 'next/image';
import { useState, useEffect } from 'react'
import { FaTimes, FaShoppingCart, FaPlus, FaMinus, FaTrash, FaSpinner, FaExclamationTriangle, FaCheck, FaTruck } from 'react-icons/fa'
import WhatsAppOrderButton from './WhatsAppOrderButton'
import OrderForm from './OrderForm'

// Cart utilities (same as before)
const cartUtils = {
  getCart: () => {
    if (typeof window === 'undefined') return []
    return JSON.parse(localStorage.getItem('cart') || '[]')
  },

  updateQuantity: async (productId, newQuantity) => {
    try {
      const cart = cartUtils.getCart()
      const item = cart.find(item => item.id === productId)
      
      if (!item) throw new Error('Produit non trouvé dans le panier')

      // Validate stock - FIXED: Use currentQuantity
      const stockResponse = await fetch(`/api/public/products/${item.slug}`)
      const stockData = await stockResponse.json()
      const currentStock = stockData.product?.stock?.currentQuantity || 0 // Changed here

      if (newQuantity > currentStock) {
        throw new Error(`Stock insuffisant. Maximum: ${currentStock}`)
      }

      if (newQuantity < 1) {
        cartUtils.removeFromCart(productId)
        return { success: true, cart: cartUtils.getCart() }
      }

      item.quantity = newQuantity
      item.maxStock = currentStock
      localStorage.setItem('cart', JSON.stringify(cart))
      return { success: true, cart }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },
  
  removeFromCart: (productId) => {
    const cart = cartUtils.getCart()
    const updatedCart = cart.filter(item => item.id !== productId)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    return updatedCart
  },

  clearCart: () => {
    localStorage.setItem('cart', '[]')
    return []
  },

  getCartCount: () => {
    const cart = cartUtils.getCart()
    return cart.reduce((total, item) => total + item.quantity, 0)
  },

  getCartTotal: () => {
    const cart = cartUtils.getCart()
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }
};

export default function CartDrawer({ isOpen, onClose, cartItemsCount }) {
  const [cartItems, setCartItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [updatingItems, setUpdatingItems] = useState({})
  const [stockErrors, setStockErrors] = useState({})
  const [validationComplete, setValidationComplete] = useState(false)
  const [showOrderForm, setShowOrderForm] = useState(false)

  // Load cart items and validate stock
  useEffect(() => {
    if (isOpen) {
      loadCartWithValidation()
    } else {
      // Reset states when drawer closes
      setValidationComplete(false)
      setStockErrors({})
      setShowOrderForm(false)
    }
  }, [isOpen])

  const loadCartWithValidation = async () => {
    setIsLoading(true)
    const cart = cartUtils.getCart()
    setCartItems(cart)
    
    if (cart.length === 0) {
      setIsLoading(false)
      setValidationComplete(true)
      return
    }

    // Validate stock for each item
    const validationResults = await Promise.all(
      cart.map(async (item) => {
        try {
          const response = await fetch(`/api/public/products/${item.slug}`)
          const data = await response.json()
          const currentStock = data.product?.stock?.currentQuantity || 0
          const productExists = data.success && data.product
          
          return {
            itemId: item.id,
            isValid: productExists && item.quantity <= currentStock,
            currentStock,
            productExists,
            product: data.product
          }
        } catch (error) {
          return { 
            itemId: item.id, 
            isValid: false, 
            currentStock: 0, 
            productExists: false 
          }
        }
      })
    )

    const errors = {}
    const updatedCart = [...cart]
    
    validationResults.forEach(result => {
      if (!result.productExists) {
        errors[result.itemId] = 'Produit non disponible'
        // Remove unavailable products
        const index = updatedCart.findIndex(item => item.id === result.itemId)
        if (index > -1) {
          updatedCart.splice(index, 1)
        }
      } else if (!result.isValid) {
        errors[result.itemId] = `Stock insuffisant. Maximum: ${result.currentStock}`
        // Auto-adjust quantity to max available
        const item = updatedCart.find(item => item.id === result.itemId)
        if (item && item.quantity > result.currentStock) {
          item.quantity = result.currentStock
          item.maxStock = result.currentStock
        }
      } else {
        // Update max stock for valid items
        const item = updatedCart.find(item => item.id === result.itemId)
        if (item) {
          item.maxStock = result.currentStock
        }
      }
    })

    // Update cart with adjusted quantities
    if (updatedCart.length !== cart.length) {
      localStorage.setItem('cart', JSON.stringify(updatedCart))
      window.dispatchEvent(new Event('cartUpdated'))
    }

    setCartItems(updatedCart)
    setStockErrors(errors)
    setValidationComplete(true)
    setIsLoading(false)
  }

  // Update quantity with validation
  const updateQuantity = async (productId, newQuantity) => {
    setUpdatingItems(prev => ({ ...prev, [productId]: true }))
    
    const result = await cartUtils.updateQuantity(productId, newQuantity)
    
    if (result.success) {
      setCartItems(result.cart)
      // Remove error if fixed
      if (stockErrors[productId]) {
        setStockErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[productId]
          return newErrors
        })
      }
      window.dispatchEvent(new Event('cartUpdated'))
    } else {
      setStockErrors(prev => ({ ...prev, [productId]: result.error }))
    }
    
    setUpdatingItems(prev => ({ ...prev, [productId]: false }))
  }

  const removeItem = (productId) => {
    const updatedCart = cartUtils.removeFromCart(productId)
    setCartItems(updatedCart)
    setStockErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[productId]
      return newErrors
    })
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const clearCart = () => {
    cartUtils.clearCart()
    setCartItems([])
    setStockErrors({})
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const handleOrderSuccess = () => {
    // Clear cart after successful order
    cartUtils.clearCart()
    setCartItems([])
    setStockErrors({})
    window.dispatchEvent(new Event('cartUpdated'))
    onClose()
  }

  // Calculate totals
  const subtotal = cartUtils.getCartTotal()
  const totalItems = cartUtils.getCartCount()

  // Generate WhatsApp message with enhanced product details (raw string)
  const generateWhatsAppMessage = () => {
    const itemsText = cartItems.map(item =>
      `• ${item.name} x${item.quantity} = ${item.price * item.quantity} MAD`
    ).join('\n')

    return (
      `Bonjour! Je souhaite commander les produits suivants:\n\n${itemsText}\n\n` +
      `Sous-total: ${subtotal} MAD\n` +
      `Total: ${subtotal} MAD\n\n` +
      `Merci de me confirmer la disponibilité et les délais de livraison!`
    )
  }

  // Check if cart has errors
  const hasErrors = Object.keys(stockErrors).length > 0

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex z-50">
        <div className="relative w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                {showOrderForm ? (
                  <FaTruck className="w-6 h-6 text-blue-600" />
                ) : (
                  <FaShoppingCart className="w-6 h-6 text-blue-600" />
                )}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {showOrderForm ? 'Finaliser la Commande' : 'Mon Panier'}
                  </h2>
                  {validationComplete && totalItems > 0 && !showOrderForm && (
                    <p className="text-sm text-gray-500">
                      {totalItems} article{totalItems > 1 ? 's' : ''} • {subtotal} MAD
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-500 transition-colors rounded-lg hover:bg-gray-100"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Back button for order form */}
            {showOrderForm && (
              <div className="border-b border-gray-200 px-6 py-3 bg-gray-50">
                <button
                  onClick={() => setShowOrderForm(false)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <FaTimes className="w-4 h-4" />
                  <span>Retour au panier</span>
                </button>
              </div>
            )}

            {/* Validation Status */}
            {!showOrderForm && isLoading && (
              <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
                <div className="flex items-center space-x-2 text-blue-700 text-sm">
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  <span>Vérification du stock en cours...</span>
                </div>
              </div>
            )}

            {!showOrderForm && validationComplete && hasErrors && (
              <div className="px-6 py-3 bg-orange-50 border-b border-orange-200">
                <div className="flex items-center space-x-2 text-orange-700 text-sm">
                  <FaExclamationTriangle className="w-4 h-4" />
                  <span>Certains produits ont été ajustés</span>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {showOrderForm ? (
                // Order Form
                <div className="p-4">
                  <OrderForm 
                    cartItems={cartItems}
                    onOrderSuccess={handleOrderSuccess}
                  />
                </div>
              ) : (
                // Cart Items
                <>
                  {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <FaShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Votre panier est vide
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Ajoutez des produits pour commencer vos achats
                      </p>
                      <button
                        onClick={onClose}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Continuer mes achats
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 space-y-4">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center space-x-4 p-4 rounded-lg border transition-all duration-200 ${
                            stockErrors[item.id] 
                              ? 'bg-orange-50 border-orange-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <Image 
                            width={64}
                            height={64}
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                            onError={(e) => {
                              e.target.src = '/api/placeholder/64/64'
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {item.price} MAD
                            </p>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2 mt-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={updatingItems[item.id] || item.quantity <= 1}
                                className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                              >
                                <FaMinus className="w-3 h-3" />
                              </button>
                              
                              <div className="flex items-center space-x-1">
                                {updatingItems[item.id] ? (
                                  <FaSpinner className="w-3 h-3 animate-spin text-blue-600" />
                                ) : (
                                  <span className="text-sm font-medium w-8 text-center">
                                    {item.quantity}
                                  </span>
                                )}
                              </div>
                              
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={updatingItems[item.id] || item.quantity >= item.maxStock}
                                className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                              >
                                <FaPlus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Stock Error */}
                            {stockErrors[item.id] && (
                              <div className="flex items-center space-x-1 mt-2 text-red-600 text-xs">
                                <FaExclamationTriangle className="w-3 h-3 flex-shrink-0" />
                                <span>{stockErrors[item.id]}</span>
                              </div>
                            )}

                            {/* Stock Info */}
                            {!stockErrors[item.id] && item.maxStock && (
                              <div className="text-xs text-gray-500 mt-1">
                                Stock: {item.maxStock} disponible{item.maxStock > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <p className="text-sm font-semibold text-gray-900">
                              {item.price * item.quantity} MAD
                            </p>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-50 rounded"
                              title="Supprimer du panier"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer - Only show for cart view, not order form */}
            {!showOrderForm && cartItems.length > 0 && validationComplete && (
              <div className="border-t border-gray-200 p-6 space-y-4 bg-white">
                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Sous-total:</span>
                    <span className="font-medium">{subtotal} MAD</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Livraison:</span>
                    <span className="text-green-600 font-medium">À calculer</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center text-lg font-semibold">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-blue-600">{subtotal} MAD</span>
                  </div>
                </div>

                {/* Validation Status */}
                {hasErrors ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-orange-700 text-sm">
                      <FaExclamationTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>Ajustez les quantités avant de commander</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-green-700 text-sm">
                      <FaCheck className="w-4 h-4 flex-shrink-0" />
                      <span>Tous les produits sont disponibles</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  {/* WhatsApp Order Button */}
                  <WhatsAppOrderButton
                    label={hasErrors ? 'Ajustez le panier' : 'Commander via WhatsApp'}
                    message={generateWhatsAppMessage()}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${hasErrors ? 'bg-gray-400 text-gray-200' : ''}`}
                    disabled={hasErrors}
                    size="md"
                  />

                  {/* Website Order Form Button */}
                  <button
                    onClick={() => setShowOrderForm(true)}
                    disabled={hasErrors}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                      hasErrors
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <FaTruck className="w-5 h-5" />
                    <span>
                      {hasErrors ? 'Ajustez le panier' : 'Finaliser la Commande'}
                    </span>
                  </button>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={clearCart}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Vider le panier
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 border border-blue-600 text-blue-600 py-3 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                    >
                      Continuer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}