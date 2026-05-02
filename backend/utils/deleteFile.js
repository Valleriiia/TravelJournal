import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const deleteFile = (url) => {
  if (!url) return
  try {
    const filename = url.split('/uploads/')[1]
    if (!filename) return
    const filepath = path.join(__dirname, '..', 'uploads', filename)
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
  } catch (err) {
    console.error('Помилка видалення файлу:', err.message)
  }
}

export const deleteFiles = (urls = []) => {
  urls.forEach(deleteFile)
}