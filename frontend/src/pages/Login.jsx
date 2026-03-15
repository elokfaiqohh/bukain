import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const user = await login(email.trim(), password);
      const redirectTo =
        from ||
        (user.role === 'customer' ? '/user' : user.role === 'restaurant' ? '/restaurant' : '/admin');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to login, please try again.');
    }
  };

  return (
    <main className="max-w-lg px-4 py-16 mx-auto">
      <div className="p-10 bg-white shadow-sm rounded-3xl">
        <h1 className="text-2xl font-bold text-slate-900">Sign in to Bukain</h1>
        <p className="mt-2 text-sm text-slate-600">Use your work email to access your dashboard.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
              placeholder="Enter your password"
            />
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <button
            type="submit"
            className="w-full px-4 py-3 text-sm font-semibold text-white shadow-sm rounded-xl bg-bukain-green hover:bg-bukain-green/90"
          >
            Sign in
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" state={{ from: location.state?.from }} className="font-semibold text-bukain-green hover:underline">
            Sign up here
          </Link>
        </div>
      </div>
    </main>
  );
}
