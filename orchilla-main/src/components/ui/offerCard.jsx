import { useState } from 'react'
import { Check } from '@gravity-ui/icons'
import Button from './button'
import OfferClaimModal from './offerClaimModal'
import { useProtectedAction } from '../../hooks/AuthContext'
import { formatDinars, LANDMARK_IMAGES } from '../../data/siteData'
import ParisLandmark from '../../assets/paris_landmark.jpg'
import RomeLandmark from '../../assets/rome_landmark.jpg'
import LondonLandmark from '../../assets/london_landmark.jpg'

const STATUS_LABEL = {
  pending: 'Pending review',
  approved: '✓ Claimed',
  denied: 'Denied',
}

const OfferCard = ({ offer, claim, onClaimed, compact = false }) => {
  const [hovered, setHovered] = useState(false)
  const [showClaim, setShowClaim] = useState(false)
  const protect = useProtectedAction()

  const claimed = !!claim
  const isApproved = claim?.status === 'approved' || claim?.status === 'pending'
  const canClaim = !claimed || claim.status === 'denied'

  // Discount badge calculation
  const discountPct = offer.discountPercent || (
    offer.originalPrice > offer.price
      ? Math.round(((offer.originalPrice - offer.price) / offer.originalPrice) * 100)
      : 30
  )

  const badgeText = offer.categoryLabel || (
    discountPct >= 50 ? `HOT DEAL -${discountPct}%` :
    discountPct >= 40 ? `BEST VALUE -${discountPct}%` :
    `POPULAR -${discountPct}%`
  )

  const landmarkImg = offer.landmark || (offer.language && LANDMARK_IMAGES[offer.language]) || ParisLandmark

  return (
    <>
      <div
        className={`group flex flex-col justify-between rounded-3xl border bg-white dark:bg-[#3D2020] transition-all duration-300 ${
          compact ? 'p-4' : 'p-5 sm:p-6'
        }`}
        style={{
          borderColor: hovered ? 'var(--color-accent)' : 'var(--color-border)',
          boxShadow: hovered ? '0 12px 32px rgba(78, 0, 0, 0.10)' : '0 2px 10px rgba(78, 0, 0, 0.04)',
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div>
          {/* Top Row: Thumbnail Landmark on Left + Details on Right */}
          <div className='flex gap-3.5 sm:gap-4 items-start mb-3'>
            {/* Thumbnail Landmark with Discount Badge Overlay */}
            <div className='relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-black/10 bg-[var(--color-panel)]'>
              <img
                src={landmarkImg}
                alt={offer.title}
                className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent' />

              {/* Overlay Badge */}
              <div className='absolute top-2 left-2'>
                <span
                  className='text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm'
                  style={{
                    background: discountPct >= 50 ? '#FEE2E2' : discountPct >= 40 ? '#EDE9FE' : '#DCFCE7',
                    color: discountPct >= 50 ? '#DC2626' : discountPct >= 40 ? '#7C3AED' : '#16A34A',
                  }}
                >
                  {badgeText}
                </span>
              </div>
            </div>

            {/* Right Details */}
            <div className='flex-1 min-w-0 space-y-1'>
              <p className='text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-accent)]'>
                Language • {offer.language || 'Language Track'}
              </p>
              <h3 className='font-heading text-base sm:text-lg font-bold text-[var(--color-text)] leading-snug group-hover:text-[var(--color-primary)] dark:group-hover:text-[var(--color-accent)] transition-colors'>
                {offer.title}
              </h3>
              {offer.description && (
                <p className='text-xs text-[var(--color-text-body)] line-clamp-2 leading-relaxed'>
                  {offer.description}
                </p>
              )}
            </div>
          </div>

          {/* Included Courses Panel */}
          {offer.courses && offer.courses.length > 0 && (
            <div className='space-y-1.5 mb-4 p-3 rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)]/60'>
              <p className='text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-text-muted)]'>
                Includes {offer.courses.length} courses
              </p>
              <div className='space-y-1'>
                {offer.courses.map((c, i) => (
                  <div key={c.id || i} className='flex items-center gap-1.5'>
                    <Check style={{ width: 12, height: 12, color: 'var(--color-primary)', shrink: 0 }} />
                    <span className='text-[11.5px] font-medium text-[var(--color-text-body)] truncate'>
                      {typeof c === 'string' ? c : c.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pricing & Action */}
        <div className='pt-3 border-t border-[var(--color-border)]/60 mt-1 flex items-end justify-between gap-3'>
          <div>
            {offer.originalPrice > offer.price && (
              <p className='text-[11px] text-[var(--color-text-faint)] line-through font-medium'>
                {formatDinars(offer.originalPrice)}
              </p>
            )}
            <p className='font-heading text-lg sm:text-xl font-black text-[var(--color-text)]'>
              {formatDinars(offer.price)}
            </p>
          </div>

          {claimed && !canClaim ? (
            <span className='inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold bg-[#FBE8E8] dark:bg-[#451E1E] text-[var(--color-primary)] dark:text-[#F8C8C8] border border-[var(--color-border)]'>
              {isApproved ? '✓ Claimed' : 'Pending Review'}
            </span>
          ) : (
            <Button
              size='sm'
              onClick={protect(() => setShowClaim(true))}
            >
              {claimed && claim?.status === 'denied' ? 'Re-claim →' : 'Claim Bundle →'}
            </Button>
          )}
        </div>
      </div>

      {showClaim && (
        <OfferClaimModal
          offer={offer}
          onClose={() => setShowClaim(false)}
          onClaimed={onClaimed}
        />
      )}
    </>
  )
}

export default OfferCard
