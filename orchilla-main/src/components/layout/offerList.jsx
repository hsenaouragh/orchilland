import { useMemo } from 'react'
import OfferCard from '../ui/offerCard'
import { useAuth } from '../../hooks/AuthContext'
import { useQuery } from '../../hooks/useQuery'
import { fetchOffers, fetchOfferClaims } from '../../services/db'

const FALLBACK_OFFERS = [
  {
    id: 'bundle-summer',
    title: 'Summer Bundle',
    description: 'Master our three most popular European languages.',
    categoryLabel: 'HOT DEAL -50%',
    price: 12000,
    originalPrice: 24000,
    discountPercent: 50,
    status: 'active',
    courses: [
      { id: 'c1', title: 'English Masterclass' },
      { id: 'c2', title: 'French for Travel' },
      { id: 'c3', title: 'Italian Fluency' },
    ],
  },
  {
    id: 'bundle-pro',
    title: 'Language Pro Pack',
    description: 'All 4 languages with full conversational drills and materials.',
    categoryLabel: 'BEST VALUE -40%',
    price: 18000,
    originalPrice: 30000,
    discountPercent: 40,
    status: 'active',
    courses: [
      { id: 'c4', title: 'Complete English Track' },
      { id: 'c5', title: 'French & Italian Bundle' },
      { id: 'c6', title: 'Korean Hangul & Beyond' },
    ],
  },
  {
    id: 'bundle-korean',
    title: 'Korean Essentials',
    description: 'From Hangul alphabet to everyday K-drama conversations.',
    categoryLabel: 'POPULAR -30%',
    price: 8400,
    originalPrice: 12000,
    discountPercent: 30,
    status: 'active',
    courses: [
      { id: 'c7', title: 'Korean Beginner A1' },
      { id: 'c8', title: 'Intermediate Speaking' },
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
