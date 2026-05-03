const BASE = 'http://localhost:5000/api/journal'
const token = () => localStorage.getItem('token')

export const getEntries = async (tripId) => {
  const res = await fetch(`${BASE}?tripId=${tripId}`, {
    headers: { Authorization: `Bearer ${token()}` },
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export const createEntry = async (data) => {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export const deleteEntry = async (id) => {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token()}` },
  })
  if (!res.ok) throw await res.json()
  return res.json()
}