import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    badge: string
    palette: string[]
  }
}

interface CartStore {
  cartItems: CartItem[]
  addToCart: (product: CartItem['product']) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],

      addToCart: (product) => {
        set((state) => {
          const existingItem = state.cartItems.find((item) => item.id === product.id)
          if (existingItem) {
            return {
              cartItems: state.cartItems.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            }
          } else {
            return {
              cartItems: [...state.cartItems, { id: product.id, quantity: 1, product }],
            }
          }
        })
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        }))
      },

      removeFromCart: (productId) => {
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== productId),
        }))
      },

      clearCart: () => {
        set({ cartItems: [] })
      },

      getCartTotal: () => {
        return get().cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0)
      },

      getCartItemCount: () => {
        return get().cartItems.reduce((total, item) => total + item.quantity, 0)
      },
    }),
    {
      name: 'procktails-cart',
    }
  )
)