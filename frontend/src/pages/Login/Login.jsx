import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as loginApi } from '../../api/auth'
import { useAuth } from '../../context/authContext'
import './Login.scss'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const data = await loginApi(form)
      login(data.token, data.user)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Помилка входу')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🗺 Travel Journal</h1>
        <h2>Вхід</h2>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Пароль" value={form.password} onChange={handleChange} required />
          <button type="submit">Увійти</button>
        </form>
        <p>Немає акаунту? <Link to="/register">Зареєструватись</Link></p>
      </div>
    </div>
  )
}

export default Login