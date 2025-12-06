import React from 'react'
import { Product } from '../types'
import { useCartStore } from '../store/cartStore'

interface ProductCardProps {
  product: Product
  onOpenModal: (product: Product) => void
  onAddToCart: () => void
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenModal, onAddToCart }) => {
  const { addToCart } = useCartStore()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart(product)
    onAddToCart()
  }

  const handleCardClick = () => {
    onOpenModal(product)
  }

  const gradientStyle = (palette: string[]) => {
    return {
      background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`,
    }
  }

  return (
    <article className="product-card" onClick={handleCardClick}>
      <div className="card-media">
        <div className="layer primary" style={gradientStyle(product.palette)}></div>
        <div
          className="layer secondary"
          style={gradientStyle(product.palette.slice().reverse())}
        ></div>
      </div>
      <div className="card-content">
        <h3>{product.name}</h3>
        <p className="card-price">${product.price}</p>
        <p className="muted">{product.badge}</p>
      </div>
      <div className="card-actions">
        <button
          className="btn primary"
          onClick={handleAddToCart}
        >
          Add to Bag
        </button>
        <a href="#" onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleCardClick()
        }}>
          Details
        </a>
      </div>
    </article>
  )
}

export default ProductCard