import PropTypes from 'prop-types';

/**
 * Avatar component rendering role-distinct visuals.
 * Admin: crown emoji (👑) with violet background.
 * User: book emoji (📖) with indigo background.
 *
 * @param {Object} props
 * @param {'admin'|'user'} props.role - The user's role.
 * @param {string} props.displayName - The user's display name (used for accessible label).
 * @param {'sm'|'md'|'lg'} [props.size='md'] - The size of the avatar.
 * @returns {JSX.Element}
 */
export function Avatar({ role, displayName, size = 'md' }) {
  const isAdmin = role === 'admin';
  const emoji = isAdmin ? '👑' : '📖';

  const bgClass = isAdmin
    ? 'bg-violet-200 text-violet-800'
    : 'bg-indigo-200 text-indigo-800';

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-xl',
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`${bgClass} ${sizeClass} inline-flex items-center justify-center rounded-full flex-shrink-0`}
      role="img"
      aria-label={`${displayName} avatar`}
      title={displayName}
    >
      <span>{emoji}</span>
    </div>
  );
}

Avatar.propTypes = {
  role: PropTypes.oneOf(['admin', 'user']).isRequired,
  displayName: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default Avatar;