import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { isAuthenticated, getCurrentUser, logout } from '../utils/auth.js';
import { Avatar } from './Avatar.jsx';

/**
 * PublicNavbar component for guest and authenticated users.
 * - Guest: shows WriteSpace logo, Login and Get Started buttons.
 * - Authenticated: shows WriteSpace logo, avatar chip with display name, and Dashboard CTA.
 * @returns {JSX.Element}
 */
export function PublicNavbar() {
  const [session, setSession] = useState(null);
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authenticated = isAuthenticated();
    setAuthed(authenticated);
    if (authenticated) {
      setSession(getCurrentUser());
    }
  }, []);

  const handleLogout = () => {
    logout();
    setAuthed(false);
    setSession(null);
    navigate('/');
  };

  return (
    <nav className="w-full bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center space-x-2 text-writespace-primary font-bold text-xl hover:opacity-80 transition-opacity"
          >
            <span className="bg-writespace-gradient bg-clip-text text-transparent">
              WriteSpace
            </span>
          </Link>

          <div className="flex items-center space-x-3">
            {authed && session ? (
              <>
                <div className="flex items-center space-x-2">
                  <Avatar
                    role={session.role}
                    displayName={session.displayName}
                    size="sm"
                  />
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">
                    {session.displayName}
                  </span>
                </div>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-writespace-gradient rounded-lg hover:bg-writespace-gradient-hover transition-all shadow-sm"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-writespace-gradient rounded-lg hover:bg-writespace-gradient-hover transition-all shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default PublicNavbar;