import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { deriveNameFromEmail } from '../../utils/userDisplay';
 
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
    const normalizedName = String(name || '').trim();
    const looksLikeEmailName = normalizedName.includes('@') && normalizedName.split('@').length === 2;
    const nameValue = normalizedName && !looksLikeEmailName
      ? normalizedName
      : deriveNameFromEmail(email);
    if (nameValue) localStorage.setItem('userName', nameValue);
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
 
 