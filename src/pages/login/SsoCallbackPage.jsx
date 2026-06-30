import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeSsoCallback } from '../../api/authService';

const SsoCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (!code || !state) {
      console.error('Missing SSO callback code/state.');
      return;
    }

    const completeSso = async () => {
      try {
        await exchangeSsoCallback({ code, state });
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('SSO login failed:', err);
      }
    };

    completeSso();
  }, [navigate]);

  return <div>Completing login…</div>;
};

export default SsoCallbackPage;
