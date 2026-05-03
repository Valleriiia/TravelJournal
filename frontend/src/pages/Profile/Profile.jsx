import { useState } from 'react'
import { useAuth } from '../../context/authContext'
import { updateProfile } from '../../api/users'
import { uploadFile } from '../../api/upload'
import './Profile.scss'

const Profile = () => {
  const { user, login } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    isPublicProfile: user?.isPublicProfile || false,
  })
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      let avatar = user?.avatar
      if (avatarFile) {
        const res = await uploadFile(avatarFile)
        avatar = res.url
      }
      const updated = await updateProfile({ ...form, avatar })
      login(localStorage.getItem('token'), updated)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="profile">
      <h1>Мій профіль</h1>
      <form className="profile__form" onSubmit={handleSubmit}>
        <div className="profile__avatar-section">
          <div className="profile__avatar">
            {avatarPreview
              ? <img src={avatarPreview} alt="avatar" />
              : <span>{user?.name?.[0]?.toUpperCase()}</span>
            }
          </div>
          <label className="profile__avatar-btn">
            Змінити фото
            <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
          </label>
        </div>

        <div className="profile__field">
          <label>Ім'я</label>
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
        </div>

        <div className="profile__field">
          <label>Email</label>
          <input value={user?.email} disabled />
        </div>

        <label className="profile__checkbox">
          <input
            type="checkbox"
            checked={form.isPublicProfile}
            onChange={e => setForm(f => ({ ...f, isPublicProfile: e.target.checked }))}
          />
          Публічний профіль (інші можуть переглядати мої поїздки)
        </label>

        {success && <p className="profile__success">Збережено!</p>}

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Збереження...' : 'Зберегти'}
        </button>
        {user?.isPublicProfile && (
          <div className="profile__public-link">
            <a
              href={`/profile/${user._id}`}
              rel="noreferrer"
            >
              Твій публічний профіль
            </a>
          </div>
        )}
      </form>
    </div>
  )
}

export default Profile