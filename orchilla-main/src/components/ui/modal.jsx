import { useState } from 'react'
import { createPortal } from 'react-dom'

const Modal = ({ onClose, onConfirm }) => {

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-3xl p-8 max-w-sm w-full text-center"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.18)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="text-4xl mb-4">🚀</div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Ready to start learning?
        </h3>

        {/* Subtitle */}
        <p className="text-gray-400 text-sm mb-6">
          Explore courses tailored to your level and goals.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-500 text-sm font-semibold hover:text-gray-700"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl text-white text-sm font-bold"
            style={{ background: 'var(--color-green)' }}
          >
            Browse Courses →
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default Modal
