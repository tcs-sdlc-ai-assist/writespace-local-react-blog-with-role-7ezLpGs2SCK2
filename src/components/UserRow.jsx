import PropTypes from 'prop-types';
import { Avatar } from './Avatar.jsx';

/**
 * Formats an ISO date string into a human-readable format.
 * @param {string} dateString - ISO date string.
 * @returns {string} Formatted date string.
 */
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
}

/**
 * UserRow component for admin user management.
 * Displays avatar, display name, username, role badge, creation date, and delete button.
 * Delete button is disabled with tooltip for self-deletion and the default admin account.
 *
 * @param {Object} props
 * @param {Object} props.user - The user object to display.
 * @param {string} props.user.id - Unique user identifier.
 * @param {string} props.user.displayName - User's display name.
 * @param {string} props.user.username - User's username.
 * @param {'admin'|'user'} props.user.role - User's role.
 * @param {string} props.user.createdAt - ISO date string of account creation.
 * @param {Object} props.currentUser - The current authenticated user's session object.
 * @param {string} props.currentUser.userId - Current user's ID.
 * @param {string} props.currentUser.username - Current user's username.
 * @param {string} props.currentUser.displayName - Current user's display name.
 * @param {'admin'|'user'} props.currentUser.role - Current user's role.
 * @param {Function} props.onDelete - Callback invoked with the user's id when delete is clicked.
 * @returns {JSX.Element}
 */
export function UserRow({ user, currentUser, onDelete }) {
  const isSelf = currentUser && currentUser.userId === user.id;
  const isDefaultAdmin = user.id === 'u1' || (user.username === 'admin' && user.role === 'admin');
  const isDeleteDisabled = isSelf || isDefaultAdmin;

  let deleteTooltip = 'Delete user';
  if (isSelf) {
    deleteTooltip = 'You cannot delete yourself';
  } else if (isDefaultAdmin) {
    deleteTooltip = 'Default admin cannot be deleted';
  }

  const handleDelete = () => {
    if (!isDeleteDisabled) {
      onDelete(user.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-4 flex items-center space-x-4">
      {/* Avatar */}
      <Avatar
        role={user.role}
        displayName={user.displayName}
        size="md"
      />

      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.displayName}
          </p>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              user.role === 'admin'
                ? 'bg-violet-100 text-violet-800'
                : 'bg-indigo-100 text-indigo-800'
            }`}
          >
            {user.role}
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate">@{user.username}</p>
        {user.createdAt && (
          <p className="text-xs text-gray-400 mt-0.5">
            Joined {formatDate(user.createdAt)}
          </p>
        )}
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        disabled={isDeleteDisabled}
        title={deleteTooltip}
        aria-label={deleteTooltip}
        className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
          isDeleteDisabled
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
        }`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );
}

UserRow.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['admin', 'user']).isRequired,
    createdAt: PropTypes.string,
  }).isRequired,
  currentUser: PropTypes.shape({
    userId: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['admin', 'user']).isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default UserRow;