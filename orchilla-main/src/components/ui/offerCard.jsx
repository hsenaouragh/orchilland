import { useState } from 'react'
import { Check } from '@gravity-ui/icons'
import OfferClaimModal from './offerClaimModal'
import { useProtectedAction } from '../../hooks/AuthContext'
import { formatDinars } from '../../data/siteData'

const STATUS_LABEL = {
  pending: 'Pending review',
  approved: '✓ Approved',
  denied: 'Denied',
}

const OfferCard = ({ offer, claim, onClaimed, compact = false }) => {
  const [hovered, setHovered] = useState(false)
  const [showClaim, setShowClaim] = useState(false)
  const protect = useProtectedAction()

  const claimed = !!claim
  const claimLabel = claim ? (STATUS_LABEL[claim.status] || 'Pending review') : 'Get Offer'
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

  return (
    <>
      <div
        className={`flex flex-col justify-between rounded-3xl border bg-white dark:bg-[#3D2020] transition-all duration-300 ${
          compact ? 'p-4' : 'p-6'
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
          {/* Top Badge */}
          <div className='flex items-center justify-between gap-2 mb-3'>
            <span
              className='text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full'
              style={{
                background: discountPct >= 50 ? '#FEE2E2' : discountPct >= 40 ? '#EDE9FE' : '#DCFCE7',
                color: discountPct >= 50 ? '#DC2626' : discountPct >= 40 ? '#7C3AED' : '#16A34A',
              }}
            >
              {badgeText}
            </span>
            {offer.discountPercent > 0 && !badgeText.includes('%') && (
              <span className='text-xs font-bold text-emerald-600'>-{offer.discountPercent}%</span>
            )}
          </div>

          {/* Title & Description */}
          <div className='mb-3'>
            <h3 className='text-base font-bold text-[var(--color-text)] mb-1 leading-snug'>
              {offer.title}
            </h3>
            {offer.description && (
              <p className='text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed'>
                {offer.description}
              </p>
            )}
          </div>

          {/* Included Courses */}
          {offer.courses && offer.courses.length > 0 && (
            <div className='space-y-1.5 mb-4 p-2.5 rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)]'>
              <p className='text-[10.5px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1'>
                Included courses:
              </p>
              {offer.courses.map(c => (
                <div key={c.id} className='flex items-center gap-1.5'>
                  <Check style={{ width: 13, height: 13, color: '#1D9E75', shrink: 0 }} />
                  <span className='text-xs font-medium text-[var(--color-text-body)] truncate'>
                    {c.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className='pt-3 border-t border-[var(--color-border)] mt-2'>
          <div className='flex items-baseline justify-between mb-3'>
            <div>
              {offer.originalPrice > offer.price && (
                <p className='text-[11px] text-[var(--color-text-faint)] line-through'>
                  {formatDinars(offer.originalPrice)}
                </p>
              )}
              <p className='text-base font-extrabold text-[var(--color-text)]'>
                {formatDinars(offer.price)}
              </p>
            </div>
          </div>

          <button
            onClick={canClaim ? protect(() => setShowClaim(true)) : undefined}
            disabled={!canClaim && claim?.status !== 'denied'}
            className='w-full py-2.5 rounded-full text-xs font-bold text-white transition-all duration-200'
            style={{
              backgroundColor: canClaim ? 'var(--color-primary)' : 'var(--color-panel)',
              color: canClaim ? '#FFFFFF' : 'var(--color-text-muted)',
              boxShadow: canClaim ? '0 2px 10px rgba(78, 0, 0, 0.2)' : 'none',
              cursor: canClaim ? 'pointer' : 'default',
            }}
            onMouseEnter={e => {
              if (canClaim) e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'
            }}
            onMouseLeave={e => {
              if (canClaim) e.currentTarget.style.backgroundColor = 'var(--color-primary)'
            }}
          >
            {canClaim && claim?.status === 'denied' ? 'Re-claim' : claimLabel}
          </button>
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
