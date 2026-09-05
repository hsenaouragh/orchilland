import OfferList from '../components/layout/offerList'

const Offers = () => {
  return (
    <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      {/* Page header banner */}
      <div className='mb-12 p-8 md:p-10 rounded-3xl bg-[var(--color-panel)] border border-[var(--color-border)]'>
        <span className='text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]'>
          Special Bundles
        </span>
        <h1 className='text-3xl sm:text-4xl font-extrabold text-[var(--color-text)] mt-1.5'>
          Limited-Time Course Offers
        </h1>
        <p className='text-sm text-[var(--color-text-muted)] mt-2 max-w-2xl leading-relaxed'>
          Get multi-course bundles at discounted rates. Claim a bundle, upload your payment receipt, and unlock full course access.
        </p>
      </div>

      <OfferList showHeading={false} />
    </main>
  )
}

export default Offers
