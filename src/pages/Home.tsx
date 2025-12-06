import React, { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard'
import ProductModal from '../components/ProductModal'
import VideoLightbox from '../components/VideoLightbox'
import Toast from '../components/Toast'
import { Product, Recipe, Tutorial } from '../types'

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<Tutorial | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Static data matching the original script.js
  const staticProducts: Product[] = [
    {
      id: 'sunset-saffron',
      name: 'Sunset Saffron Spritz',
      price: 18,
      accent: 'var(--accent-pink)',
      badge: 'Citrus · Glow',
      description:
        'A bright citrus base with saffron warmth and a prismatic shimmer that turns any fizz into a rooftop-ready serve.',
      ingredients: ['Blood orange', 'Saffron extract', 'Sparkle tonic', 'Cane sugar'],
      benefits: ['Low prep ritual', 'Vegan shimmer', 'No artificial syrups'],
      how: ['Pour sachet into a chilled glass', 'Add sparkling water or bubbles', 'Garnish with a twist and watch the glow'],
      nutrition: 'Per sachet: 40 calories · 0g fat · 9g carbs · 0g protein',
      palette: ['#ff9ec9', '#f6d68c'],
    },
    {
      id: 'cocoa-smoke',
      name: 'Cocoa Smoke Old Fashioned',
      price: 20,
      accent: 'var(--gold)',
      badge: 'Rich · Slow Sipper',
      description:
        'Bittersweet cacao, smoked vanilla, and a silky amber pour that drapes over a slow-melt cube.',
      ingredients: ['Cocoa nib', 'Smoked vanilla', 'Orange oil', 'Bitters concentrate'],
      benefits: ['Designed for slow sipping', 'Pairs with or without spirits', 'Bar cart depth without the prep'],
      how: ['Stir sachet with 2oz spirit or water', 'Add clear ice cube', 'Express orange peel'],
      nutrition: 'Per sachet: 60 calories · 1g fat · 11g carbs · 1g protein',
      palette: ['#7b4a2f', '#d6a354'],
    },
    {
      id: 'mint-zen',
      name: 'Mint Zen Highball',
      price: 17,
      accent: 'var(--accent-cyan)',
      badge: 'Fresh · Crisp',
      description:
        'Glacier mint meets cucumber calm with a high-clarity sheen that keeps the highball refreshing and camera-ready.',
      ingredients: ['Garden mint', 'Cucumber water', 'Citrus mist', 'Micro-shimmer'],
      benefits: ['Cooling aromatics', 'Zero artificial colors', 'Pairs with sparkling water'],
      how: ['Pour sachet into tall glass', 'Add crushed ice + soda', 'Top with mint plume'],
      nutrition: 'Per sachet: 30 calories · 0g fat · 7g carbs · 0g protein',
      palette: ['#7ee0ff', '#c8ff67'],
    },
    {
      id: 'ruby-ginger',
      name: 'Ruby Ginger Mule',
      price: 19,
      accent: 'var(--accent-pink)',
      badge: 'Spiced · Effervescent',
      description:
        'Ruby ginger heat layered with hibiscus brightness and a metallic glint that lights up any copper mug.',
      ingredients: ['Young ginger', 'Hibiscus', 'Lime peel', 'Spark shimmer'],
      benefits: ['Fiery but balanced', 'Real botanicals', 'Quick pour mule ritual'],
      how: ['Pour over ice', 'Add soda or ginger beer', 'Lime wheel to finish'],
      nutrition: 'Per sachet: 45 calories · 0g fat · 10g carbs · 0g protein',
      palette: ['#ff7cc8', '#ffb899'],
    },
  ]

  const recipes: Recipe[] = [
    {
      icon: '🍊',
      title: 'Citrus loft spritz',
      copy: 'Sunset Saffron + bubbles + orange twist for a rooftop-ready glow.',
    },
    {
      icon: '🥥',
      title: 'Coconut slow roll',
      copy: 'Cocoa Smoke over coconut water for a decadent, zero-proof sipper.',
    },
    {
      icon: '🍃',
      title: 'Spa highball',
      copy: 'Mint Zen over crushed ice, topped with soda and cucumber ribbon.',
    },
    {
      icon: '🌶️',
      title: 'Heat wave mule',
      copy: 'Ruby Ginger with ginger beer and lime, served in copper for instant drama.',
    },
  ]

  const benefits = [
    'Micro-shimmer built for socials',
    'Alt-text ready imagery on every card',
    'Keyboard-friendly modals and controls',
    'Mobile-first layouts that stay premium',
  ]

  const tutorials: Tutorial[] = [
    {
      id: 'hero-pour',
      title: 'Pour & shimmer walkthrough',
      detail: 'See how the sachet blooms, with timing tips for the perfect swirl.',
    },
    {
      id: 'serve-bar',
      title: 'Host like a pro',
      detail: 'Set the stage with glassware, light, and garnish that photographs well.',
    },
    {
      id: 'zero-proof',
      title: 'Zero-proof pairings',
      detail: 'Build layered, non-alcoholic serves without sacrificing depth.',
    },
  ]

  useEffect(() => {
    // Load products from API or use static data
    setProducts(staticProducts)
  }, [])

  useEffect(() => {
    // Initialize hero scroll effect
    const handleScroll = () => {
      const hero = document.querySelector('.hero')
      const media = document.querySelector('.hero-video-fallback')
      if (!hero || !media) return

      const rect = hero.getBoundingClientRect()
      const progress = Math.min(
        Math.max((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0),
        1
      )
      const mediaEl = media as HTMLElement
      mediaEl.style.transform = `scale(${1 + progress * 0.04}) translateY(${progress * -12}px)`
      mediaEl.style.opacity = `${0.7 + progress * 0.2}`
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const openProductModal = (product: Product) => {
    setSelectedProduct(product)
  }

  const openVideo = (tutorial: Tutorial) => {
    setSelectedVideo(tutorial)
  }

  const closeProductModal = () => {
    setSelectedProduct(null)
  }

  const closeVideo = () => {
    setSelectedVideo(null)
  }

  const showAddToCartToast = () => {
    setToastMessage('Added to bag')
    setShowToast(true)
    setTimeout(() => setShowToast(false), 1600)
  }

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const gradientStyle = (palette: string[]) => {
    return `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`
  }

  return (
    <>
      <section className="hero" id="hero">
        <div className="hero-media" aria-hidden="true">
          <div className="hero-video-fallback"></div>
        </div>
        <div className="hero-content">
          <p className="eyebrow">Premium sachet cocktails</p>
          <h1>Watch the sachet transform any glass into a bar-worthy sip.</h1>
          <p className="subhead">Stir, shimmer, and serve. Procktails turns moments into signature pours in seconds.</p>
          <div className="hero-actions">
            <a className="btn primary" href="#store" onClick={(e) => handleNavClick(e, 'store')}>
              Shop flavours
            </a>
            <a className="btn ghost" href="#videos" onClick={(e) => handleNavClick(e, 'videos')}>
              See how it mixes
            </a>
          </div>
          <div className="scroll-indicator">Scroll to explore</div>
        </div>
      </section>

      <section className="section store" id="store">
        <div className="section-header">
          <p className="eyebrow">The Store</p>
          <div className="section-title-row">
            <h2>Bold flavours. Seamless prep.</h2>
            <p className="section-subtitle">Hover to see the pour, tap to open details, and add to your bag in one move.</p>
          </div>
        </div>
        <div className="product-grid" id="productGrid" aria-live="polite">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenModal={openProductModal}
              onAddToCart={showAddToCartToast}
            />
          ))}
        </div>
      </section>

      <section className="section recipes" id="recipes">
        <div className="section-header">
          <p className="eyebrow">Ideas & Benefits</p>
          <div className="section-title-row">
            <h2>Recipe sparks and sachet perks</h2>
            <p className="section-subtitle">Swipe through quick serves and see what each sachet brings to the glass.</p>
          </div>
        </div>
        <div className="recipes-grid" id="recipeGrid">
          {recipes.map((recipe, index) => (
            <article key={index} className="recipe-card">
              <div className="icon">{recipe.icon}</div>
              <div>
                <h3>{recipe.title}</h3>
                <p className="section-subtitle">{recipe.copy}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="benefits-strip" id="benefitsStrip">
          {benefits.map((benefit, index) => (
            <div key={index} className="benefit-pill">
              {benefit}
            </div>
          ))}
        </div>
      </section>

      <section className="section videos" id="videos">
        <div className="section-header">
          <p className="eyebrow">Video Tutorials</p>
          <div className="section-title-row">
            <h2>See the shimmer in motion</h2>
            <p className="section-subtitle">Tap a tutorial to pop it open and follow along.</p>
          </div>
        </div>
        <div className="video-grid" id="videoGrid">
          {tutorials.map((tutorial) => (
            <article key={tutorial.id} className="video-card">
              <button onClick={() => openVideo(tutorial)}>▶ {tutorial.title}</button>
              <p className="section-subtitle">{tutorial.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section about" id="about">
        <div className="about-media" aria-hidden="true"></div>
        <div className="about-copy">
          <p className="eyebrow">About Procktails</p>
          <h2>Sachet-first cocktails for the design-led host.</h2>
          <p className="section-subtitle">We pair mixology-grade ingredients with cinematic visuals so every pour feels curated. No bar cart? No problem. Each sachet carries flavour, shimmer, and a modern ritual that matches your taste.</p>
          <div className="about-points">
            <div>
              <h3>Premium & mindful</h3>
              <p>Low prep, no artificial heaviness, and balanced profiles you can sip straight or riff on.</p>
            </div>
            <div>
              <h3>Built for socials</h3>
              <p>Signature colour shifts, glow edges, and aroma-first mixers designed to be camera-ready.</p>
            </div>
          </div>
          <a className="btn primary" href="#store" onClick={(e) => handleNavClick(e, 'store')}>
            Shop the collection
          </a>
        </div>
      </section>

      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={closeProductModal}
        onAddToCart={showAddToCartToast}
      />

      <VideoLightbox
        video={selectedVideo}
        isOpen={!!selectedVideo}
        onClose={closeVideo}
      />

      <Toast show={showToast} message={toastMessage} />
    </>
  )
}

export default Home