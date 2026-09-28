import React from 'react'
import { Link } from 'react-router-dom'
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa'
import { Globe } from '@gravity-ui/icons'
import logo from '../../assets/orchillaland.png'

const Footer = () => {
  return (
    <footer
      className='mt-20 text-white rounded-t-[40px] pt-16 pb-10 px-6 sm:px-12'
      style={{ backgroundColor: 'var(--color-footer-bg)' }}
    >
      <div className='max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 pb-14 border-b border-white/10'>
        {/* ── Column 1: Brand & Mission ── */}
        <div className='md:col-span-6 lg:col-span-5 space-y-5'>
          <Link to='/' className='inline-block'>
            <div className='flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full w-fit backdrop-blur-sm'>
              <img src={logo} alt='OrchillaLand' className='h-8 w-auto brightness-200 contrast-200' />
            </div>
          </Link>
          <p className='text-sm text-white/70 max-w-sm leading-relaxed'>
            Languages for a bigger tomorrow. Learn with confidence through adaptive lessons, native speaker practice, and verified certifications.
          </p>

          {/* Social Icons */}
          <div className='flex items-center gap-3 pt-2'>
            {[
              { icon: FaFacebookF, href: '#facebook', label: 'Facebook' },
              { icon: FaTwitter, href: '#twitter', label: 'Twitter' },
              { icon: FaInstagram, href: '#instagram', label: 'Instagram' },
              { icon: FaLinkedinIn, href: '#linkedin', label: 'LinkedIn' },
              { icon: FaYoutube, href: '#youtube', label: 'YouTube' },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className='w-9 h-9 rounded-full bg-white/10 hover:bg-[var(--color-accent)] text-white/80 hover:text-white flex items-center justify-center transition-all duration-200'
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* ── Column 2: Platform ── */}
        <div className='md:col-span-3 lg:col-span-3 space-y-4'>
          <h4 className='text-sm font-bold tracking-wider uppercase text-white/90'>
            Platform
          </h4>
          <ul className='space-y-2.5 text-xs text-white/70'>
            <li><Link to='/courses' className='hover:text-white transition-colors'>Courses</Link></li>
            <li><Link to='/offers' className='hover:text-white transition-colors'>Offers</Link></li>
            <li><Link to='/placement-test' className='hover:text-white transition-colors'>Placement Tests</Link></li>
            <li><a href='/#reviews' className='hover:text-white transition-colors'>Reviews</a></li>
            <li><a href='/#why-choose' className='hover:text-white transition-colors'>About</a></li>
            <li><Link to='/books' className='hover:text-white transition-colors'>Books</Link></li>
            <li><Link to='/posts' className='hover:text-white transition-colors'>Community Posts</Link></li>
          </ul>
        </div>

        {/* ── Column 3: Support ── */}
        <div className='md:col-span-3 lg:col-span-4 space-y-4'>
          <h4 className='text-sm font-bold tracking-wider uppercase text-white/90'>
            Support
          </h4>
          <ul className='space-y-2.5 text-xs text-white/70'>
            <li><a href='#help' className='hover:text-white transition-colors'>Help Center</a></li>
            <li><a href='#contact' className='hover:text-white transition-colors'>Contact Us</a></li>
            <li><a href='#faqs' className='hover:text-white transition-colors'>FAQs</a></li>
            <li><a href='#terms' className='hover:text-white transition-colors'>Terms of Service</a></li>
            <li><a href='#privacy' className='hover:text-white transition-colors'>Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      {/* ── Sub-Footer ── */}
      <div className='max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50'>
        <p>© 2026 OrchillaLand. All rights reserved.</p>

        <div className='flex items-center gap-2 cursor-pointer hover:text-white transition-colors'>
          <Globe style={{ width: 14, height: 14 }} />
          <span>English ⌵</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
