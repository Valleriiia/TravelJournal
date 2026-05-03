import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPublicTrip } from '../../api/trips'
import Lightbox from '../../components/Lightbox/Lightbox'
import './PublicTrip.scss'

const CATEGORY_LABELS = {
  hotel: '🏨 Готель',
  attraction: '🏛 Пам\'ятка',
  restaurant: '🍽 Ресторан',
  transport: '🚆 Транспорт',
  other: '📍 Інше',
}

const STATUS_LABELS = {
  planned: 'Заплановано',
  ongoing: 'В процесі',
  completed: 'Завершено',
}

const PublicTrip = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('places')
  const [highlightedPlace, setHighlightedPlace] = useState(null)
  const placeRefs = useRef({})
  const [lightbox, setLightbox] = useState({ open: false, photos: [], index: 0 })

  const openLightbox = (photos, index) => setLightbox({ open: true, photos, index })
  const closeLightbox = () => setLightbox(l => ({ ...l, open: false }))
  const prevPhoto = () => setLightbox(l => ({ ...l, index: (l.index - 1 + l.photos.length) % l.photos.length }))
  const nextPhoto = () => setLightbox(l => ({ ...l, index: (l.index + 1) % l.photos.length }))

  useEffect(() => {
    getPublicTrip(id)
      .then(setData)
      .catch(err => setError(err.message || 'Поїздку не знайдено'))
  }, [id])

  if (error) return (
    <div className="public-trip__error">
      <p>😕 {error}</p>
      <button onClick={() => navigate(-1)}>Назад</button>
    </div>
  )

  if (!data) return <div className="public-trip__loading">Завантаження...</div>

  const { trip, places, entries } = data

  const scrollToPlace = (placeId) => {
    setTab('places')
    setHighlightedPlace(placeId)
    setTimeout(() => {
      placeRefs.current[placeId]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => setHighlightedPlace(null), 2000)
    }, 100)
  }

  return (
    <div className="public-trip">
      <button className="public-trip__back" onClick={() => navigate(-1)}>← Назад</button>

      {trip.coverImage && (
        <img src={trip.coverImage} alt={trip.title} className="public-trip__cover" />
      )}

      <div className="public-trip__hero">
        <div className="public-trip__hero-top">
          <h1>{trip.title}</h1>
          <span className={`public-trip__status public-trip__status--${trip.status}`}>
            {STATUS_LABELS[trip.status]}
          </span>
        </div>
        {trip.description && <p>{trip.description}</p>}
        <div className="public-trip__meta">
          {trip.countries?.length > 0 && <span>🌍 {trip.countries.join(', ')}</span>}
          {trip.startDate && <span>📅 {new Date(trip.startDate).toLocaleDateString('uk-UA')}</span>}
          {trip.endDate && <span>🏁 {new Date(trip.endDate).toLocaleDateString('uk-UA')}</span>}
        </div>
      </div>

      <div className="public-trip__tabs">
        <button className={tab === 'places' ? 'active' : ''} onClick={() => setTab('places')}>
          📍 Місця ({places.length})
        </button>
        <button className={tab === 'journal' ? 'active' : ''} onClick={() => setTab('journal')}>
          📓 Щоденник ({entries.length})
        </button>
      </div>

      {tab === 'places' && (
        <div className="public-trip__list">
          {places.length === 0
            ? <p className="public-trip__empty">Місць немає</p>
            : places.map(place => (
              <div
                key={place._id}
                ref={el => placeRefs.current[place._id] = el}
                className={`public-item ${highlightedPlace === place._id ? 'public-item--highlighted' : ''}`}
              >
                <div className="public-item__main">
                  <span className="public-item__title">
                    {CATEGORY_LABELS[place.category]} {place.name}
                  </span>
                  {place.rating && <span>{'⭐'.repeat(place.rating)}</span>}
                </div>
                {place.notes && <p className="public-item__notes">{place.notes}</p>}
                {place.location?.coordinates && (
                  <p className="public-item__meta">
                    📍 {place.location.coordinates[1].toFixed(4)}, {place.location.coordinates[0].toFixed(4)}
                  </p>
                )}
              </div>
            ))
          }
        </div>
      )}

      {tab === 'journal' && (
        <div className="public-trip__list">
          {entries.length === 0
            ? <p className="public-trip__empty">Публічних записів немає</p>
            : entries.map(entry => (
              <div key={entry._id} className="public-item">
                <div className="public-item__main">
                  <span className="public-item__title">{entry.title}</span>
                  {entry.placeId && (() => {
                    const place = places.find(p => p._id === entry.placeId)
                    return place ? (
                      <button
                        className="public-item__place-link"
                        onClick={() => scrollToPlace(entry.placeId)}
                      >
                        {CATEGORY_LABELS[place.category]} {place.name} →
                      </button>
                    ) : null
                  })()}
                  <span className="public-item__date">
                    {new Date(entry.createdAt).toLocaleDateString('uk-UA')}
                  </span>
                </div>
                <p className="public-item__notes">{entry.content}</p>
                {entry.photos?.length > 0 && (
                  <div className="detail-item__photos">
                    {entry.photos.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`photo-${i}`}
                        onClick={() => openLightbox(entry.photos, i)}
                      />
                    ))}
                  </div>
                )}
                {entry.tags?.length > 0 && (
                  <div className="public-item__tags">
                    {entry.tags.map(tag => <span key={tag}>#{tag}</span>)}
                  </div>
                )}
              </div>
            ))
          }
        </div>
      )}
      {lightbox.open && (
        <Lightbox
          photos={lightbox.photos}
          currentIndex={lightbox.index}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />
      )}
    </div>
  )
}

export default PublicTrip