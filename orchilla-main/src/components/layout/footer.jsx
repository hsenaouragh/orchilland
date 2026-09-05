import React from 'react'
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa'
import { HiLocationMarker } from 'react-icons/hi'
import { MdComputer } from 'react-icons/md'

const links = [
  ['Home', '/'],
  ['Courses', '/courses'],
  ['Placement Test', '/placement-test'],
  ['Books', '/books'],
  ['Posts', '/posts'],
]

const Footer = () => (
  <footer className='bg-gray-950 text-white mt-16'>
    <div className='container mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10'>

      {/* Brand */}
      <div className='sm:col-span-2 lg:col-span-1 space-y-4'>
        <div className='flex items-center gap-2 text-xl font-bold uppercase'>
          <MdComputer className='text-[#1D9E75] text-3xl' />
          <span>Orchilland</span>
        </div>
        <p className='text-sm text-white/40 leading-relaxed max-w-xs'>
          Learn languages with confidence. Adaptive courses, real tutors, and a community that keeps you moving forward.
        </p>
        <div className='flex gap-4 pt-1'>
          {[HiLocationMarker, FaFacebook, FaInstagram, FaTiktok].map((Icon, i) => (
            <a key={i} href='#' className='text-white/40 hover:text-[#1D9E75] transition-colors duration-200'>
              <Icon size={20} />
            </a>
          ))}
        </div>
      </div>

      {/* Links */}
      <div>
        <h3 className='text-sm font-semibold uppercase tracking-widest text-white/30 mb-5'>Navigation</h3>
        <ul className='space-y-3'>
          {links.map(([label, href]) => (
            <li key={label}>
              <a href={href} className='text-sm text-white/60 hover:text-[#1D9E75] transition-colors duration-200'>{label}</a>
            </li>
          ))}
        </ul>
      </div>

      {/* Contact */}
      <div>
        <h3 className='text-sm font-semibold uppercase tracking-widest text-white/30 mb-5'>Contact</h3>
        <ul className='space-y-3 text-sm text-white/60'>
          <li className='flex gap-1'><HiLocationMarker className='hover:text-[#1D9E75]'/> 12 Rue de la Paix, Algiers</li>
          <li><a href='tel:+213555000111' className='hover:text-[#1D9E75] transition-colors duration-200'>+213 555 000 111</a></li>
          <li><a href='mailto:hello@orchilland.com' className='hover:text-[#1D9E75] transition-colors duration-200'>hello@orchilland.com</a></li>
        </ul>

      </div>

    </div>

    {/* Copyright */}
    <div className='border-t border-white/5 py-5 text-center text-xs text-white/20'>
      © 2026 Orchilland for Learning. All rights reserved.
    </div>
  </footer>
)

export default Footer
