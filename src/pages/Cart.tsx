import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import Toast from '../components/Toast'

const Cart: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCartStore()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const totalAmount = getCartTotal()
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const showNotification = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    setIsUpdating(true)
    try {
      updateQuantity(productId, newQuantity)

      if (newQuantity === 0) {
        showNotification('Item removed from cart')
      } else {
        showNotification('Cart updated')
      }
    } catch (error) {
      showNotification('Failed to update cart')
      console.error('Failed to update cart:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemoveItem = async (productId: string) => {
    setIsUpdating(true)
    try {
      removeFromCart(productId)
      showNotification('Item removed from cart')
    } catch (error) {
      showNotification('Failed to remove item')
      console.error('Failed to remove item:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showNotification('Your cart is empty')
      return
    }

    // In a real implementation, this would call the backend API
    // For now, we'll just show a message
    showNotification('Redirecting to checkout...')
    setTimeout(() => {
      // window.location.href = '/checkout'
      showNotification('Checkout functionality to be implemented')
    }, 1500)
  }

  const gradientStyle = (palette: string[]) => {
    return {
      background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`,
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="section">
          <div className="section-header">
            <h1>Your Bag</h1>
            <p className="section-subtitle">Your cart is currently empty</p>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--card)',
            borderRadius: 'var(--radius)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            margin: '20px 0'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>🛍️</div>
            <h2 style={{ marginBottom: '10px' }}>Your bag is empty</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '30px' }}>
              Add a sachet to start pouring
            </p>
            <Link to="/#store" className="btn primary">
              Start Shopping
            </Link>
          </div>
        </div>

        <Toast show={showToast} message={toastMessage} />
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="section">
        <div className="section-header">
          <h1>Your Bag ({totalItems} {totalItems === 1 ? 'item' : 'items'})</h1>
          <p className="section-subtitle">Review your items before checkout</p>
        </div>

        <div className="cart-layout">
          <div>
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-thumb" style={gradientStyle(item.product.palette)}></div>

                <div className="cart-info">
                  <h3>{item.product.name}</h3>
                  <p className="muted">{item.product.badge}</p>
                  <p className="price">${item.product.price * item.quantity}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
                  <div className="quantity-controls">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={isUpdating || item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={isUpdating}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={isUpdating}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>

            <div style={{ marginBottom: '20px' }}>
              <div className="summary-row">
                <span>Subtotal ({totalItems} items)</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span className="muted">Shipping</span>
                <span className="muted">Calculated at checkout</span>
              </div>

              <div className="summary-row" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="btn primary full"
              onClick={handleCheckout}
              disabled={isUpdating || cartItems.length === 0}
              style={{ marginBottom: '12px' }}
            >
              {isUpdating ? 'Processing...' : 'Checkout'}
            </button>

            <Link to="/#store" className="btn ghost full" style={{ textAlign: 'center' }}>
              Continue Shopping
            </Link>

            <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px' }}>
              <h4 style={{ marginBottom: '8px', fontSize: '14px' }}>Secure Checkout</h4>
              <p className="muted" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                Your payment information is encrypted and secure. We process all payments through Shopify's secure checkout system.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Toast show={showToast} message={toastMessage} />
    </div>
  )
}

export default Cart