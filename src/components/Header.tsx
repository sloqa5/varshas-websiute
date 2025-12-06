import React from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'

const Header: React.FC = () => {
  const { cartItems } = useCartStore()
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="site-header">
      <div className="logo">Procktails</div>
      <nav className="main-nav">
        <a href="#store" onClick={(e) => handleNavClick(e, 'store')}>Store</a>
        <a href="#recipes" onClick={(e) => handleNavClick(e, 'recipes')}>Recipes</a>
        <a href="#videos" onClick={(e) => handleNavClick(e, 'videos')}>Tutorials</a>
        <a href="#about" onClick={(e) => handleNavClick(e, 'about')}>About</a>
      </nav>
      <Link className="cart-badge" to="/cart">
        <span className="cart-icon" aria-hidden="true">🛍</span>
        <span className="cart-count" aria-live="polite">{totalItems}</span>
      </Link>
    </header>
  )
}

export default Header