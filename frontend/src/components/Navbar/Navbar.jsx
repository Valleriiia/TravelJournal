import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import './Navbar.scss'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__logo">🗺 Travel Journal</Link>
      <div className="navbar__links">
        <Link to="/" className="navbar__link">Мої поїздки</Link>
        <Link to="/explore" className="navbar__link">Мандрівники</Link>
      </div>
      
      <div className="navbar__right">
        <Link to="/profile" className="navbar__profile">
          {user?.avatar
            ? <img src={user.avatar} alt="avatar" className="navbar__avatar" />
            : <span className="navbar__avatar-placeholder">{user?.name?.[0]?.toUpperCase()}</span>
          }
          <span className="navbar__user">{user?.name}</span>
        </Link>
        <button className="navbar__logout" onClick={handleLogout}>Вийти</button>
      </div>
    </nav>
  )
}

export default Navbar