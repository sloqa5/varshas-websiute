export interface Product {
  id: string
  name: string
  price: number
  accent: string
  badge: string
  description: string
  ingredients: string[]
  benefits: string[]
  how: string[]
  nutrition: string
  palette: string[]
}

export interface Recipe {
  icon: string
  title: string
  copy: string
}

export interface Tutorial {
  id: string
  title: string
  detail: string
}

export interface CartItem {
  id: string
  quantity: number
  product: Product
}

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface CheckoutRequest {
  items: {
    variantId: string
    quantity: number
  }[]
  userEmail?: string
}

export interface CheckoutResponse {
  checkoutUrl: string
  checkoutId: string
}