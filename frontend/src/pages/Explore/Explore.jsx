import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { searchUsers } from '../../api/users'
import './Explore.scss'

const Explore = () => {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true)
      searchUsers(search)
        .then(setUsers)
        .finally(() => setLoading(false))
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

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
          {users.length > 0
            ? `Знайдено ${users.length} мандрівник${users.length === 1 ? 'а' : 'ів'} за запитом «${search}»`
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
          {users.map(user => (
            <Link to={`/profile/${user._id}`} key={user._id} className="explorer-card">
              <div className="explorer-card__avatar">
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} />
                  : <span>{user.name?.[0]?.toUpperCase()}</span>
                }
              </div>
              <div className="explorer-card__info">
                <p className="explorer-card__name">{user.name}</p>
                <p className="explorer-card__hint">Переглянути профіль →</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Explore