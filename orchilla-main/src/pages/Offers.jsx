import OfferList from '../components/layout/offerList'

const Offers = () => {
  return (
    <main className='max-w-6xl mx-auto px-4 py-16'>
      <div className='mb-10'>
        <p className='text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-2'>Special offers</p>
        <h1 className='text-3xl font-bold text-[var(--color-text)]'>Course bundles & deals</h1>
        <p className='text-gray-400 text-sm mt-2'>Claim a bundle, upload your receipt, and the admin unlocks all its courses.</p>
      </div>

      <OfferList showHeading={false} />
    </main>
  )
}

export default Offers
