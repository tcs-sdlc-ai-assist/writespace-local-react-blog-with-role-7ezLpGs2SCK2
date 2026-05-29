import { Link } from 'react-router-dom';
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
 * Truncates content to a specified maximum length, appending ellipsis if needed.
 * @param {string} content - The content string to truncate.
 * @param {number} [maxLength=120] - Maximum character length.
 * @returns {string} Truncated content string.
 */
function truncateContent(content, maxLength = 120) {
  if (!content) return '';
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Determines whether the current user can edit the given post.
 * Admin can edit all posts; regular users can only edit their own.
 * @param {Object} post - The post object.
 * @param {Object|null} currentUser - The current user's session object.
 * @returns {boolean} True if the user can edit the post.
 */
function canEdit(post, currentUser) {
  if (!currentUser) return false;
  if (currentUser.role === 'admin') return true;
  return post.authorId === currentUser.userId;
}

/**
 * BlogCard component displaying a blog post in a card layout.
 * Shows title, truncated content excerpt, formatted date, author avatar,
 * and an edit icon if the current user has permission.
 *
 * @param {Object} props
 * @param {Object} props.post - The blog post object.
 * @param {string} props.post.id - Unique post identifier.
 * @param {string} props.post.title - Post title.
 * @param {string} props.post.content - Post content.
 * @param {string} props.post.createdAt - ISO date string of creation.
 * @param {string} props.post.authorId - Author's user ID.
 * @param {string} props.post.authorName - Author's display name.
 * @param {Object|null} props.currentUser - The current user's session object.
 * @returns {JSX.Element}
 */
export function BlogCard({ post, currentUser }) {
  const showEdit = canEdit(post, currentUser);
  const authorRole = currentUser && post.authorId === currentUser.userId ? currentUser.role : 'user';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="p-5 flex flex-col flex-1">
        {/* Header: Avatar + Author + Date */}
        <div className="flex items-center space-x-3 mb-3">
          <Avatar
            role={authorRole}
            displayName={post.authorName}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {post.authorName}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(post.createdAt)}
            </p>
          </div>
          {showEdit && (
            <Link
              to={`/write?edit=${post.id}`}
              className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-writespace-primary hover:bg-writespace-light transition-colors"
              aria-label={`Edit post: ${post.title}`}
              title="Edit post"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </Link>
          )}
        </div>

        {/* Title */}
        <Link
          to={`/blog/${post.id}`}
          className="block mb-2 group"
        >
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-writespace-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-sm text-gray-600 flex-1">
          {truncateContent(post.content)}
        </p>

        {/* Read more link */}
        <div className="mt-4">
          <Link
            to={`/blog/${post.id}`}
            className="text-sm font-medium text-writespace-primary hover:text-writespace-secondary transition-colors"
          >
            Read more →
          </Link>
        </div>
      </div>
    </div>
  );
}

BlogCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    authorId: PropTypes.string.isRequired,
    authorName: PropTypes.string.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({
    userId: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['admin', 'user']).isRequired,
  }),
};

export default BlogCard;