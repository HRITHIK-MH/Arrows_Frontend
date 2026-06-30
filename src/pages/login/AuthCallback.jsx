import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
 
export default function AuthCallback() {
  const navigate = useNavigate();
 
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    const name = params.get('name');
    const userId = params.get('userId') || params.get('user_id');
    const tokenType = params.get('tokenType') || params.get('token_type');
   
    if (!token) {
      console.error('Missing SSO token in callback.');
      navigate('/login');
      return;
    }
 
    window.localStorage.setItem('authToken', token);
    window.localStorage.setItem('token', token);
    window.sessionStorage.setItem('arrows:auth-session',"true");
 
    if (email) localStorage.setItem('userEmail', email);
    if (name) localStorage.setItem('userName', name);
    if (userId) localStorage.setItem('userId', userId);
    if (tokenType) localStorage.setItem('tokenType', tokenType);
 
    window.history.replaceState({}, document.title, '/dashboard');
    navigate('/dashboard', { replace: true });
  }, [navigate]);
 
  return (
    <div style={{ padding: 40 }}>
      Completing sign-in...
    </div>
  );
}
 
 