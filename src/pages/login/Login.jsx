import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/700.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FiEye, FiEyeOff } from "react-icons/fi";
import { MdOutlineEmail } from "react-icons/md";
import { TbLockPassword } from "react-icons/tb";
import { FaMicrosoft } from "react-icons/fa";
import { fetchSsoAuthorizeUrl, loginWithPassword } from '../../api/authService';
import { deriveNameFromEmail } from '../../utils/userDisplay';
import arrowLogo from "../../assets/login/logo_login.png";
import { startAuthSession } from '../../utils/authSession';
import ForgotPasswordModal from './ForgotPasswordModal';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const getAuthErrorMessage = (err, fallbackMessage) => {
  const status = Number(err?.response?.status || 0);
  const data = err?.response?.data;

  const identityUrl = String(import.meta.env.VITE_IDENTITY_SERVICE_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080').trim();

  if (typeof data === 'string' && data.trim()) {
    return data.trim();
  }

  const backendMessage = String(
    data?.message || data?.error || data?.details || '',
  ).trim();
  if (backendMessage) {
    return backendMessage;
  }

  if (status === 401) {
    return 'Invalid email or password.';
  }

  if (status >= 500) {
    return `Login service is unavailable. Check service at ${identityUrl} and try again.`;
  }

  if (!err?.response) {
    return `Cannot reach login service. Check service at ${identityUrl}.`;
  }

  return err?.message || fallbackMessage;
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const navigate = useNavigate();
  const hasInitialized = useRef(false);

  const persistAuthSession = useCallback((response = {}) => {
    const emailValue = String(response?.email || email || '').toLowerCase().trim();
    const roleValue = String(response?.role || '').trim().toLowerCase().replace(/[\s_-]+/g, '');
    const personaValue = String(response?.persona || '').trim().toLowerCase();

    if (emailValue) {
      localStorage.setItem('userEmail', emailValue);
    }
    if (roleValue) {
      localStorage.setItem('userRole', roleValue);
    }
    if (personaValue === 'businessstakeholder' || personaValue === 'business stakeholder') {
      localStorage.setItem('userPersona', 'businessstakeholder');
    } else {
      localStorage.removeItem('userPersona');
    }

    const normalizedName = String(response?.name || '').trim();
    const looksLikeEmailName = normalizedName.includes('@') && normalizedName.split('@').length === 2;
    const lowerName = normalizedName.toLowerCase();
    const isGenericRoleName = [
      'business stakeholder',
      'businessstakeholder',
      'account manager',
      'accountmanager',
      'recruiter',
    ].includes(lowerName);
    const nameValue = normalizedName && !looksLikeEmailName && !isGenericRoleName
      ? normalizedName
      : deriveNameFromEmail(emailValue);

    if (nameValue) {
      localStorage.setItem('userName', nameValue);
    }

    const incomingToken = String(
      response?.token || response?.access_token || response?.accessToken || response?.jwt || ''
    ).trim();

    if (incomingToken) {
      localStorage.setItem('token', incomingToken);
      startAuthSession();
    }
  }, [email]);

  // Load remembered credentials on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');

    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    const hasStoredToken = Boolean(localStorage.getItem('token'));
    if (hasStoredToken && window.location.pathname === '/login') {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || emailRegex.test(email.trim())) {
      setEmailError('');
    } else {
      setEmailError('Invalid email format');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const normalizedEmail = email.toLowerCase().trim();

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', normalizedEmail);
        localStorage.setItem('rememberedPassword', password);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }

      const response = await loginWithPassword({
        email: normalizedEmail,
        password,
      });
      persistAuthSession(response);

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSsoLogin = async () => {
    setSsoLoading(true);
    setError('');

    try {
      const authorizeUrl = await fetchSsoAuthorizeUrl();
      if (!authorizeUrl) {
        throw new Error('Failed to retrieve Microsoft login URL. Please try again.');
      }
      window.location.href = authorizeUrl;
    } catch (err) {
      setError(err?.message || 'SSO login failed. Please try again.');
      setSsoLoading(false);
    }
  };

  return (
  <div className="login-container">
    <div className="login-right">
      <div className="hero-copy">
        <h1>Access Your Hiring Workspace</h1>
        <p>
          Log in to track applicants, manage job openings, schedule interviews, and make smarter hiring decisions—all in one place.
        </p>
      </div>
      <div className="footer-copy">© 2026, Powered by MethodHub</div>
    </div>

    <div className="login-left">
      <img src={arrowLogo} alt="GotPOS Logo" className="login-logo" />

      <div className="login-card">
        <div className="login-card-heading">
          <h4>WELCOME TO ARROWS!</h4>
          <p>Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group email-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <MdOutlineEmail className="input-icon" size="20" />
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={validateEmail}
                placeholder="Enter your email or username"
                required
              />
            </div>
          </div>

          {emailError && <p className="error-message">{emailError}</p>}

          <div className="form-group password-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <TbLockPassword className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>

            <button
              type="button"
              className="forgot-password"
              onClick={() => setShowForgotPasswordModal(true)}
            >
              Forgot password?
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div className="login-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="sso-btn"
            disabled={ssoLoading}
            onClick={handleSsoLogin}
          >
            <FaMicrosoft size={18} />
            {ssoLoading ? "Redirecting..." : "Sign in with Microsoft"}
          </button>

        </form>
      </div>
    </div>

    <ForgotPasswordModal
      isOpen={showForgotPasswordModal}
      onClose={() => setShowForgotPasswordModal(false)}
    />
  </div>
);
};

export default Login;

