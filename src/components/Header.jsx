import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiCamera,
  FiSearch,
  FiUpload,
  FiArchive,
  FiAlertTriangle,
  FiUsers,
  FiLogOut,
  FiFolder,
  FiHelpCircle,
} from 'react-icons/fi';
import NavDropdown from './NavDropdown';
import { useAuth } from '../context/AuthContext';

const PRIMARY_TABS = [
  { to: '/', label: 'Scan Returns', icon: FiCamera, end: true },
  { to: '/search', label: 'Search Returns', icon: FiSearch },
];

const MANAGE_ITEMS = [
  { to: '/import', label: 'Import Data', icon: FiUpload },
  { to: '/logs', label: 'Return Logs', icon: FiArchive },
  { to: '/unmatched', label: 'Unmatched Records', icon: FiAlertTriangle },
];

const ADMIN_ITEM = { to: '/users', label: 'Users', icon: FiUsers };

const Header = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const manageItems = isAdmin ? [...MANAGE_ITEMS, ADMIN_ITEM] : MANAGE_ITEMS;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-xl transition-all duration-200">
      <div className="mx-auto flex container flex-col items-center gap-4 px-4 py-3.5 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        {/* Brand Section */}
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-indigo-500 text-base font-bold text-white shadow-lg shadow-indigo-200/60 ring-1 ring-white/20">
            RP
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <h1 className="font-display text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
              Return Processing
            </h1>
            <p className="text-xs font-medium text-slate-400">Qurvii Reverse Logistics</p>
          </div>
        </div>

        <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
          {/* Navigation Tabs */}
          <nav className="flex w-full flex-wrap justify-center gap-1 rounded-xl bg-slate-100/80 p-1 ring-1 ring-slate-200/60 sm:w-auto sm:justify-start">
            {PRIMARY_TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `relative inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-md shadow-indigo-200/50 ring-1 ring-indigo-100'
                      : 'text-slate-600 hover:bg-white/70 hover:text-slate-900 hover:shadow-sm'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <tab.icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                    <span>{tab.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-indigo-500" />
                    )}
                  </>
                )}
              </NavLink>
            ))}

            <NavDropdown label="Manage" icon={FiFolder} items={manageItems} />
          </nav>

          {/* Divider */}
          <div className="hidden h-8 w-px bg-slate-200 sm:block" />

          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <NavLink
              to="/manual"
              title="User Manual"
              className={({ isActive }) =>
                `flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition ${
                  isActive
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`
              }
            >
              <FiHelpCircle aria-hidden="true" className="h-4 w-4" />
              <span className="sr-only">User Manual</span>
            </NavLink>
            {user && (
              <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-1 pl-1 pr-3 text-sm font-medium text-slate-700 shadow-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-xs font-semibold uppercase text-white">
                  {user.username.charAt(0)}
                </span>
                <span className="max-w-32 truncate">{user.username}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                    isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {user.role}
                </span>
              </span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <FiLogOut aria-hidden="true" className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
