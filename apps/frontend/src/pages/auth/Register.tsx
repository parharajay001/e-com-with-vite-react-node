import { Link, useNavigate } from '@workspace/router';
import { FormEvent, useState } from 'react';
import { api } from '../../services/api';

export const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    telephone: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/v1/auth/register', formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user_roles', JSON.stringify(data.user.roles));
      navigate('/admin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow'>
        <h2 className='text-center text-3xl font-extrabold text-gray-900'>Create your account</h2>
        {error && <div className='text-red-500 text-center'>{error}</div>}
        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='grid grid-cols-2 gap-4'>
            <input
              type='text'
              required
              placeholder='First Name'
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className='appearance-none rounded relative block w-full px-3 py-2 border border-gray-300'
            />
            <input
              type='text'
              required
              placeholder='Last Name'
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className='appearance-none rounded relative block w-full px-3 py-2 border border-gray-300'
            />
          </div>
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
              type='number'
              required
              placeholder='Telephone'
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
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
            Register
          </button>
          <button
            type='button'
            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700'
          >
            <Link to='/auth/login'>Already have an account? Sign in</Link>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
