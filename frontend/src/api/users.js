const BASE = 'http://localhost:5000/api/users'
const token = () => localStorage.getItem('token')

export const updateProfile = async (data) => {
  const res = await fetch(`${BASE}/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export const getPublicProfile = async (id) => {
  const res = await fetch(`${BASE}/${id}`)
  if (!res.ok) throw await res.json()
  return res.json() // { user, trips }
}

export const searchUsers = async (search = '') => {
  const res = await fetch(`${BASE}?search=${encodeURIComponent(search)}`)
  if (!res.ok) throw await res.json()
  return res.json()
}