import express from 'express'
import auth from '../middleware/auth.js'
import upload from '../middleware/upload.js'

const router = express.Router()

router.post('/', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Файл не завантажено' })
  const url = `http://localhost:5000/uploads/${req.file.filename}`
  res.json({ url })
})

router.post('/multiple', auth, upload.any(), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ message: 'Файли не завантажено' })
  const urls = req.files.map(f => `http://localhost:5000/uploads/${f.filename}`)
  res.json({ urls })
})

export default router