import React from 'react'

/**
 * PlacementTestButton — reusable button for the placement-test flow.
 *
 * Props:
 *   variant  : 'primary' | 'outline' | 'ghost'   (default: 'primary')
 *   size     : 'sm' | 'md' | 'lg'                (default: 'md')
 *   color    : any valid CSS colour string        (overrides default accent)
 *   disabled : bool
 *   onClick  : fn
 *   children : node
 *   className: extra Tailwind classes
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  color,
  disabled = false,
  onClick,
  children,
  className = '',
  ...rest
}) => {
  /* ── sizes ── */
  const sizes = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  }

  /* ── variant base styles ── */
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed select-none'

  const accentColor = color || '#1D9E75'

  const variantStyles = {
    primary: {
      style: {
        background: accentColor,
        color: '#fff',
        boxShadow: `0 4px 18px ${accentColor}55`,
      },
      hoverStyle: { filter: 'brightness(1.08)', transform: 'translateY(-1px)' },
    },
    outline: {
      style: {
        background: 'transparent',
        color: accentColor,
        border: `2px solid ${accentColor}`,
      },
      hoverStyle: { background: `${accentColor}12`, transform: 'translateY(-1px)' },
    },
    ghost: {
      style: { background: 'transparent', color: accentColor },
      hoverStyle: { background: `${accentColor}10` },
    },
  }

  const [hovered, setHovered] = React.useState(false)
  const vs = variantStyles[variant] || variantStyles.primary

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${className}`}
      style={{
        ...vs.style,
        ...(hovered && !disabled ? vs.hoverStyle : {}),
        transition: 'all .25s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button