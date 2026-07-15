import OfferCard from '../ui/offerCard'
import { useAuth } from '../../hooks/AuthContext'
import { useQuery } from '../../hooks/useQuery'
import { fetchOffers, fetchOfferClaims } from '../../services/db'

const SectionPill = ({ text, color }) => (
  <span className='text-xs font-bold px-3 py-1 rounded-full' style={{ background: `${color}15`, color }}>
    {text}
  </span>
)

const OfferList = ({ limit, showHeading = true }) => {
  const { user } = useAuth()
  const { data, reload } = useQuery(async () => {
    const [offers, claims] = await Promise.all([fetchOffers(), fetchOfferClaims(user)])
    return { offers, claims }
  }, [user?.id], { offers: [], claims: [] })

  const available = data.offers.filter(o => o.status === 'active')
  const displayed = limit ? available.slice(0, limit) : available
  const claimByOffer = new Map(data.claims.map(c => [String(c.offerId), c]))

  if (displayed.length === 0) return null

  return (
    <div id="offers">
      {showHeading && (
        <div className='mb-10'>
          <div className='flex flex-wrap items-center gap-3 mb-2'>
            <p className='text-xs uppercase tracking-widest font-semibold text-[var(--color-text-body)]'>Limited Time</p>
            <SectionPill text='🔥 Hot deals' color='#EF4444' />
            <SectionPill text='⭐ Best value' color='#6366F1' />
          </div>
          <h2 className='text-3xl font-extrabold text-[var(--color-text)] mb-2'>Special Offers</h2>
          <p className='text-[var(--color-text-muted)] text-sm max-w-lg'>
            Course bundles at a discount. Claim one, upload your receipt, and the admin unlocks all its courses.
          </p>
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
        {displayed.map(offer => (
          <OfferCard
            key={offer.id}
            offer={offer}
            claim={claimByOffer.get(String(offer.id))}
            onClaimed={reload}
          />
        ))}
      </div>
    </div>
  )
}

export default OfferList
