import { useState } from 'react'

const filters = [
  { label: 'Price',    key: 'price',    options: ['Free', 'Paid'] },
  { label: 'Language', key: 'language', options: ['English', 'French', 'Italian', 'Korean'] },
  { label: 'Type',     key: 'type',     options: ['Group courses', 'VIP courses', 'Conversation class', 'Language practice sessions'] },
]

const Filter = ({ onChange }) => {
  const [selected, setSelected] = useState({ price: null, language: null, type: null })
  const [open, setOpen] = useState(null)

  const toggle = (key, val) => {
    const next = { ...selected, [key]: selected[key] === val ? null : val }
    setSelected(next)
    setOpen(null)
    onChange?.(next)
  }

  return (
    <div className='bg-white dark:bg-[#3D2020] rounded-2xl border border-[var(--color-border)] px-4 py-3 flex flex-wrap items-center gap-3 max-w-6xl mx-auto shadow-sm'>
      {filters.map(({ label, key, options }) => (
        <div key={key} className='relative'>
          <button
            onClick={() => setOpen(open === key ? null : key)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
              selected[key]
                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm'
                : 'text-[var(--color-text-body)] border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-faint)]'
            }`}
          >
            {selected[key] ?? label}
            <span className={`text-[10px] transition-transform duration-200 ${open === key ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {open === key && (
            <div className='absolute top-full mt-2 left-0 bg-white dark:bg-[#3D2020] border border-[var(--color-border)] rounded-2xl shadow-xl z-20 min-w-[170px] py-1.5 animate-fade-in'>
              {options.map(opt => (
                <button
                  key={opt}
                  onClick={() => toggle(key, opt)}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors duration-150 ${
                    selected[key] === opt
                      ? 'text-[var(--color-primary)] dark:text-[var(--color-accent)] font-bold bg-[var(--color-accent-faint)]'
                      : 'text-[var(--color-text-body)] hover:bg-[var(--color-panel)]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {Object.values(selected).some(Boolean) && (
        <button
          onClick={() => { setSelected({ price: null, language: null, type: null }); setOpen(null); onChange?.({}) }}
          className='text-xs text-[var(--color-text-muted)] hover:text-red-500 font-semibold transition-colors ml-auto'
        >
          Clear filters
        </button>
      )}
    </div>
  )
}

export default Filter