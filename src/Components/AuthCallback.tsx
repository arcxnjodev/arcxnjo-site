import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser } from '../Store/userSlice';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const username = params.get('username');
    const error = params.get('error');

    if (error) {
      navigate('/login?error=discord_failed');
      return;
    }

    if (token && username) {
      localStorage.setItem('token', token);
      localStorage.setItem('email', `${username}@discord`);
      dispatch(loginUser(`${username}@discord`));
      navigate('/panel');
    }
  }, [location, navigate, dispatch]);

  return (
    <div className="h-screen flex items-center justify-center bg-black">
      <div className="text-white text-xl">Authenticating with Discord...</div>
    </div>
  );
};