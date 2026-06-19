import React, { useState } from 'react'
import './ForgotPasswordModal.css'

export default function ForgotPasswordModal({ isOpen, onClose, onSent }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [emailError, setEmailError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    const normalizedEmail = String(email || '').trim()
    const isMethodHubEmail = /^[^\s@]+@method-hub\.com$/i.test(normalizedEmail)

    if (!isMethodHubEmail) {
      setEmailError('Please enter a valid @method-hub.com email address.')
      return
    }

    setEmailError('')
    setStatus('sending')
    try {
      const base = import.meta.env.VITE_API_URL || ''
      const res = await fetch(`${base}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      })

      if (res.ok) {
        setStatus('sent')
        if (onSent) onSent(email)
      } else {
        const text = await res.text()
        setStatus(`error: ${text || res.statusText}`)
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="fp-overlay" role="dialog" aria-modal="true">
      <div className="fp-modal">
        <h3>Reset your password</h3>
        <p className="fp-sub">Enter the email address for your account.</p>

        <form className="fp-form" onSubmit={handleSubmit}>
          <label className="fp-label">Email</label>
          <input
            className="fp-input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@method-hub.com"
          />
          {emailError && <p className="fp-error">{emailError}</p>}

          <div className="fp-actions">
            <button type="button" className="fp-btn fp-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="fp-btn fp-btn-primary" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send reset link'}
            </button>
          </div>
        </form>

        {status === 'sent' && <p className="fp-success">If that email exists, a reset link was sent.</p>}
        {status.startsWith('error') && <p className="fp-error">Unable to send reset link.</p>}
      </div>
    </div>
  )
}
