import { useNavigate, useLocation, Link } from '@workspace/router';
import { FormEvent, useState } from 'react';
import { api } from '../../services/api';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/v1/auth/login', formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('user_roles', JSON.stringify(data.user.roles));

      // Redirect to the original requested URL or default to admin
      const from = location.state?.from?.state?.from.pathname || '/admin';
      navigate(from);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow'>
        <h2 className='text-center text-3xl font-extrabold text-gray-900'>
          Sign in to your account
        </h2>
        {error && <div className='text-red-500 text-center'>{error}</div>}
        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div>
            <input
              type='email'
              required
              placeholder='Email address'
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className='appearance-none rounded relative block w-full px-3 py-2 border border-gray-300'
            />
          </div>
          <div>
            <input
              type='password'
              required
              placeholder='Password'
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className='appearance-none rounded relative block w-full px-3 py-2 border border-gray-300'
            />
          </div>
          <button
            type='submit'
            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700'
          >
            Sign in
          </button>
          <button
            type='button'
            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700'
          >
            <Link to='/auth/register'>Create an account</Link>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
