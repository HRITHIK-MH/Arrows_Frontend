import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeSsoCallback } from '../../api/authService';
import { startAuthSession } from '../../utils/authSession';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Auth callback route loaded:', window.location.pathname, window.location.search);
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    console.log('SSO callback code:', code);
    const state = params.get('state');
    const token = params.get('token');
console.log('SSO callback token:', token);
    const email = params.get('email');
    const name = params.get('name');
    const userId = params.get('userId') || params.get('user_id');
    const tokenType = params.get('tokenType') || params.get('token_type');

    const handleTokenFlow = () => {
      if (!token) {
        return false;
      }

      console.log('SSO callback received legacy token flow:', { token, email, name, userId, tokenType });
      localStorage.setItem('authToken', token);
      localStorage.setItem('token', token);
      if (email) localStorage.setItem('userEmail', email);
      if (name) localStorage.setItem('userName', name);
      if (userId) localStorage.setItem('userId', userId);
      if (tokenType) localStorage.setItem('tokenType', tokenType);
      startAuthSession();
      return true;
    };

    const completeSso = async () => {
      if (handleTokenFlow()) {
        window.history.replaceState({}, document.title, '/dashboard');
        navigate('/dashboard', { replace: true });
        return;
      }

      if (!code || !state) {
        console.error('Missing SSO code/state in callback.');
        navigate('/login');
        return;
      }

      // The frontend receives the one-time OAuth authorization code from Azure,
      // then forwards it to the backend for a single exchange. The frontend does
      // not keep or reuse the authorization code itself.
      try {
        const response = await exchangeSsoCallback({ code, state });
        console.log('SSO callback exchange success:', response);
        startAuthSession();
        window.history.replaceState({}, document.title, '/dashboard');
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('SSO callback exchange failed:', err);
        navigate('/login');
      }
    };

    completeSso();
  }, [navigate]);

  return (
    <div style={{ padding: 40 }}>
      Completing sign-in...
    </div>
  );
}
