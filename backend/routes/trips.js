import express from 'express';
import Trip from '../models/Trip.js';
import auth from '../middleware/auth.js';
import Place from '../models/Place.js'
import JournalEntry from '../models/JournalEntry.js'
import { deleteFile, deleteFiles } from '../utils/deleteFile.js'

const router = express.Router();

const updateTripStatus = async (trip) => {
  if (!trip.startDate) return trip

  const now = new Date()
  const start = new Date(trip.startDate)
  const end = trip.endDate ? new Date(trip.endDate) : null

  let newStatus
  if (start > now) newStatus = 'planned'
  else if (end && end < now) newStatus = 'completed'
  else newStatus = 'ongoing'

  if (newStatus !== trip.status) {
    trip.status = newStatus
    await trip.save()
  }
  return trip
}

// GET /api/trips — всі поїздки поточного юзера
router.get('/', auth, async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id }).sort({ createdAt: -1 })
    const updated = await Promise.all(trips.map(updateTripStatus))
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/trips/public/:id — публічна поїздка з місцями і записами
router.get('/public/:id', async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, isPublic: true })
    if (!trip) return res.status(404).json({ message: 'Поїздку не знайдено' })
    await updateTripStatus(trip)
    const places = await Place.find({ tripId: trip._id })
    const entries = await JournalEntry.find({ tripId: trip._id, isPublic: true }).sort({ createdAt: -1 })

    res.json({ trip, places, entries })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/trips/:id — одна поїздка
router.get('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id })
    if (!trip) return res.status(404).json({ message: 'Поїздку не знайдено' })
    await updateTripStatus(trip)
    res.json(trip)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/trips — створити поїздку
router.post('/', auth, async (req, res) => {
  try {
    const trip = await Trip.create({ ...req.body, userId: req.user.id });
    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/trips/:id — оновити поїздку
router.put('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!trip) return res.status(404).json({ message: 'Поїздку не знайдено' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/trips/:id — видалити поїздку
router.delete('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user.id })
    if (!trip) return res.status(404).json({ message: 'Поїздку не знайдено' })

    deleteFile(trip.coverImage)

    const entries = await JournalEntry.find({ tripId: trip._id })
    entries.forEach(e => deleteFiles(e.photos))
    await JournalEntry.deleteMany({ tripId: trip._id })
    await Place.deleteMany({ tripId: trip._id })

    res.json({ message: 'Поїздку видалено' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router;