import express from 'express'
import User from '../models/User.js'
import Trip from '../models/Trip.js'
import Place from '../models/Place.js'
import JournalEntry from '../models/JournalEntry.js'
import auth from '../middleware/auth.js'
import { deleteFile } from '../utils/deleteFile.js'

const router = express.Router()

// GET /api/users?search=...
router.get('/', async (req, res) => {
  try {
    const { search } = req.query

    if (!search || search.trim() === '') {
      const users = await User.find({ isPublicProfile: true })
        .select('-passwordHash -email')
        .limit(20)
      return res.json(users)
    }

    const regex = { $regex: search.trim(), $options: 'i' }

    const byName = await User.find({ isPublicProfile: true, name: regex })
      .select('_id')

    const matchingTrips = await Trip.find({
      isPublic: true,
      $or: [
        { title: regex },
        { countries: regex },
      ]
    }).select('userId')

    const allMatchingPlaces = await Place.find({ name: regex })
      .select('tripId')

    const tripIdsFromPlaces = allMatchingPlaces.map(p => p.tripId)
    const tripsFromPlaces = await Trip.find({
      _id: { $in: tripIdsFromPlaces },
      isPublic: true,
    }).select('userId')

    const matchingEntries = await JournalEntry.find({
      isPublic: true,
      $or: [
        { tags: regex },
        { title: regex },
        { content: regex },
      ]
    }).select('tripId')

    const tripIdsFromEntries = matchingEntries.map(e => e.tripId)
    const tripsFromEntries = await Trip.find({
      _id: { $in: tripIdsFromEntries },
      isPublic: true,
    }).select('userId')

    const userIdSet = new Set([
      ...byName.map(u => u._id.toString()),
      ...matchingTrips.map(t => t.userId.toString()),
      ...tripsFromPlaces.map(t => t.userId.toString()),
      ...tripsFromEntries.map(t => t.userId.toString()),
    ])

    const users = await User.find({
      _id: { $in: Array.from(userIdSet) },
      isPublicProfile: true,
    }).select('-passwordHash -email').limit(20)

    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/users/:id — публічний профіль + поїздки
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash -email')
    if (!user || !user.isPublicProfile) {
      return res.status(404).json({ message: 'Профіль не знайдено або є приватним' })
    }
    const trips = await Trip.find({ userId: req.params.id, isPublic: true }).sort({ createdAt: -1 })
    res.json({ user, trips })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/users/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, avatar, isPublicProfile } = req.body
    const oldUser = await User.findById(req.user.id)
    if (avatar && oldUser.avatar && oldUser.avatar !== avatar) {
      deleteFile(oldUser.avatar)
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, avatar, isPublicProfile },
      { new: true }
    ).select('-passwordHash')
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router