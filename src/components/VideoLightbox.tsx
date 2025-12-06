import React, { useEffect } from 'react'
import { Tutorial } from '../types'

interface VideoLightboxProps {
  video: Tutorial | null
  isOpen: boolean
  onClose: () => void
}

const VideoLightbox: React.FC<VideoLightboxProps> = ({ video, isOpen, onClose }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!video || !isOpen) return null

  return (
    <div className={`video-lightbox ${isOpen ? 'active' : ''}`} aria-hidden={!isOpen}>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="lightbox-content">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="lightbox-frame" aria-label="Video playback preview">
          <div className="lightbox-poster">
            <p>{video.title}</p>
            <span>{video.detail}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoLightbox