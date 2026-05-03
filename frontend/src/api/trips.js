const BASE = 'http://localhost:5000/api/trips'
const token = () => localStorage.getItem('token')

export const getTrips = async () => {
  const res = await fetch(BASE, {
    headers: { Authorization: `Bearer ${token()}` },
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export const getTrip = async (id) => {
  const res = await fetch(`${BASE}/${id}`, {
    headers: { Authorization: `Bearer ${token()}` },
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export const createTrip = async (data) => {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export const updateTrip = async (id, data) => {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export const deleteTrip = async (id) => {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token()}` },
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export const getPublicTrip = async (id) => {
  const res = await fetch(`http://localhost:5000/api/trips/public/${id}`)
  if (!res.ok) throw await res.json()
  return res.json()
}