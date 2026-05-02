import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import placeRoutes from './routes/places.js';
import journalRoutes from './routes/journalEntries.js';
import uploadRoutes from './routes/upload.js'
import userRoutes from './routes/users.js'

import { fileURLToPath } from 'url'
import path from 'path'

dotenv.config();
connectDB();

const app = express();

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))) 

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/upload', uploadRoutes)
app.use('/api/users', userRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));