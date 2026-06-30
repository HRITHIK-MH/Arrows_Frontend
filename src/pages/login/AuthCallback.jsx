import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeSsoCallback } from '../../api/authService';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    if (error) {
      console.error('SSO callback error:', error, params.get('error_description'));
      navigate('/login');
      return;
    }

    if (!code || !state) {
      console.error('Missing SSO callback code/state.');
      navigate('/login');
      return;
    }

    const completeSso = async () => {
      try {
        await exchangeSsoCallback({ code, state });
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('SSO login failed:', err);
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
