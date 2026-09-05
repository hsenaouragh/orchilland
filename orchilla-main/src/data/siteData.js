import French from '../assets/french.png'
import English from '../assets/english.png'
import Italian from '../assets/italy.png'
import Korean from '../assets/korea.png'
import LondonLandmark from '../assets/london_landmark.jpg'
import ParisLandmark from '../assets/paris_landmark.jpg'
import RomeLandmark from '../assets/rome_landmark.jpg'
import SeoulLandmark from '../assets/seoul_landmark.jpg'

export const LANDMARK_IMAGES = {
  English: LondonLandmark,
  French: ParisLandmark,
  Italian: RomeLandmark,
  Korean: SeoulLandmark,
}

const LANGUAGE_META = {
  English: {
    color: '#378ADD',
    flag: English,
    landmark: LondonLandmark,
    learners: '12.4K+',
    rating: '4.8 (1.2K reviews)',
    tagline: 'Build fluency and confidence in real-life situations.',
  },
  French: {
    color: '#E85D26',
    flag: French,
    landmark: ParisLandmark,
    learners: '10.2K+',
    rating: '4.7 (1.1K reviews)',
    tagline: 'Master the language of culture, travel and opportunity.',
  },
  Italian: {
    color: '#D4537E',
    flag: Italian,
    landmark: RomeLandmark,
    learners: '8.6K+',
    rating: '4.6 (980 reviews)',
    tagline: 'Speak like a local and discover Italy\'s rich culture.',
  },
  Korean: {
    color: '#1D9E75',
    flag: Korean,
    landmark: SeoulLandmark,
    learners: '7.4K+',
    rating: '4.7 (1,034 reviews)',
    tagline: 'Learn the language of K-pop, tech and innovation.',
  },
}

const TYPE_FALLBACK = 'Group courses'

const inferLanguage = (value = '') => {
  const text = String(value).toLowerCase()
  if (text.includes('french')) return 'French'
  if (text.includes('italian')) return 'Italian'
  if (text.includes('korean')) return 'Korean'
  return 'English'
}

const numberFrom = (value) => {
  if (typeof value === 'number') return value
  if (!value) return 0
  const parsed = Number(String(value).replace(/[^0-9.]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

export const getCourseVisuals = (course = {}) => {
  const language = course.language || course.lang || inferLanguage(`${course.title || ''} ${course.description || ''}`)
  return {
    language,
    ...(LANGUAGE_META[language] || LANGUAGE_META.English),
  }
}

// Prices are stored in Algerian dinars (DZD). "4991 DA".
export const formatDinars = (value) => `${numberFrom(value).toLocaleString('en-US')} DA`

export const normalizeCourse = (row = {}) => {
  const visuals = getCourseVisuals(row)
  const amount = numberFrom(row.amount ?? row.price_amount ?? row.price)
  const priceText = String(row.price || '').toLowerCase()
  const isPaid = amount > 0 || priceText === 'paid'

  // Duration is stored as a week count (duration_weeks); fall back to any free-text.
  const weeks = numberFrom(row.duration_weeks)
  const duration = row.duration
    || (weeks > 0 ? `${weeks} week${weeks > 1 ? 's' : ''}` : 'Self-paced')

  return {
    id: row.id,
    title: row.title || row.name || 'Untitled course',
    lang: visuals.language,
    language: visuals.language,
    type: row.type || TYPE_FALLBACK,
    price: isPaid ? 'Paid' : 'Free',
    level: row.level || 'Beginner',
    duration,
    students: Number(row.students || 0),
    color: row.color || visuals.color,
    price_amount: isPaid ? formatDinars(amount) : null,
    amount,
    flag: visuals.flag,
    landmark: row.landmark || visuals.landmark,
    learners: row.learners || visuals.learners || '5.2K+ learners',
    rating: row.rating || visuals.rating || '4.8 (850 reviews)',
    tagline: row.tagline || visuals.tagline || row.description || '',
    status: row.status || 'available',
    description: row.description || '',
    imageUrl: row.image_url || row.imageUrl || null,
    createdAt: row.created_at || row.createdAt || null,
    updatedAt: row.updated_at || row.updatedAt || null,
  }
}

export const normalizeBook = (row = {}) => {
  const language = row.language || inferLanguage(`${row.title || ''} ${row.description || ''}`)
  const visuals = LANGUAGE_META[language] || LANGUAGE_META.English

  return {
    id: row.id,
    title: row.title || 'Untitled book',
    language,
    price: numberFrom(row.price),
    coverColor: row.cover_color || row.coverColor || visuals.color,
    coverUrl: row.cover_url || row.coverUrl || null,
    status: row.status || 'available',
    description: row.description || '',
    fileName: row.file_name || row.fileName || '',
    fileUrl: row.file_url || row.fileUrl || null,
    createdAt: row.created_at || row.createdAt || null,
  }
}

export const getCourseByIdFrom = (courses, id) =>
  courses.find(course => String(course.id) === String(id))
