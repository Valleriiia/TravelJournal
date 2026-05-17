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
      return res.json(users.map(u => ({ user: u, matches: [] })))
    }

    const regex = { $regex: search.trim(), $options: 'i' }

    const byName = await User.find({ isPublicProfile: true, name: regex })
      .select('_id')
    const nameMatchIds = new Set(byName.map(u => u._id.toString()))

    const matchingTrips = await Trip.find({
      isPublic: true,
      $or: [{ title: regex }, { countries: regex }],
    })

    const allMatchingPlaces = await Place.find({ name: regex }).select('tripId name category')
    const tripIdsFromPlaces = allMatchingPlaces.map(p => p.tripId)
    const tripsFromPlaces = await Trip.find({
      _id: { $in: tripIdsFromPlaces },
      isPublic: true,
    }).select('_id userId')

    const matchingEntries = await JournalEntry.find({
      isPublic: true,
      $or: [{ tags: regex }, { title: regex }, { content: regex }],
    }).select('tripId title tags')
    const tripIdsFromEntries = matchingEntries.map(e => e.tripId)
    const tripsFromEntries = await Trip.find({
      _id: { $in: tripIdsFromEntries },
      isPublic: true,
    }).select('_id userId')

    const userMatchMap = {}

    const ensureUser = (userId) => {
      const key = userId.toString()
      if (!userMatchMap[key]) userMatchMap[key] = []
      return key
    }

    for (const trip of matchingTrips) {
      const key = ensureUser(trip.userId)
      const titleMatch = new RegExp(search.trim(), 'i').test(trip.title)
      const countryMatch = trip.countries?.some(c => new RegExp(search.trim(), 'i').test(c))
      if (titleMatch) {
        userMatchMap[key].push({
          type: 'trip',
          tripId: trip._id,
          label: trip.title,
          hint: 'Назва поїздки',
        })
      }
      if (countryMatch) {
        const matched = trip.countries.filter(c => new RegExp(search.trim(), 'i').test(c))
        userMatchMap[key].push({
          type: 'trip',
          tripId: trip._id,
          label: trip.title,
          hint: `Країна: ${matched.join(', ')}`,
        })
      }
    }

    for (const place of allMatchingPlaces) {
      const parentTrip = tripsFromPlaces.find(t => t._id.toString() === place.tripId.toString())
      if (!parentTrip) continue
      const key = ensureUser(parentTrip.userId)
      userMatchMap[key].push({
        type: 'place',
        tripId: parentTrip._id,
        placeId: place._id,
        label: place.name,
        hint: 'Місце у поїздці',
      })
    }

    for (const entry of matchingEntries) {
      const parentTrip = tripsFromEntries.find(t => t._id.toString() === entry.tripId.toString())
      if (!parentTrip) continue
      const key = ensureUser(parentTrip.userId)

      const titleMatch = new RegExp(search.trim(), 'i').test(entry.title)
      const tagMatch = entry.tags?.find(tag => new RegExp(search.trim(), 'i').test(tag))
      const hint = tagMatch ? `Тег: #${tagMatch}` : 'Запис у щоденнику'

      userMatchMap[key].push({
        type: 'entry',
        tripId: parentTrip._id,
        entryId: entry._id,
        label: entry.title,
        hint,
      })
    }

    const userIdSet = new Set([
      ...nameMatchIds,
      ...Object.keys(userMatchMap),
    ])

    const users = await User.find({
      _id: { $in: Array.from(userIdSet) },
      isPublicProfile: true,
    }).select('-passwordHash -email').limit(20)

    const result = users.map(u => ({
      user: u,
      matches: nameMatchIds.has(u._id.toString())
        ? [] 
        : (userMatchMap[u._id.toString()] || []),
    }))

    res.json(result)
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