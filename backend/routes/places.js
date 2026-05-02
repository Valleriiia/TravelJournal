import express from 'express';
import Place from '../models/Place.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/places?tripId=... — всі місця поїздки
router.get('/', auth, async (req, res) => {
  try {
    const places = await Place.find({ tripId: req.query.tripId });
    res.json(places);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/places — додати місце
router.post('/', auth, async (req, res) => {
  try {
    const data = { ...req.body }

    if (!data.location?.coordinates?.length) {
      delete data.location
    }

    if (!data.rating) delete data.rating

    const place = await Place.create(data)
    res.status(201).json(place)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
});

// PUT /api/places/:id — оновити місце
router.put('/:id', auth, async (req, res) => {
  try {
    const place = await Place.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!place) return res.status(404).json({ message: 'Місце не знайдено' });
    res.json(place);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/places/:id — видалити місце
router.delete('/:id', auth, async (req, res) => {
  try {
    await Place.findByIdAndDelete(req.params.id);
    res.json({ message: 'Місце видалено' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;