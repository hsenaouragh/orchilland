import OfferList from '../components/layout/offerList'
import ParisLandmark from '../assets/paris_landmark.jpg'
import CtaGlobeBooks from '../assets/cta_globe_books.jpg'

const Offers = () => {
  return (
    <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10'>
      {/* ── 1. HERO BANNER ────────────────────────────────────────── */}
      <section className='relative rounded-[32px] overflow-hidden border border-[var(--color-border)] shadow-sm bg-gradient-to-r from-[#FFF0EE] via-[#FFF8F5] to-[#FBE8E8] dark:from-[#3D2020] dark:via-[#341A1A] dark:to-[#2A1515] p-6 sm:p-10 lg:p-12 transition-colors'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-center'>
          {/* Left Hero Text */}
          <div className='lg:col-span-7 space-y-4 text-left'>
            <span className='inline-block text-[11px] font-extrabold uppercase tracking-widest text-[var(--color-accent)]'>
              Special Bundles
            </span>

            <h1 className='font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-[var(--color-text)] tracking-tight leading-tight'>
              Limited-Time <br />
              Course Offers
            </h1>

            <p className='text-xs sm:text-sm text-[var(--color-text-body)] leading-relaxed max-w-lg'>
              Get multi-course bundles at discounted rates. Claim a bundle, upload your payment receipt, and unlock full course access.
            </p>
          </div>

          {/* Right Hero Visual: Stack of Books Artwork */}
          <div className='lg:col-span-5 relative flex flex-col items-center lg:items-end justify-center'>
            {/* Handwritten note */}
            <div className='font-handwritten text-xl sm:text-2xl text-[var(--color-accent)] mb-2 rotate-[-4deg] select-none text-center lg:text-right w-full pr-4'>
              Learn More <br />
              Save More ♡
            </div>

            <div className='relative w-full max-w-sm rounded-3xl overflow-hidden shadow-xl border border-white/50 dark:border-white/10 aspect-[16/10] bg-[var(--color-panel)]'>
              <img
                src={ParisLandmark}
                alt='Special course offers'
                className='w-full h-full object-cover'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent' />
              <div className='absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-bold'>
                <span>All-Inclusive Bundles</span>
                <span className='px-2.5 py-0.5 rounded-full bg-white/30 backdrop-blur-sm text-[10px] uppercase tracking-wider'>
                  Up to 50% Off
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. OFFERS LIST ─────────────────────────────────────────── */}
      <OfferList showHeading={false} />
    </main>
  )
}

export default Offers

