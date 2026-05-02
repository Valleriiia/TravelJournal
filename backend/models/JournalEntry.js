import mongoose from 'mongoose';

const journalEntrySchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  placeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' },
  title: { type: String, required: true },
  content: { type: String, required: true },
  photos: [{ type: String }],
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('journal_entries', journalEntrySchema);