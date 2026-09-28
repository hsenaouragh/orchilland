import { useMemo } from 'react'
import OfferCard from '../ui/offerCard'
import { useAuth } from '../../hooks/AuthContext'
import { useQuery } from '../../hooks/useQuery'
import { fetchOffers, fetchOfferClaims } from '../../services/db'

import ParisLandmark from '../../assets/paris_landmark.jpg'
import RomeLandmark from '../../assets/rome_landmark.jpg'
import LondonLandmark from '../../assets/london_landmark.jpg'
import SeoulLandmark from '../../assets/seoul_landmark.jpg'

const FALLBACK_OFFERS = [
  {
    id: 'bundle-french-essentials',
    title: 'French Essentials Bundle',
    language: 'French',
    landmark: ParisLandmark,
    description: 'Master the fundamentals of French with 3 beginner courses. Perfect for new learners.',
    categoryLabel: 'BEST VALUE -40%',
    price: 2999,
    originalPrice: 4999,
    discountPercent: 40,
    status: 'active',
    courses: [
      { id: 'fe1', title: 'French A1 - Basics' },
      { id: 'fe2', title: 'Everyday Conversations' },
      { id: 'fe3', title: 'Grammar Fundamentals' },
    ],
  },
  {
    id: 'bundle-italian-starter',
    title: 'Italian Starter Pack',
    language: 'Italian',
    landmark: RomeLandmark,
    description: 'Learn Italian from scratch with 3 engaging courses. Build your confidence step by step.',
    categoryLabel: 'POPULAR -30%',
    price: 3149,
    originalPrice: 4499,
    discountPercent: 30,
    status: 'active',
    courses: [
      { id: 'it1', title: 'Italian A1 - Basics' },
      { id: 'it2', title: 'Practical Dialogues' },
      { id: 'it3', title: 'Grammar & Vocabulary' },
    ],
  },
  {
    id: 'bundle-spanish-complete',
    title: 'Spanish Complete Bundle',
    language: 'Spanish',
    landmark: RomeLandmark,
    description: 'Get 4 courses and start speaking Spanish with confidence. Ideal for travel, work or study.',
    categoryLabel: 'HOT DEAL -50%',
    price: 2999,
    originalPrice: 5999,
    discountPercent: 50,
    status: 'active',
    courses: [
      { id: 'sp1', title: 'Spanish A1 - Basics' },
      { id: 'sp2', title: 'Conversational Spanish' },
      { id: 'sp3', title: 'Grammar & Vocabulary' },
      { id: 'sp4', title: 'Culture & Travel' },
    ],
  },
  {
    id: 'bundle-english-life',
    title: 'English for Everyday Life',
    language: 'English',
    landmark: LondonLandmark,
    description: 'Improve your speaking, listening and grammar with 4 complete courses.',
    categoryLabel: 'POPULAR -35%',
    price: 3574,
    originalPrice: 5499,
    discountPercent: 35,
    status: 'active',
    courses: [
      { id: 'en1', title: 'English A1 - Basics' },
      { id: 'en2', title: 'Speaking & Listening' },
      { id: 'en3', title: 'Grammar Essentials' },
      { id: 'en4', title: 'Real Life Conversations' },
    ],
  },
  {
    id: 'bundle-german-beginner',
    title: 'German Beginner Bundle',
    language: 'German',
    landmark: LondonLandmark,
    description: 'Start your German journey with 3 structured courses. Learn at your own pace.',
    categoryLabel: 'SPECIAL -30%',
    price: 3149,
    originalPrice: 5499,
    discountPercent: 30,
    status: 'active',
    courses: [
      { id: 'ge1', title: 'German A1 - Basics' },
      { id: 'ge2', title: 'Everyday Communication' },
      { id: 'ge3', title: 'Grammar & Vocabulary' },
    ],
  },
  {
    id: 'bundle-french-advanced',
    title: 'French Advanced Bundle',
    language: 'French',
    landmark: ParisLandmark,
    description: 'Take your French to the next level with 4 advanced courses. Perfect for confident learners.',
    categoryLabel: '-25%',
    price: 5249,
    originalPrice: 6999,
    discountPercent: 25,
    status: 'active',
    courses: [
      { id: 'fa1', title: 'French B1 - Intermediate' },
      { id: 'fa2', title: 'Advanced Grammar' },
      { id: 'fa3', title: 'Business French' },
      { id: 'fa4', title: 'Culture & Society' },
    ],
  },
]

const OfferList = ({ limit, showHeading = true, compact = false }) => {
  const { user } = useAuth()
  const { data, reload } = useQuery(async () => {
    const [offers, claims] = await Promise.all([fetchOffers(), fetchOfferClaims(user)])
    return { offers, claims }
  }, [user?.id], { offers: [], claims: [] })

  const available = useMemo(() => {
    const list = data.offers.filter(o => o.status === 'active')
    return list.length > 0 ? list : FALLBACK_OFFERS
  }, [data.offers])

  const displayed = limit ? available.slice(0, limit) : available
  const claimByOffer = new Map(data.claims.map(c => [String(c.offerId), c]))

  return (
    <div id="offers">
      {showHeading && (
        <div className='mb-8'>
          <div className='flex items-center gap-2 mb-2'>
            <span className='text-xs uppercase tracking-widest font-bold text-[var(--color-accent)]'>
              Special Offers
            </span>
          </div>
          <h2 className='text-3xl font-extrabold text-[var(--color-text)] mb-2'>
            Learn More for Less
          </h2>
          <p className='text-[var(--color-text-muted)] text-sm max-w-lg'>
            Take advantage of our limited-time deals and special bundles. Claim an offer, upload your receipt, and start learning.
          </p>
        </div>
      )}

      <div className={`grid gap-5 ${
        compact
          ? 'grid-cols-1'
          : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
      }`}>
        {displayed.map(offer => (
          <OfferCard
            key={offer.id}
            offer={offer}
            compact={compact}
            claim={claimByOffer.get(String(offer.id))}
            onClaimed={reload}
          />
        ))}
      </div>
    </div>
  )
}

export default OfferList
