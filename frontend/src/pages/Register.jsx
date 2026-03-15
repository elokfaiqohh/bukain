import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../hooks/useAuth';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Send registration request to backend
      await axios.post('/api/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password
      });
      
      // 2. Automatically log the user in using existing Auth Context
      const user = await login(email.trim(), password);
      const redirectTo = from || (user.role === 'customer' ? '/user' : '/restaurant');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Unable to register, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-lg px-4 py-16 mx-auto">
      <div className="p-10 bg-white shadow-sm rounded-3xl">
        <h1 className="text-2xl font-bold text-slate-900">Create an Account</h1>
        <p className="mt-2 text-sm text-slate-600">Join Bukain to discover perfect iftar meals.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              required
              className="w-full px-4 py-3 mt-2 text-sm bg-white border shadow-sm rounded-xl border-slate-200 text-slate-900 focus:border-bukain-green focus:outline-none"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full px-4 py-3 mt-2 text-sm bg-white border shadow-sm rounded-xl border-slate-200 text-slate-900 focus:border-bukain-green focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="w-full px-4 py-3 mt-2 text-sm bg-white border shadow-sm rounded-xl border-slate-200 text-slate-900 focus:border-bukain-green focus:outline-none"
              placeholder="Create a password"
            />
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 text-sm font-semibold text-white shadow-sm rounded-xl bg-bukain-green hover:bg-bukain-green/90 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-bukain-green hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </main>
  );
}