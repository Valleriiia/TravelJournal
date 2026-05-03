import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getPublicProfile } from '../../api/users'
import './PublicProfile.scss'

const STATUS_LABELS = {
  planned: 'Заплановано',
  ongoing: 'В процесі',
  completed: 'Завершено',
}

const PublicProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublicProfile(id)
      .then(setData)
      .catch(err => setError(err.message || 'Профіль не знайдено'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="public-profile__loading">Завантаження...</div>

  if (error) return (
    <div className="public-profile__error">
      <p>😕 {error}</p>
      <button onClick={() => navigate(-1)}>Назад</button>
    </div>
  )

  const { user, trips } = data

  return (
    <div className="public-profile">
      <button className="public-profile__back" onClick={() => navigate(-1)}>← Назад</button>

      <div className="public-profile__header">
        <div className="public-profile__avatar">
          {user.avatar
            ? <img src={user.avatar} alt={user.name} />
            : <span>{user.name?.[0]?.toUpperCase()}</span>
          }
        </div>
        <div>
          <h1>{user.name}</h1>
          <p>{trips.length} публічних поїздок</p>
        </div>
      </div>

      {trips.length === 0 ? (
        <p className="public-profile__empty">Публічних поїздок ще немає</p>
      ) : (
        <div className="public-profile__trips">
          {trips.map(trip => (
            <Link to={`/trips/public/${trip._id}`} key={trip._id} className="public-trip-card">
              {trip.coverImage && (
                <img src={trip.coverImage} alt={trip.title} className="public-trip-card__cover" />
              )}
              <div className="public-trip-card__body">
                <div className="public-trip-card__header">
                  <h3>{trip.title}</h3>
                  <span className={`public-trip-card__status public-trip-card__status--${trip.status}`}>
                    {STATUS_LABELS[trip.status]}
                  </span>
                </div>
                {trip.description && <p className="public-trip-card__desc">{trip.description}</p>}
                <div className="public-trip-card__meta">
                  {trip.countries?.length > 0 && <span>🌍 {trip.countries.join(', ')}</span>}
                  {trip.startDate && <span>📅 {new Date(trip.startDate).toLocaleDateString('uk-UA')}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default PublicProfile