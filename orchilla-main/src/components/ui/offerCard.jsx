import { useState } from 'react'
import { Check } from '@gravity-ui/icons'
import Button from './button'
import OfferClaimModal from './offerClaimModal'
import { useProtectedAction } from '../../hooks/AuthContext'
import { formatDinars } from '../../data/siteData'

const STATUS_LABEL = {
  pending: 'Pending review',
  approved: '✓ Approved',
  denied: 'Denied',
}

const OfferCard = ({ offer, claim, onClaimed }) => {
  const [hovered, setHovered] = useState(false)
  const [showClaim, setShowClaim] = useState(false)
  const protect = useProtectedAction()

  const claimed = !!claim
  const claimLabel = claim ? (STATUS_LABEL[claim.status] || 'Pending review') : 'Claim'
  const canClaim = !claimed || claim.status === 'denied'

  return (
    <>
      <div
        className='rounded-2xl border bg-white dark:bg-slate-900 p-6 flex flex-col justify-between transition-all duration-300'
        style={{
          borderColor: hovered ? offer.color : 'var(--color-border)',
          boxShadow: hovered ? `0 12px 32px ${offer.color}20` : '0 2px 10px rgba(0,0,0,0.04)',
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* category + discount */}
        <div className='flex items-start justify-between mb-4'>
          <span className='text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide' style={{ background: `${offer.color}12`, color: offer.color }}>
            {offer.categoryLabel}
          </span>
          {offer.discountPercent > 0 && (
            <span className='text-xs font-bold text-green-600'>-{offer.discountPercent}%</span>
          )}
        </div>

        {/* title + description */}
        <div className='mb-3'>
          <h3 className='text-[var(--color-text)] font-semibold text-base mb-1'>{offer.title}</h3>
          {offer.description && <p className='text-[var(--color-text-muted)] text-sm'>{offer.description}</p>}
        </div>

        {/* courses included */}
        {offer.courses.length > 0 && (
          <div className='space-y-2 mb-5'>
            {offer.courses.map(c => (
              <div key={c.id} className='flex items-start gap-2'>
                <Check style={{ width: 16, height: 16, color: '#10B981', marginTop: 2, flexShrink: 0 }} />
                <p className='text-sm text-[var(--color-text-body)] leading-tight'>{c.title}</p>
              </div>
            ))}
          </div>
        )}

        {/* pricing + CTA */}
        <div className='border-t border-[var(--color-border)] pt-4 flex items-end justify-between'>
          <div>
            {offer.originalPrice > offer.price && (
              <p className='text-[var(--color-text-faint)] text-xs line-through'>{formatDinars(offer.originalPrice)}</p>
            )}
            <p className='text-lg font-bold text-[var(--color-text)]'>{formatDinars(offer.price)}</p>
          </div>

          <Button
            onClick={canClaim ? protect(() => setShowClaim(true)) : undefined}
            className='px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200'
            style={{
              background: canClaim ? offer.color : '#F3F4F6',
              color: canClaim ? '#fff' : '#6B7280',
              cursor: canClaim ? 'pointer' : 'default',
            }}
          >
            {canClaim && claim?.status === 'denied' ? 'Re-claim' : claimLabel}
          </Button>
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
