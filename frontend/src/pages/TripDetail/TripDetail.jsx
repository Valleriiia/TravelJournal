import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { getTrip, updateTrip } from '../../api/trips'
import { getPlaces, createPlace, deletePlace } from '../../api/places'
import { getEntries, createEntry, deleteEntry } from '../../api/journal'
import { uploadFiles } from '../../api/upload'
import MapPicker from '../../components/MapPicker/MapPicker'
import Lightbox from '../../components/Lightbox/Lightbox'
import './TripDetail.scss'

const CATEGORY_LABELS = {
  hotel: '🏨 Готель',
  attraction: '🏛 Пам\'ятка',
  restaurant: '🍽 Ресторан',
  transport: '🚆 Транспорт',
  other: '📍 Інше',
}

const TripDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [places, setPlaces] = useState([])
  const [entries, setEntries] = useState([])
  const [tab, setTab] = useState('places')
  const [showPlaceForm, setShowPlaceForm] = useState(false)
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [placeForm, setPlaceForm] = useState({ name: '', category: 'attraction', notes: '', rating: '', visitedAt: '', coordinates: null, })
  const [entryForm, setEntryForm] = useState({ title: '', content: '', tags: '', isPublic: false, placeId: '', })
  const [photoFiles, setPhotoFiles] = useState([])
  const [photoPreviews, setPhotoPreviews] = useState([])
  const [entrySaving, setEntrySaving] = useState(false)
  const [entryError, setEntryError] = useState('')
  const [placeSaving, setPlaceSaving] = useState(false)
  const [placeError, setPlaceError] = useState('')
  const [highlightedPlace, setHighlightedPlace] = useState(null)
  const placeRefs = useRef({})
  const [lightbox, setLightbox] = useState({ open: false, photos: [], index: 0 })

  const openLightbox = (photos, index) => setLightbox({ open: true, photos, index })
  const closeLightbox = () => setLightbox(l => ({ ...l, open: false }))
  const prevPhoto = () => setLightbox(l => ({ ...l, index: (l.index - 1 + l.photos.length) % l.photos.length }))
  const nextPhoto = () => setLightbox(l => ({ ...l, index: (l.index + 1) % l.photos.length }))

  useEffect(() => {
    getTrip(id).then(setTrip).catch(() => navigate('/'))
    getPlaces(id).then(setPlaces)
    getEntries(id).then(setEntries)
  }, [id, navigate])

  const handlePlaceSubmit = async (e) => {
    e.preventDefault()
    setPlaceSaving(true)
    setPlaceError('')
    try {
      const data = {
        tripId: id,
        name: placeForm.name,
        category: placeForm.category,
        notes: placeForm.notes,
      }
      if (placeForm.rating) data.rating = Number(placeForm.rating)
      if (placeForm.visitedAt) data.visitedAt = placeForm.visitedAt
      if (placeForm.coordinates) {
        data.location = {
          type: 'Point',
          coordinates: placeForm.coordinates,
        }
      }
      const newPlace = await createPlace(data)
      setPlaces(prev => [...prev, newPlace])
      setPlaceForm({ name: '', category: 'attraction', notes: '', rating: '', visitedAt: '', coordinates: null })
      setShowPlaceForm(false)
    } catch (err) {
      setPlaceError(err.message || 'Помилка збереження. Спробуй ще раз.')
    } finally {
      setPlaceSaving(false)
    }
  }

  const handlePhotoChange = (e) => {
    const newFiles = Array.from(e.target.files)
    setPhotoFiles(prev => [...prev, ...newFiles])
    setPhotoPreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))])
    e.target.value = ''
  }

  const handleRemovePhoto = (index) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index))
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleEntrySubmit = async (e) => {
    e.preventDefault()
    setEntrySaving(true)
    setEntryError('')
    try {
      let photos = []
      if (photoFiles.length > 0) {
        const res = await uploadFiles(photoFiles)
        photos = res.urls
      }
      const data = {
        tripId: id,
        title: entryForm.title,
        content: entryForm.content,
        isPublic: entryForm.isPublic,
        photos,
        tags: entryForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      }
      if (entryForm.placeId) data.placeId = entryForm.placeId

      const newEntry = await createEntry(data)
      setEntries(prev => [newEntry, ...prev])
      setEntryForm({ title: '', content: '', tags: '', isPublic: false, placeId: '' })
      setPhotoFiles([])
      setPhotoPreviews([])
      setShowEntryForm(false)
    } catch (err) {
      setEntryError(err.message || 'Помилка збереження. Спробуй ще раз.')
    } finally {
      setEntrySaving(false)
    }
  }

  const handleDeletePlace = async (placeId) => {
    if (!confirm('Видалити місце?')) return
    await deletePlace(placeId)
    setPlaces(prev => prev.filter(p => p._id !== placeId))
  }

  const handleDeleteEntry = async (entryId) => {
    if (!confirm('Видалити запис?')) return
    await deleteEntry(entryId)
    setEntries(prev => prev.filter(e => e._id !== entryId))
  }

  const scrollToPlace = (placeId) => {
    setTab('places')
    setHighlightedPlace(placeId)
    setTimeout(() => {
      placeRefs.current[placeId]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => setHighlightedPlace(null), 2000)
    }, 100)
  }

  const handleTogglePublic = async () => {
    const updated = await updateTrip(id, { isPublic: !trip.isPublic })
    setTrip(updated)
  }

  if (!trip) return <div className="trip-detail__loading">Завантаження...</div>

  return (
    <div className="trip-detail">
      <button className="trip-detail__back" onClick={() => navigate('/')}>← Назад</button>

      <div className="trip-detail__hero">
        <h1>{trip.title}</h1>
        {trip.description && <p>{trip.description}</p>}
        <div className="trip-detail__meta">
          {trip.countries?.length > 0 && <span>🌍 {trip.countries.join(', ')}</span>}
          {trip.startDate && <span>📅 {new Date(trip.startDate).toLocaleDateString('uk-UA')}</span>}
          {trip.budget?.amount > 0 && <span>💰 {trip.budget.amount} {trip.budget.currency}</span>}
        </div>
        {user?.isPublicProfile && (<div className="trip-detail__visibility">
          <label className="visibility-toggle">
            <input
              type="checkbox"
              checked={trip.isPublic}
              onChange={handleTogglePublic}
            />
            <span>Публічна поїздка</span>
          </label>
          {trip.isPublic && (
            <p className="trip-detail__public-hint">
              Ця поїздка видна всім у твоєму публічному профілі
            </p>
          )}
        </div>)}
      </div>

      <div className="trip-detail__tabs">
        <button className={tab === 'places' ? 'active' : ''} onClick={() => setTab('places')}>
          📍 Місця ({places.length})
        </button>
        <button className={tab === 'journal' ? 'active' : ''} onClick={() => setTab('journal')}>
          📓 Щоденник ({entries.length})
        </button>
      </div>

      {tab === 'places' && (
        <div className="trip-detail__section">
          <button className="btn-primary" onClick={() => setShowPlaceForm(v => !v)}>
            {showPlaceForm ? 'Скасувати' : '+ Додати місце'}
          </button>

          {showPlaceForm && (
            <form className="detail-form" onSubmit={handlePlaceSubmit}>
              <input
                placeholder="Назва *"
                value={placeForm.name}
                onChange={e => setPlaceForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <select
                value={placeForm.category}
                onChange={e => setPlaceForm(f => ({ ...f, category: e.target.value }))}
              >
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>

              <div className="detail-form__field">
                <label>Дата відвідування</label>
                <input
                  type="date"
                  value={placeForm.visitedAt}
                  onChange={e => setPlaceForm(f => ({ ...f, visitedAt: e.target.value }))}
                />
              </div>

              <input
                type="number"
                min="1"
                max="5"
                placeholder="Рейтинг (1-5)"
                value={placeForm.rating}
                onChange={e => setPlaceForm(f => ({ ...f, rating: e.target.value }))}
              />
              <textarea
                placeholder="Нотатки"
                value={placeForm.notes}
                onChange={e => setPlaceForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
              />

              <div className="detail-form__field">
                <label>
                  Локація на карті
                  {placeForm.coordinates && (
                    <span className="detail-form__coords">
                      {placeForm.coordinates[1].toFixed(4)}, {placeForm.coordinates[0].toFixed(4)}
                    </span>
                  )}
                </label>
                <MapPicker
                  coordinates={placeForm.coordinates}
                  onSelect={coords => setPlaceForm(f => ({ ...f, coordinates: coords }))}
                />
                {placeForm.coordinates && (
                  <button
                    type="button"
                    className="detail-form__clear-map"
                    onClick={() => setPlaceForm(f => ({ ...f, coordinates: null }))}
                  >
                    Прибрати мітку
                  </button>
                )}
              </div>
              {placeError && <p className="detail-form__error">{placeError}</p>}
              <button type="submit" className="btn-primary" disabled={placeSaving}>
                {placeSaving ? (
                  <span className="detail-form__spinner">
                    <span className="spinner" /> Збереження...
                  </span>
                ) : 'Зберегти'}
              </button>
            </form>
          )}

          <div className="detail-list">
            {places.length === 0
              ? <p className="detail-empty">Місць ще немає</p>
              : places.map(place => (
                <div
                  key={place._id}
                  ref={el => placeRefs.current[place._id] = el}
                  className={`detail-item ${highlightedPlace === place._id ? 'detail-item--highlighted' : ''}`}
                >
                  <div className="detail-item__main">
                    <span className="detail-item__title">{CATEGORY_LABELS[place.category]} {place.name}</span>
                    {place.rating && <span className="detail-item__rating">{'⭐'.repeat(place.rating)}</span>}
                  </div>
                  {place.visitedAt && (
                    <p className="detail-item__meta">📅 {new Date(place.visitedAt).toLocaleDateString('uk-UA')}</p>
                  )}
                  {place.notes && <p className="detail-item__notes">{place.notes}</p>}
                  {place.location?.coordinates && (
                    <p className="detail-item__meta">
                      📍 {place.location.coordinates[1].toFixed(4)}, {place.location.coordinates[0].toFixed(4)}
                    </p>
                  )}
                  <button className="detail-item__delete" onClick={() => handleDeletePlace(place._id)}>Видалити</button>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {tab === 'journal' && (
        <div className="trip-detail__section">
          <button className="btn-primary" onClick={() => setShowEntryForm(v => !v)}>
            {showEntryForm ? 'Скасувати' : '+ Новий запис'}
          </button>

          {showEntryForm && (
            <form className="detail-form" onSubmit={handleEntrySubmit}>
              <input placeholder="Заголовок *" value={entryForm.title} onChange={e => setEntryForm(f => ({ ...f, title: e.target.value }))} required />
              {places.length > 0 && (
                <div className="detail-form__field">
                  <label>Прив'язати до місця (необов'язково)</label>
                  <select
                    value={entryForm.placeId}
                    onChange={e => setEntryForm(f => ({ ...f, placeId: e.target.value }))}
                  >
                    <option value="">— Без прив'язки —</option>
                    {places.map(place => (
                      <option key={place._id} value={place._id}>
                        {CATEGORY_LABELS[place.category]} {place.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <textarea placeholder="Текст *" value={entryForm.content} onChange={e => setEntryForm(f => ({ ...f, content: e.target.value }))} rows={4} required />
              <input placeholder="Теги (через кому)" value={entryForm.tags} onChange={e => setEntryForm(f => ({ ...f, tags: e.target.value }))} />
              <div className="detail-form__photos">
                <label className="detail-form__file-btn">
                  📷 Додати фото
                  <input type="file" accept="image/*" multiple onChange={handlePhotoChange} hidden />
                </label>
                {photoPreviews.length > 0 && (
                  <div className="detail-form__previews">
                    {photoPreviews.map((src, i) => (
                      <div key={i} className="detail-form__preview-item">
                        <img src={src} alt={`preview-${i}`} />
                        <button
                          type="button"
                          className="detail-form__remove-photo"
                          onClick={() => handleRemovePhoto(i)}
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {user?.isPublicProfile && (<label className="visibility-toggle">
                <input
                  type="checkbox"
                  checked={entryForm.isPublic}
                  onChange={e => setEntryForm(f => ({ ...f, isPublic: e.target.checked }))}
                />
                <span>Публічний запис</span>
              </label>)}
              {entryError && <p className="detail-form__error">{entryError}</p>}

              <button type="submit" className="btn-primary" disabled={entrySaving}>
                {entrySaving ? (
                  <span className="detail-form__spinner">
                    <span className="spinner" /> Збереження...
                  </span>
                ) : 'Зберегти'}
              </button>
            </form>
          )}

          <div className="detail-list">
            {entries.length === 0
              ? <p className="detail-empty">Записів ще немає</p>
              : entries.map(entry => (
                <div key={entry._id} className="detail-item detail-item--entry">
                  <div className="detail-item__main">
                    <span className="detail-item__title">{entry.title}</span>
                    {entry.placeId && (() => {
                      const place = places.find(p => p._id === entry.placeId)
                      return place ? (
                        <button
                          className="detail-item__place-link"
                          onClick={() => scrollToPlace(entry.placeId)}
                        >
                          {CATEGORY_LABELS[place.category]} {place.name} →
                        </button>
                      ) : null
                    })()}
                    <div className="detail-item__badges">
                      {entry.isPublic && <span className="detail-item__public">публічний</span>}
                      <span className="detail-item__date">{new Date(entry.createdAt).toLocaleDateString('uk-UA')}</span>
                    </div>
                  </div>
                  <p className="detail-item__notes">{entry.content}</p>
                  {entry.tags?.length > 0 && (
                    <div className="detail-item__tags">
                      {entry.tags.map(tag => <span key={tag}>#{tag}</span>)}
                    </div>
                  )}
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
                  <button className="detail-item__delete" onClick={() => handleDeleteEntry(entry._id)}>Видалити</button>
                </div>
              ))
            }
          </div>
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

export default TripDetail