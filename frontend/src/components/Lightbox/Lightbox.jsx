import { useEffect } from 'react'
import './Lightbox.scss'

const Lightbox = ({ photos, currentIndex, onClose, onPrev, onNext }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'ArrowLeft') onPrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, onNext, onPrev])

  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox__close" onClick={onClose}>×</button>

      {photos.length > 1 && (
        <>
          <button
            className="lightbox__nav lightbox__nav--prev"
            onClick={e => { e.stopPropagation(); onPrev() }}
          >‹</button>
          <button
            className="lightbox__nav lightbox__nav--next"
            onClick={e => { e.stopPropagation(); onNext() }}
          >›</button>
        </>
      )}

      <div className="lightbox__img-wrap" onClick={e => e.stopPropagation()}>
        <img src={photos[currentIndex]} alt="" />
      </div>

      {photos.length > 1 && (
        <p className="lightbox__counter">{currentIndex + 1} / {photos.length}</p>
      )}
    </div>
  )
}

export default Lightbox