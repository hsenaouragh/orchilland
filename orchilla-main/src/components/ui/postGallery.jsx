import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from '@gravity-ui/icons'

// Instagram-style image carousel: one image at a time, swipeable on touch,
// arrows + dots + counter when there is more than one image. Safe to place
// inside a <Link> — arrow/dot clicks stop the navigation.
const PostGallery = ({ images = [], alt = '' }) => {
  const [index, setIndex] = useState(0)
  const touchX = useRef(null)

  if (!images.length) return null

  const count = images.length
  const clampedIndex = Math.min(index, count - 1)
  const multiple = count > 1

  const stop = (e) => { e.preventDefault(); e.stopPropagation() }
  const goTo = (e, i) => { stop(e); setIndex(((i % count) + count) % count) }
  const step = (e, dir) => goTo(e, clampedIndex + dir)

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (touchX.current == null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 40) setIndex(i => {
      const next = i + (dx < 0 ? 1 : -1)
      return Math.max(0, Math.min(count - 1, next))
    })
    touchX.current = null
  }

  const arrowBtn = 'absolute top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/65'

  return (
    <div
      className='relative w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] aspect-[4/3] select-none'
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className='flex h-full transition-transform duration-300 ease-out'
        style={{ transform: `translateX(-${clampedIndex * 100}%)` }}
      >
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={alt}
            draggable={false}
            className='h-full w-full flex-shrink-0 object-contain'
          />
        ))}
      </div>

      {multiple && (
        <>
          {clampedIndex > 0 && (
            <button type='button' aria-label='Previous image' onClick={(e) => step(e, -1)} className={`${arrowBtn} left-2`}>
              <ChevronLeft style={{ width: 16, height: 16 }} />
            </button>
          )}
          {clampedIndex < count - 1 && (
            <button type='button' aria-label='Next image' onClick={(e) => step(e, 1)} className={`${arrowBtn} right-2`}>
              <ChevronRight style={{ width: 16, height: 16 }} />
            </button>
          )}

          <div className='absolute right-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-white'>
            {clampedIndex + 1}/{count}
          </div>

          <div className='absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5'>
            {images.map((_, i) => (
              <button
                key={i}
                type='button'
                aria-label={`Go to image ${i + 1}`}
                onClick={(e) => goTo(e, i)}
                className='h-1.5 rounded-full transition-all duration-200'
                style={{
                  width: i === clampedIndex ? 18 : 6,
                  background: i === clampedIndex ? '#fff' : 'rgba(255,255,255,0.55)',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default PostGallery
