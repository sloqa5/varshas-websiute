import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Checkout from './pages/Checkout'
import { CartProvider } from './store/cartStore'
import { AuthProvider } from './hooks/useAuth'
import ProductModal from './components/ProductModal'
import Toast from './components/Toast'
import VideoLightbox from './components/VideoLightbox'

function App() {
  return (
    <div className="app">
      <AuthProvider>
        <CartProvider>
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/checkout" element={<Checkout />} />
            </Routes>
          </main>
          <Footer />
          <ProductModal />
          <Toast />
          <VideoLightbox />
        </CartProvider>
      </AuthProvider>
    </div>
  )
}

export default App