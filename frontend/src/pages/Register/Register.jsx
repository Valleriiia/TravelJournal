import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as registerApi } from '../../api/auth'
import { useAuth } from '../../context/authContext'
import '../Login/Login.scss'

const Register = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const data = await registerApi(form)
      login(data.token, data.user)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Помилка реєстрації')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🗺 Travel Journal</h1>
        <h2>Реєстрація</h2>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input name="name" type="text" placeholder="Ім'я" value={form.name} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Пароль" value={form.password} onChange={handleChange} required />
          <button type="submit">Зареєструватись</button>
        </form>
        <p>Вже є акаунт? <Link to="/login">Увійти</Link></p>
      </div>
    </div>
  )
}

export default Register