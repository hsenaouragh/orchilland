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
    <div className='bg-white rounded-2xl border border-gray-100 px-4 py-3 flex flex-wrap items-center gap-3 max-w-6xl mx-auto'>
      {filters.map(({ label, key, options }) => (
        <div key={key} className='relative'>
          <button
            onClick={() => setOpen(open === key ? null : key)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm border transition-all duration-200 ${
              selected[key]
                ? 'bg-[#1D9E75] text-white border-[#1D9E75]'
                : 'text-gray-500 border-gray-200 hover:border-[#1D9E75] hover:text-[#1D9E75]'
            }`}
          >
            {selected[key] ?? label}
            <span className={`text-[10px] transition-transform duration-200 ${open === key ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {open === key && (
            <div className='absolute top-full mt-2 left-0 bg-white border border-gray-100 rounded-xl shadow-sm z-20 min-w-[160px] py-1'>
              {options.map(opt => (
                <button
                  key={opt}
                  onClick={() => toggle(key, opt)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                    selected[key] === opt
                      ? 'text-[#1D9E75] font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
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
          className='text-xs text-gray-400 hover:text-red-400 transition-colors ml-auto'
        >
          Clear all
        </button>
      )}
    </div>
  )
}

export default Filter