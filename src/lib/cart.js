// Cart utilities with localStorage
export const cartUtils = {
  // Get cart from localStorage
  getCart: () => {
    if (typeof window === 'undefined') return []
    return JSON.parse(localStorage.getItem('cart') || '[]')
  },

  // Add item to cart with stock validation
  addToCart: async (product, quantity = 1) => {
    try {
      // Validate stock via API
      const stockResponse = await fetch(`/api/public/products/${product.slug}`)
      const stockData = await stockResponse.json()
      
      if (!stockData.success || !stockData.product) {
        throw new Error('Produit non disponible')
      }

      const currentStock = stockData.product.stock?.currentQuantity || 0
      
      if (currentStock < quantity) {
        throw new Error(`Stock insuffisant. Il reste ${currentStock} unité(s)`)
      }

      // Add to localStorage cart
      const cart = cartUtils.getCart()
      const existingItem = cart.find(item => item.id === product._id)

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity
        if (newQuantity > currentStock) {
          throw new Error(`Quantité maximale atteinte. Stock: ${currentStock}`)
        }
        existingItem.quantity = newQuantity
      } else {
        cart.push({
          id: product._id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.mainImage || product.images?.[0],
          quantity: quantity,
          maxStock: currentStock,
          brand: product.brand?.name,
          category: product.category?.name
        })
      }

      localStorage.setItem('cart', JSON.stringify(cart))
      return { success: true, cart }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Update quantity with stock validation
  updateQuantity: async (productId, newQuantity) => {
    try {
      const cart = cartUtils.getCart()
      const item = cart.find(item => item.id === productId)
      
      if (!item) throw new Error('Produit non trouvé dans le panier')

      // Validate stock
      const stockResponse = await fetch(`/api/public/products/${item.slug}`)
      const stockData = await stockResponse.json()
      const currentStock = stockData.product?.stock?.currentQuantity || 0

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

  // Remove item from cart
  removeFromCart: (productId) => {
    const cart = cartUtils.getCart()
    const updatedCart = cart.filter(item => item.id !== productId)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    return updatedCart
  },

  // Clear cart
  clearCart: () => {
    localStorage.setItem('cart', '[]')
    return []
  },

  // Get cart count
  getCartCount: () => {
    const cart = cartUtils.getCart()
    return cart.reduce((total, item) => total + item.quantity, 0)
  },

  // Get cart total
  getCartTotal: () => {
    const cart = cartUtils.getCart()
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }
}