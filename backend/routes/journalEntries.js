import express from 'express'
import JournalEntry from '../models/JournalEntry.js'
import auth from '../middleware/auth.js'
import { deleteFiles } from '../utils/deleteFile.js'

const router = express.Router()

router.get('/', auth, async (req, res) => {
  try {
    const entries = await JournalEntry.find({ tripId: req.query.tripId }).sort({ createdAt: -1 })
    res.json(entries)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', auth, async (req, res) => {
  try {
    const entry = await JournalEntry.create(req.body)
    res.status(201).json(entry)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/:id', auth, async (req, res) => {
  try {
    const entry = await JournalEntry.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!entry) return res.status(404).json({ message: 'Запис не знайдено' })
    res.json(entry)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await JournalEntry.findByIdAndDelete(req.params.id)
    if (!entry) return res.status(404).json({ message: 'Запис не знайдено' })
    deleteFiles(entry.photos)
    res.json({ message: 'Запис видалено' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router