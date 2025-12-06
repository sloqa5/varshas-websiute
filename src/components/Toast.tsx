import React from 'react'

interface ToastProps {
  show: boolean
  message: string
}

const Toast: React.FC<ToastProps> = ({ show, message }) => {
  return (
    <div className={`toast ${show ? 'show' : ''}`} role="status" aria-live="polite">
      {message}
    </div>
  )
}

export default Toast