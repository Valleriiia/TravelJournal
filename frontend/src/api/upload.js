import imageCompression from 'browser-image-compression'

const BASE = 'http://localhost:5000/api/upload'
const token = () => localStorage.getItem('token')

const compress = async (file) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  }
  try {
    return await imageCompression(file, options)
  } catch {
    return file
  }
}

export const uploadFile = async (file) => {
  const compressed = await compress(file)
  const formData = new FormData()
  formData.append('file', compressed, file.name)
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token()}` },
    body: formData,
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export const uploadFiles = async (files) => {
  const compressed = await Promise.all(files.map(f => compress(f)))
  const formData = new FormData()
  compressed.forEach((f, i) => formData.append('files', f, files[i].name))
  const res = await fetch(`${BASE}/multiple`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token()}` },
    body: formData,
  })
  if (!res.ok) throw await res.json()
  return res.json()
}