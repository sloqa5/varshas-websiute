import React from 'react'
import { Link } from 'react-router-dom'

const Footer: React.FC = () => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="logo">Procktails</div>
        <nav className="footer-nav">
          <a href="#hero" onClick={(e) => handleNavClick(e, 'hero')}>Home</a>
          <a href="#store" onClick={(e) => handleNavClick(e, 'store')}>Store</a>
          <a href="#recipes" onClick={(e) => handleNavClick(e, 'recipes')}>Recipes</a>
          <a href="#videos" onClick={(e) => handleNavClick(e, 'videos')}>Tutorials</a>
          <a href="#about" onClick={(e) => handleNavClick(e, 'about')}>About</a>
        </nav>
        <div className="footer-social">
          <a href="#" aria-label="Instagram">IG</a>
          <a href="#" aria-label="TikTok">TT</a>
          <a href="#" aria-label="YouTube">YT</a>
        </div>
      </div>
      <div className="footer-bottom">© 2024 Procktails. Crafted for modern hosts.</div>
    </footer>
  )
}

export default Footer