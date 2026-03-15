import { Link, NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Header() {
  const { user, logout } = useAuth();

  const dashboardLink = user
    ? user.role === 'customer'
      ? '/user'
      : user.role === 'restaurant'
      ? '/restaurant'
      : '/admin'
    : '/login';

  return (
    <header className="sticky top-0 border-b z-[9999] bg-white/80 backdrop-blur border-slate-200">
      <div className="flex items-center justify-between max-w-6xl gap-4 px-4 py-3 mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center font-bold text-white h-9 w-9 rounded-xl bg-bukain-green">B</div>
          <div className="text-lg font-semibold text-slate-900">Bukain</div>
        </Link>

        <nav className="items-center hidden gap-4 text-sm font-medium md:flex text-slate-600 z-[999]">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `rounded-full px-3 py-2 transition ${
                isActive ? 'bg-bukain-green text-white shadow-sm' : 'hover:bg-slate-100'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/browse"
            className={({ isActive }) =>
              `rounded-full px-3 py-2 transition ${
                isActive ? 'bg-bukain-green text-white shadow-sm' : 'hover:bg-slate-100'
              }`
            }
          >
            Browse Menu
          </NavLink>
          {user ? (
            <NavLink
              to={dashboardLink}
              className={({ isActive }) =>
                `rounded-full px-3 py-2 transition ${
                  isActive ? 'bg-bukain-green text-white shadow-sm' : 'hover:bg-slate-100'
                }`
              }
            >
              Dashboard
            </NavLink>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `rounded-full px-3 py-2 transition ${
                  isActive ? 'bg-bukain-green text-white shadow-sm' : 'hover:bg-slate-100'
                }`
              }
            >
              Login
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="px-4 py-2 text-sm font-semibold text-white rounded-full shadow-sm bg-bukain-green hover:bg-bukain-green/90"
          >
            Find My Iftar
          </Link>
          {user ? (
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 text-sm font-semibold bg-white border rounded-full border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Sign out
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
