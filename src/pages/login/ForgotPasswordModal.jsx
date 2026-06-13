import { useCallback, useState } from 'react';
import { MdOutlineEmail } from 'react-icons/md';
import { IoCloseSharp } from 'react-icons/io5';
import './ForgotPasswordModal.css';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (!email.trim()) {
        throw new Error('Please enter your email address');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        throw new Error('Please enter a valid email address');
      }

      // Simulate API call - replace with actual backend call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccessMessage(
        `Password reset instructions have been sent to ${email}. Please check your email.`
      );
      
      setTimeout(() => {
        setEmail('');
        setSuccessMessage('');
        onClose();
      }, 3000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to process password reset request');
    } finally {
      setLoading(false);
    }
  }, [email, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="forgot-password-backdrop" onClick={handleBackdropClick}>
      <div className="forgot-password-modal">
        <div className="modal-header">
          <h2>Forgot Password?</h2>
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            <IoCloseSharp size={24} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            Enter your email address and we'll send you instructions to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="reset-email">Email Address</label>
              <div className="input-wrapper">
                <MdOutlineEmail className="input-icon" size={20} />
                <input
                  type="email"
                  id="reset-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {errorMessage && (
              <div className="error-message">{errorMessage}</div>
            )}

            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !email.trim()}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
