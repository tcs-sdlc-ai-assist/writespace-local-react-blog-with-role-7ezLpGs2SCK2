import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { isAuthenticated, getCurrentUser } from '../utils/auth.js';

/**
 * ProtectedRoute component that guards routes requiring authentication.
 * Redirects unauthenticated users to '/login'.
 * When adminOnly is true, redirects non-admin users to '/blogs'.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The child elements to render if authorized.
 * @param {boolean} [props.adminOnly=false] - Whether the route requires admin role.
 * @returns {JSX.Element}
 */
export function ProtectedRoute({ children, adminOnly = false }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly) {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      return <Navigate to="/blogs" replace />;
    }
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  adminOnly: PropTypes.bool,
};

export default ProtectedRoute;