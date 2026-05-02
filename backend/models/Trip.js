import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  countries: [{ type: String }],
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ['planned', 'ongoing', 'completed'], default: 'planned' },
  budget: {
    amount: { type: Number },
    currency: { type: String, default: 'UAH' },
  },
  coverImage: { type: String },
  isPublic: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('trips', tripSchema);