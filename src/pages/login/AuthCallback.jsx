import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeSsoCallback } from '../../api/authService';
import { startAuthSession } from '../../utils/authSession';
import { deriveNameFromEmail } from '../../utils/userDisplay';

const storeCallbackSession = ({ token, email, name, userId, tokenType }) => {
  window.localStorage.setItem('authToken', token);
  window.localStorage.setItem('token', token);
  startAuthSession();

  if (email) localStorage.setItem('userEmail', email);
  const normalizedName = String(name || '').trim();
  const looksLikeEmailName = normalizedName.includes('@') && normalizedName.split('@').length === 2;
  const nameValue = normalizedName && !looksLikeEmailName
    ? normalizedName
    : deriveNameFromEmail(email);
  if (nameValue) localStorage.setItem('userName', nameValue);
  if (userId) localStorage.setItem('userId', userId);
  if (tokenType) localStorage.setItem('tokenType', tokenType);
};

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const completeSignIn = async () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    const name = params.get('name');
    const userId = params.get('userId') || params.get('user_id');
    const tokenType = params.get('tokenType') || params.get('token_type');
      const code = params.get('code');
      const state = params.get('state');
      const oauthError = params.get('error');

      if (oauthError) {
        const description = params.get('error_description') || oauthError;
        console.error('SSO callback failed:', description);
        navigate('/login', { replace: true });
        return;
      }

      try {
        if (token) {
          storeCallbackSession({ token, email, name, userId, tokenType });
        } else if (code && state) {
          const response = await exchangeSsoCallback({ code, state });
          const exchangedToken = String(
            response?.token || response?.access_token || response?.accessToken || response?.jwt || ''
          ).trim();

          if (!exchangedToken) {
            throw new Error('Missing SSO token in callback response.');
          }

          storeCallbackSession({
            token: exchangedToken,
            email: response?.email,
            name: response?.name,
            userId: response?.userId || response?.user_id,
            tokenType: response?.tokenType || response?.token_type,
          });
        } else {
          throw new Error('Missing SSO token or authorization code in callback.');
        }

        if (!active) return;
        window.history.replaceState({}, document.title, '/dashboard');
        navigate('/dashboard', { replace: true });
      } catch (err) {
        if (!active) return;
        console.error('SSO sign-in failed:', err);
        navigate('/login', { replace: true });
      }
    };

    completeSignIn();

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div style={{ padding: 40 }}>
      Completing sign-in...
    </div>
  );
}
 
 
