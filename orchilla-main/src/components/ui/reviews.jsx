import { useState, useEffect, useRef, useMemo } from 'react'
import { useQuery } from '../../hooks/useQuery'
import { fetchCourseReviews, fetchCourses, getCourseByIdFrom } from '../../services/db'

const FALLBACK_COLOR = '#E85D26'

// Shown when there are no published reviews in the database (or the fetch failed),
// so the section never renders empty.
const STATIC_REVIEWS = [
  { lang: 'French', color: '#E85D26', reviews: [
    { id: 'fr-1', rating: 5, name: 'Camille R.', text: 'I went from zero to holding full conversations in 4 months. The structure is incredible.' },
    { id: 'fr-2', rating: 5, name: 'Marcus T.', text: 'The tutors actually care. My accent improved faster than I expected.' },
    { id: 'fr-3', rating: 5, name: 'Sofia L.', text: 'Best investment I made this year. French was always a dream and now it\'s real.' },
  ]},
  { lang: 'English', color: '#378ADD', reviews: [
    { id: 'en-1', rating: 5, name: 'Yuna K.', text: 'My confidence speaking English at work has completely changed. I got a promotion.' },
    { id: 'en-2', rating: 5, name: 'Omar B.', text: 'The placement test put me in exactly the right level. No wasted time.' },
    { id: 'en-3', rating: 5, name: 'Priya M.', text: 'I passed my IELTS on the first try after 3 months here. Couldn\'t believe it.' },
  ]},
  { lang: 'Italian', color: '#D4537E', reviews: [
    { id: 'it-1', rating: 5, name: 'James W.', text: 'I moved to Milan and could actually talk to my neighbors by week 6. Magical.' },
    { id: 'it-2', rating: 5, name: 'Aisha D.', text: 'The courses are so well paced. I never felt overwhelmed or bored.' },
    { id: 'it-3', rating: 5, name: 'Léa F.', text: 'Italian grammar finally clicked. The explanations here are just better.' },
  ]},
  { lang: 'Korean', color: '#1D9E75', reviews: [
    { id: 'ko-1', rating: 5, name: 'Tom H.', text: 'I can read Hangul and watch K-dramas without subtitles now. Worth every minute.' },
    { id: 'ko-2', rating: 5, name: 'Nina S.', text: 'The spaced repetition system is smart. Vocab stuck in ways Duolingo never achieved.' },
    { id: 'ko-3', rating: 5, name: 'Carlos M.', text: 'Korean seemed impossible. Three months later I\'m having real conversations online.' },
  ]},
]

// Group published course_reviews by the language of the course they belong to,
// so the carousel can page through languages the way it did with mock data.
const buildGroups = (reviews, getCourseById) => {
  const byLanguage = new Map()

  reviews
    .filter(review => review.isPublished && review.comment)
    .forEach(review => {
      const course = getCourseById(review.courseId)
      const lang = course?.language || 'Courses'
      const color = course?.color || FALLBACK_COLOR
      if (!byLanguage.has(lang)) byLanguage.set(lang, { lang, color, reviews: [] })
      byLanguage.get(lang).reviews.push({
        id: review.id,
        name: review.studentName || 'Student',
        text: review.comment,
        rating: Math.max(1, Math.min(5, Math.round(review.rating || 5))),
      })
    })

  // Show at most three reviews per language slide.
  return Array.from(byLanguage.values()).map(group => ({
    ...group,
    reviews: group.reviews.slice(0, 3),
  }))
}

const Reviews = () => {
  const { data: fetched } = useQuery(async () => {
    const [courseReviews, courses] = await Promise.all([fetchCourseReviews(), fetchCourses()])
    return { courseReviews, courses }
  }, [], { courseReviews: [], courses: [] })
  const [cur, setCur] = useState(0)
  const [key, setKey] = useState(0)
  const paused = useRef(false)

  const data = useMemo(() => {
    const getCourseById = (id) => getCourseByIdFrom(fetched.courses, id)
    const groups = buildGroups(fetched.courseReviews, getCourseById)
    // Fall back to static testimonials when nothing was fetched.
    return groups.length > 0 ? groups : STATIC_REVIEWS
  }, [fetched])

  useEffect(() => {
    if (data.length <= 1) return
    const t = setInterval(() => {
      if (!paused.current) {
        setCur(p => (p + 1) % data.length)
        setKey(k => k + 1)
      }
    }, 4000)
    return () => clearInterval(t)
  }, [data.length])

  const go = (i) => { setCur(i); setKey(k => k + 1) }
  const { lang, color, reviews } = data[Math.min(cur, data.length - 1)]

  return (
    <div className='py-16 px-4 text-center bg-white rounded-3xl'>
        <div className='py-16 px-4 text-center'>
        <p className='text-xs uppercase tracking-widest text-gray-400 mb-2'>What our students say</p>
        <h2 className='text-2xl font-semibold text-gray-900 mb-10'>Real results, real people</h2>

        <p className='text-xs uppercase tracking-widest font-medium mb-4 transition-colors duration-300'
            style={{ color }}>
            {lang}
        </p>

        <div
            key={key}
            className='grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto'
            onMouseEnter={() => paused.current = true}
            onMouseLeave={() => paused.current = false}
        >
            {reviews.map((r, i) => (
            <div
                key={r.id}
                className='rounded-xl p-5 text-left animate-fade-up'
                style={{
                border: `1.5px solid ${color}30`,
                backgroundColor: `${color}18`,
                animationDelay: `${i * 120}ms`,
                animationFillMode: 'both',
                }}
            >
                <p className='text-xs mb-2' style={{ color }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>
                <p className='text-sm text-gray-500 leading-relaxed'>"{r.text}"</p>
                <p className='text-sm font-medium text-gray-700 mt-3'>— {r.name}</p>
            </div>
            ))}
        </div>

        {data.length > 1 && (
          <div className='flex justify-center gap-2 mt-6'>
              {data.map((d, i) => (
              <button
                  key={d.lang}
                  onClick={() => go(i)}
                  className='h-1.5 rounded-full transition-all duration-300'
                  style={{ width: cur === i ? '16px' : '6px', background: cur === i ? d.color : '#D1D5DB' }}
              />
              ))}
          </div>
        )}

        </div>
    </div>
  )
}

export default Reviews
