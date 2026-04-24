// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================
// AUTH HELPERS
// ============================================

export const signUp = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  })
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

// ============================================
// PRODUCTS HELPERS
// ============================================

export const getProducts = async ({ featured, categories = [], search, limit = 20, page = 0 } = {}) => {
  let query = supabase
    .from('products')
    .select('*, product_categories(categories(name, slug))')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1)

  if (featured) query = query.eq('is_featured', true)
  if (search) query = query.ilike('name', `%${search}%`)

  if (categories.length > 0) {
    // For each category slug, get the set of product IDs → then intersect (AND logic)
    const idSets = await Promise.all(
      categories.map(async (slug) => {
        const { data: catRow } = await supabase
          .from('categories').select('id').eq('slug', slug).single()
        if (!catRow) return null
        const { data: pcRows } = await supabase
          .from('product_categories').select('product_id').eq('category_id', catRow.id)
        return new Set((pcRows || []).map(r => r.product_id))
      })
    )
    const validSets = idSets.filter(s => s !== null)
    if (validSets.length === 0) return { data: [], error: null }
    const intersection = [...validSets[0]].filter(id => validSets.every(s => s.has(id)))
    if (intersection.length === 0) return { data: [], error: null }
    query = query.in('id', intersection)
  }

  const { data, error } = await query
  return { data, error }
}

export const getProductBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_categories(categories(name, slug))')
    .eq('slug', slug)
    .single()
  return { data, error }
}

export const getAllProductsAdmin = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_categories(categories(id, name, slug))')
    .order('created_at', { ascending: false })
  return { data, error }
}

export const setProductCategories = async (productId, categoryIds) => {
  await supabase.from('product_categories').delete().eq('product_id', productId)
  if (!categoryIds.length) return { error: null }
  const { error } = await supabase.from('product_categories').insert(
    categoryIds.map(categoryId => ({ product_id: productId, category_id: categoryId }))
  )
  return { error }
}

export const createProduct = async (product) => {
  const { data, error } = await supabase.from('products').insert([product]).select().single()
  return { data, error }
}

export const updateProduct = async (id, updates) => {
  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export const deleteProduct = async (id) => {
  const { error } = await supabase.from('products').delete().eq('id', id)
  return { error }
}

// ============================================
// CATEGORIES HELPERS
// ============================================

export const getCategories = async () => {
  const { data, error } = await supabase.from('categories').select('*').order('name')
  return { data, error }
}

export const createCategory = async (category) => {
  const { data, error } = await supabase.from('categories').insert([category]).select().single()
  return { data, error }
}

// ============================================
// CART HELPERS
// ============================================

export const getCart = async (userId) => {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, products(id, name, price, images, stock)')
    .eq('user_id', userId)
  return { data, error }
}

export const addToCart = async (userId, productId, quantity = 1, size = null, color = null) => {
  const { data, error } = await supabase
    .from('cart_items')
    .upsert([{ user_id: userId, product_id: productId, quantity, size, color }], {
      onConflict: 'user_id,product_id,size,color',
      ignoreDuplicates: false
    })
    .select()
  return { data, error }
}

export const removeFromCart = async (itemId) => {
  const { error } = await supabase.from('cart_items').delete().eq('id', itemId)
  return { error }
}

export const clearCart = async (userId) => {
  const { error } = await supabase.from('cart_items').delete().eq('user_id', userId)
  return { error }
}

// ============================================
// ORDERS HELPERS
// ============================================

export const createOrder = async (userId, cartItems, shippingAddress, totalAmount, paymentMethod = 'stripe') => {
  const paymentStatus = paymentMethod === 'stripe' ? 'pending_payment' : 'unpaid'
  // 1. Créer la commande
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      user_id: userId,
      total_amount: totalAmount,
      shipping_address: shippingAddress,
      status: 'pending',
      payment_status: paymentStatus,
      payment_method: paymentMethod,
    }])
    .select()
    .single()

  if (orderError) return { error: orderError }

  // 2. Créer les lignes de commande
  const orderItems = cartItems.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.products.price,
    size: item.size,
    color: item.color
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) return { error: itemsError }

  // 3. Vider le panier
  await clearCart(userId)

  return { data: order, error: null }
}

export const getUserOrders = async (userId) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, images))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const getAllOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, profiles(full_name, email), order_items(*, products(name, slug, images))')
    .order('created_at', { ascending: false })
  return { data, error }
}

// ============================================
// REVIEWS HELPERS
// ============================================

export const getProductReviews = async (productId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(full_name)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const getUserReview = async (productId, userId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('user_id', userId)
    .maybeSingle()
  return { data, error }
}

export const hasUserPurchasedProduct = async (userId, productId) => {
  const { data } = await supabase
    .from('orders')
    .select('id, order_items!inner(product_id)')
    .eq('user_id', userId)
    .eq('order_items.product_id', productId)
    .limit(1)
  return (data || []).length > 0
}

export const upsertReview = async (productId, userId, rating, comment) => {
  const { data, error } = await supabase
    .from('reviews')
    .upsert([{ product_id: productId, user_id: userId, rating, comment }], {
      onConflict: 'product_id,user_id'
    })
    .select()
    .single()
  return { data, error }
}

export const updateOrderPayment = async (orderId, paymentStatus) => {
  const { error } = await supabase
    .from('orders')
    .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId)
  return { error }
}

export const updateOrderStatus = async (orderId, status) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single()
  return { data, error }
}

// ============================================
// WISHLIST HELPERS
// ============================================

export const getWishlist = async (userId) => {
  const { data, error } = await supabase
    .from('wishlist')
    .select('*, products(id, name, price, images, slug)')
    .eq('user_id', userId)
  return { data, error }
}

export const toggleWishlist = async (userId, productId) => {
  const { data: existing } = await supabase
    .from('wishlist')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single()

  if (existing) {
    await supabase.from('wishlist').delete().eq('id', existing.id)
    return { added: false }
  } else {
    await supabase.from('wishlist').insert([{ user_id: userId, product_id: productId }])
    return { added: true }
  }
}

// ============================================
// DASHBOARD STATS (Admin)
// ============================================

export const getDashboardStats = async () => {
  const [ordersRes, productsRes, usersRes, revenueRes] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact' }),
    supabase.from('products').select('id', { count: 'exact' }),
    supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'user'),
    supabase.from('orders').select('total_amount').eq('payment_status', 'paid')
  ])

  const revenue = revenueRes.data?.reduce((sum, o) => sum + parseFloat(o.total_amount), 0) || 0

  return {
    totalOrders: ordersRes.count || 0,
    totalProducts: productsRes.count || 0,
    totalUsers: usersRes.count || 0,
    totalRevenue: revenue
  }
}

// ============================================
// DISCOUNT CODES (birthday coupons)
// ============================================

export const validateDiscountCode = async (code, userId) => {
  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('user_id', userId)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()
  return { data, error }
}

export const markDiscountCodeUsed = async (code) => {
  const { error } = await supabase
    .from('discount_codes')
    .update({ used_at: new Date().toISOString() })
    .eq('code', code.toUpperCase())
  return { error }
}
