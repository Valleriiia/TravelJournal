import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { searchUsers } from '../../api/users'
import './Explore.scss'

const CATEGORY_LABELS = {
  hotel: '🏨 Готель',
  attraction: '🏛 Пам\'ятка',
  restaurant: '🍽 Ресторан',
  transport: '🚆 Транспорт',
  other: '📍 Інше',
}

const TYPE_ICONS = {
  trip: '✈️',
  place: '📍',
  entry: '📓',
}

// Deduplicate matches: same tripId+type+label => one entry
const deduplicateMatches = (matches) => {
  const seen = new Set()
  return matches.filter(m => {
    const key = `${m.type}-${m.tripId}-${m.label}-${m.placeId || ''}-${m.entryId || ''}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const Explore = () => {
  const [results, setResults] = useState([]) // Array<{ user, matches }>
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true)
      searchUsers(search)
        .then(setResults)
        .finally(() => setLoading(false))
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const handleMatchClick = (match) => {
    if (match.type === 'trip') {
      navigate(`/trips/public/${match.tripId}`)
    } else if (match.type === 'place') {
      navigate(`/trips/public/${match.tripId}?highlight=place&id=${match.placeId}`)
    } else if (match.type === 'entry') {
      navigate(`/trips/public/${match.tripId}?highlight=entry&id=${match.entryId}`)
    }
  }

  return (
    <div className="explore">
      <h1>Мандрівники</h1>

      <div className="explore__search-wrap">
        <input
          className="explore__search"
          placeholder="Пошук за іменем, країною, місцем, тегом..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="explore__clear" onClick={() => setSearch('')}>×</button>
        )}
      </div>

      {search && !loading && (
        <p className="explore__context">
          {results.length > 0
            ? `Знайдено ${results.length} мандрівник${results.length === 1 ? 'а' : 'ів'} за запитом «${search}»`
            : `За запитом «${search}» нічого не знайдено`
          }
        </p>
      )}

      <div className="explore__hints">
        <span>Пошук по:</span>
        {['імені', 'назві поїздки', 'країні', 'назві місця', 'тегу', 'запису'].map(hint => (
          <span key={hint} className="explore__hint-tag">{hint}</span>
        ))}
      </div>

      {loading ? (
        <p className="explore__loading">Завантаження...</p>
      ) : (
        <div className="explore__list">
          {results.map(({ user, matches }) => {
            const deduped = deduplicateMatches(matches || [])
            const isNameMatch = deduped.length === 0

            return (
              <div key={user._id} className="explorer-card">
                <Link to={`/profile/${user._id}`} className="explorer-card__profile">
                  <div className="explorer-card__avatar">
                    {user.avatar
                      ? <img src={user.avatar} alt={user.name} />
                      : <span>{user.name?.[0]?.toUpperCase()}</span>
                    }
                  </div>
                  <div className="explorer-card__info">
                    <p className="explorer-card__name">{user.name}</p>
                    <p className="explorer-card__hint">
                      {isNameMatch ? 'Переглянути профіль →' : 'Переглянути профіль'}
                    </p>
                  </div>
                </Link>

                {deduped.length > 0 && (
                  <div className="explorer-card__matches">
                    <p className="explorer-card__matches-label">Знайдено у:</p>
                    <div className="explorer-card__matches-list">
                      {deduped.map((match, i) => (
                        <button
                          key={i}
                          className={`explorer-card__match explorer-card__match--${match.type}`}
                          onClick={() => handleMatchClick(match)}
                          title={match.hint}
                        >
                          <span className="explorer-card__match-icon">{TYPE_ICONS[match.type]}</span>
                          <span className="explorer-card__match-label">{match.label}</span>
                          <span className="explorer-card__match-hint">{match.hint}</span>
                          <span className="explorer-card__match-arrow">→</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Explore