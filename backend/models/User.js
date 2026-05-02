import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String },
  isPublicProfile: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('users', userSchema);