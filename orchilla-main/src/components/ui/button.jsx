import React from 'react'
import { Link } from 'react-router-dom'

/**
 * Modern, production-grade Button component for OrchillaLand.
 *
 * Props:
 *   as        : 'button' | 'a' | Link | ReactComponent
 *   to        : string (route path; automatically renders as Link)
 *   href      : string (url; automatically renders as a)
 *   variant   : 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' (default: 'primary')
 *   size      : 'sm' | 'md' | 'lg' | 'icon' (default: 'md')
 *   color     : any valid CSS colour override
 *   fullWidth : boolean
 *   disabled  : boolean
 *   onClick   : function
 *   children  : React node
 *   className : extra classes
 */
const Button = ({
  as,
  to,
  href,
  variant = 'primary',
  size = 'md',
  color,
  fullWidth = false,
  disabled = false,
  onClick,
  children,
  className = '',
  style = {},
  ...rest
}) => {
  const [hovered, setHovered] = React.useState(false)

  // Determine underlying element
  const Component = as || (to ? Link : href ? 'a' : 'button')

  /* ── sizes ── */
  const sizes = {
    sm: 'px-4 py-1.5 text-xs font-semibold gap-1.5',
    md: 'px-6 py-2.5 text-xs sm:text-sm font-bold gap-2',
    lg: 'px-8 py-3.5 text-sm sm:text-base font-bold gap-2.5',
    icon: 'p-2 text-sm',
  }

  const baseStyles =
    'inline-flex items-center justify-center rounded-full transition-all duration-200 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none'

  // Variant styling
  const primaryBg = color || 'var(--color-primary)'

  const variantStyles = {
    primary: {
      style: {
        backgroundColor: primaryBg,
        color: '#FFFFFF',
        boxShadow: hovered && !disabled ? '0 6px 20px rgba(78, 0, 0, 0.28)' : '0 2px 10px rgba(78, 0, 0, 0.16)',
        transform: hovered && !disabled ? 'translateY(-1px)' : 'translateY(0)',
      },
    },
    secondary: {
      style: {
        backgroundColor: 'var(--color-primary-soft)',
        color: 'var(--color-primary)',
        border: '1px solid rgba(78, 0, 0, 0.08)',
        transform: hovered && !disabled ? 'translateY(-1px)' : 'translateY(0)',
      },
    },
    outline: {
      style: {
        backgroundColor: hovered && !disabled ? 'var(--color-accent-faint)' : 'transparent',
        color: color || 'var(--color-primary)',
        border: `1.5px solid ${color || 'var(--color-primary)'}`,
        transform: hovered && !disabled ? 'translateY(-1px)' : 'translateY(0)',
      },
    },
    ghost: {
      style: {
        backgroundColor: hovered && !disabled ? 'var(--color-accent-faint)' : 'transparent',
        color: color || 'var(--color-text-body)',
      },
    },
    accent: {
      style: {
        backgroundColor: 'var(--color-accent)',
        color: '#FFFFFF',
        boxShadow: hovered && !disabled ? '0 6px 18px rgba(209, 124, 124, 0.35)' : '0 2px 8px rgba(209, 124, 124, 0.2)',
        transform: hovered && !disabled ? 'translateY(-1px)' : 'translateY(0)',
      },
    },
  }

  const currentVariant = variantStyles[variant] || variantStyles.primary

  const combinedStyle = {
    ...currentVariant.style,
    ...style,
  }

  const props = {
    to,
    href,
    disabled: Component === 'button' ? disabled : undefined,
    'aria-disabled': disabled ? true : undefined,
    onClick: disabled ? undefined : onClick,
    className: `${baseStyles} ${sizes[size] || sizes.md} ${fullWidth ? 'w-full' : ''} ${className}`,
    style: combinedStyle,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    ...rest,
  }

  return <Component {...props}>{children}</Component>
}

export default Button