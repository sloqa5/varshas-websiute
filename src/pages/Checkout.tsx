import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuth } from '../hooks/useAuth'
import Toast from '../components/Toast'

const Checkout: React.FC = () => {
  const { cartItems, getCartTotal } = useCartStore()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [shippingInfo, setShippingInfo] = useState({
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US'
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const totalAmount = getCartTotal()
  const shippingCost = totalAmount > 0 ? 9.99 : 0
  const finalTotal = totalAmount + shippingCost

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart')
    }
  }, [cartItems, navigate])

  const showNotification = (message: string, isError: boolean = false) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!shippingInfo.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      showNotification('Please enter a valid email address', true)
      return false
    }

    if (!shippingInfo.firstName || !shippingInfo.lastName) {
      showNotification('Please enter your full name', true)
      return false
    }

    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.postalCode) {
      showNotification('Please complete your shipping address', true)
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsProcessing(true)

    try {
      // Mock checkout process - in production this would call the backend API
      const checkoutItems = cartItems.map(item => ({
        variantId: item.product.id,
        quantity: item.quantity
      }))

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock redirect to Shopify
      showNotification('Redirecting to Shopify secure checkout...')

      setTimeout(() => {
        // In production, this would be the actual Shopify checkout URL
        showNotification('Shopify checkout integration to be implemented', true)
        // window.location.href = checkoutUrl
      }, 1500)

    } catch (error) {
      console.error('Checkout error:', error)
      showNotification('Failed to create checkout. Please try again.', true)
    } finally {
      setIsProcessing(false)
    }
  }

  if (cartItems.length === 0) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="section" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1>Checkout</h1>
          <p className="muted">Complete your order to start pouring</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '40px',
          alignItems: 'start'
        }}>
          {/* Checkout Form */}
          <div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {/* Contact Information */}
              <div style={{
                background: 'var(--card)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 'var(--radius)',
                padding: '24px'
              }}>
                <h3 style={{ marginBottom: '20px' }}>Contact Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--muted)' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={shippingInfo.email}
                      onChange={handleInputChange}
                      required
                      disabled={isAuthenticated}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: isAuthenticated ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text)',
                        fontSize: '14px',
                        opacity: isAuthenticated ? 0.7 : 1
                      }}
                    />
                    {isAuthenticated && (
                      <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                        Email from your account
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div style={{
                background: 'var(--card)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 'var(--radius)',
                padding: '24px'
              }}>
                <h3 style={{ marginBottom: '20px' }}>Shipping Address</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--muted)' }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={shippingInfo.firstName}
                      onChange={handleInputChange}
                      required
                      disabled={isAuthenticated && !!user?.firstName}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: (isAuthenticated && !!user?.firstName) ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--muted)' }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={shippingInfo.lastName}
                      onChange={handleInputChange}
                      required
                      disabled={isAuthenticated && !!user?.lastName}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: (isAuthenticated && !!user?.lastName) ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--muted)' }}>
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text)',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginTop: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--muted)' }}>
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--muted)' }}>
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={shippingInfo.state}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--muted)' }}>
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={shippingInfo.postalCode}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--muted)' }}>
                    Country
                  </label>
                  <select
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text)',
                      fontSize: '14px'
                    }}
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="btn primary"
                style={{
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                {isProcessing ? 'Processing...' : 'Complete Purchase'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link
                to="/cart"
                style={{
                  color: 'var(--muted)',
                  fontSize: '14px',
                  textDecoration: 'none'
                }}
              >
                ← Back to cart
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div style={{ position: 'sticky', top: '20px' }}>
            <div style={{
              background: 'var(--card-strong)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius)',
              padding: '24px'
            }}>
              <h3 style={{ marginBottom: '20px' }}>Order Summary</h3>

              <div style={{ marginBottom: '20px' }}>
                {cartItems.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.product.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Subtotal</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Shipping</span>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '18px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '8px',
                fontSize: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ marginRight: '8px' }}>🔒</span>
                  <strong>Secure Checkout</strong>
                </div>
                <p style={{ margin: 0, lineHeight: '1.4', color: 'var(--muted)' }}>
                  Your payment information is encrypted and secure. We process all payments through Shopify's PCI-compliant checkout system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toast show={showToast} message={toastMessage} />
    </div>
  )
}

export default Checkout