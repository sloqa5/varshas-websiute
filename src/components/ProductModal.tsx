import React, { useState, useEffect } from 'react'
import { Product } from '../types'
import { useCartStore } from '../store/cartStore'

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: () => void
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, onAddToCart }) => {
  const [activeTab, setActiveTab] = useState<string>('description')
  const { addToCart } = useCartStore()

  useEffect(() => {
    if (isOpen && product) {
      setActiveTab('description')
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, product])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!product || !isOpen) return null

  const handleAddToCart = () => {
    addToCart(product)
    onAddToCart()
    onClose()
  }

  const gradientStyle = (palette: string[]) => {
    return {
      background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`,
    }
  }

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'ingredients', label: 'Ingredients' },
    { id: 'benefits', label: 'Benefits' },
    { id: 'how', label: 'How to make' },
    { id: 'nutrition', label: 'Nutrition' },
  ]

  const renderTabContent = (tabId: string) => {
    switch (tabId) {
      case 'description':
        return <p>{product.description}</p>
      case 'ingredients':
        return (
          <ul>
            {product.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        )
      case 'benefits':
        return (
          <ul>
            {product.benefits.map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
        )
      case 'how':
        return (
          <ol>
            {product.how.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        )
      case 'nutrition':
        return <p>{product.nutrition}</p>
      default:
        return null
    }
  }

  return (
    <div className={`product-modal ${isOpen ? 'active' : ''}`} role="dialog" aria-modal="true" aria-hidden={!isOpen}>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-media" style={gradientStyle(product.palette)}></div>
        <div className="modal-body">
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
          <p className="eyebrow">{product.badge}</p>
          <h3>{product.name}</h3>
          <div className="modal-price-row">
            <span className="modal-price">${product.price}</span>
            <button className="btn primary" onClick={handleAddToCart}>
              Add to Bag
            </button>
          </div>
          <div className="modal-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className={`tab-panel ${activeTab === 'description' ? 'active' : ''}`} id="tab-description">
            {renderTabContent('description')}
          </div>
          <div className={`tab-panel ${activeTab === 'ingredients' ? 'active' : ''}`} id="tab-ingredients">
            {renderTabContent('ingredients')}
          </div>
          <div className={`tab-panel ${activeTab === 'benefits' ? 'active' : ''}`} id="tab-benefits">
            {renderTabContent('benefits')}
          </div>
          <div className={`tab-panel ${activeTab === 'how' ? 'active' : ''}`} id="tab-how">
            {renderTabContent('how')}
          </div>
          <div className={`tab-panel ${activeTab === 'nutrition' ? 'active' : ''}`} id="tab-nutrition">
            {renderTabContent('nutrition')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductModal