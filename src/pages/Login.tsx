import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Toast from '../components/Toast'

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  const { login, register } = useAuth()
  const navigate = useNavigate()

  const showNotification = (message: string, isError: boolean = false) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear errors when user types
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const validateForm = () => {
    const newErrors: string[] = []

    if (!formData.email) {
      newErrors.push('Email is required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push('Please enter a valid email address')
    }

    if (!formData.password) {
      newErrors.push('Password is required')
    } else if (formData.password.length < 8) {
      newErrors.push('Password must be at least 8 characters long')
    }

    if (!isLogin) {
      if (!formData.firstName) {
        newErrors.push('First name is required')
      }
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      let success = false

      if (isLogin) {
        success = await login(formData.email, formData.password)
        if (success) {
          showNotification('Login successful!')
          navigate('/')
        } else {
          showNotification('Invalid email or password', true)
        }
      } else {
        success = await register(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName
        )
        if (success) {
          showNotification('Account created successfully!')
          navigate('/')
        } else {
          showNotification('An account with this email already exists', true)
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      showNotification('Something went wrong. Please try again.', true)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setErrors([])
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: ''
    })
  }

  return (
    <div className="section" style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center' }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        margin: '0 auto',
        padding: '20px'
      }}>
        <div style={{
          background: 'var(--card)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius)',
          padding: '40px',
          boxShadow: 'var(--shadow)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ marginBottom: '8px' }}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="muted" style={{ margin: 0 }}>
              {isLogin
                ? 'Sign in to access your account and saved cart'
                : 'Join Procktails to save your favorites and track orders'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {!isLogin && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--muted)' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required={!isLogin}
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
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
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
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--muted)' }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="email"
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
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
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

            {errors.length > 0 && (
              <div style={{
                background: 'rgba(255, 124, 200, 0.1)',
                border: '1px solid rgba(255, 124, 200, 0.3)',
                borderRadius: '8px',
                padding: '12px'
              }}>
                {errors.map((error, index) => (
                  <p key={index} style={{ margin: '4px 0', fontSize: '13px', color: 'var(--accent-pink)' }}>
                    • {error}
                  </p>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn primary"
              style={{
                padding: '14px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '14px' }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={toggleMode}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--gold)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  textDecoration: 'underline'
                }}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          <div style={{
            textAlign: 'center',
            marginTop: '16px'
          }}>
            <Link
              to="/#store"
              style={{
                color: 'var(--muted)',
                fontSize: '13px',
                textDecoration: 'none'
              }}
            >
              ← Continue shopping
            </Link>
          </div>
        </div>
      </div>

      <Toast show={showToast} message={toastMessage} />
    </div>
  )
}

export default Login