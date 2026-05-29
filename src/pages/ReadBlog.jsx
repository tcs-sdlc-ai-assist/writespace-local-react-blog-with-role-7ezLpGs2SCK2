import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth.js';
import { getPosts, deletePost } from '../utils/storage.js';
import { Navbar } from '../components/Navbar.jsx';
import { Avatar } from '../components/Avatar.jsx';

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
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
}

/**
 * Determines whether the current user can edit/delete the given post.
 * Admin can edit/delete all posts; regular users can only edit/delete their own.
 * @param {Object} post - The post object.
 * @param {Object|null} currentUser - The current user's session object.
 * @returns {boolean} True if the user can edit/delete the post.
 */
function canModify(post, currentUser) {
  if (!currentUser) return false;
  if (currentUser.role === 'admin') return true;
  return post.authorId === currentUser.userId;
}

/**
 * ReadBlog component — single blog post reading page at '/blog/:id'.
 * Displays title, author avatar, author name, formatted date, full content.
 * Admin sees edit/delete buttons on all posts; user sees edit/delete only on own posts.
 * Delete confirms before removal and updates localStorage.
 * Invalid/missing ID shows 'Post not found' message with link back to '/blogs'.
 *
 * @returns {JSX.Element}
 */
export default function ReadBlog() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  useEffect(() => {
    try {
      const posts = getPosts();
      const found = posts.find((p) => p.id === id);

      if (found) {
        setPost(found);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    } catch (e) {
      console.error('ReadBlog: failed to load post', e);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleDelete = () => {
    setDeleting(true);

    try {
      const deleted = deletePost(post.id);

      if (deleted) {
        navigate('/dashboard', { replace: true });
      } else {
        console.error('ReadBlog: failed to delete post');
        setDeleting(false);
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      console.error('ReadBlog: delete failed', err);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-writespace-light text-writespace-primary mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Post not found
            </h2>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              The post you&apos;re looking for doesn&apos;t exist or may have been removed.
            </p>
            <Link
              to="/blogs"
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-writespace-gradient rounded-lg hover:bg-writespace-gradient-hover transition-all shadow-sm"
            >
              ← Back to Blogs
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const showActions = canModify(post, currentUser);
  const authorRole = currentUser && post.authorId === currentUser.userId ? currentUser.role : 'user';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to All Blogs
          </Link>
        </div>

        {/* Post card */}
        <article className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sm:p-8">
          {/* Header: Avatar + Author + Date + Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Avatar
                role={authorRole}
                displayName={post.authorName}
                size="md"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {post.authorName}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(post.createdAt)}
                </p>
              </div>
            </div>

            {showActions && (
              <div className="flex items-center space-x-2">
                {/* Edit button */}
                <Link
                  to={`/write?edit=${post.id}`}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-label={`Edit post: ${post.title}`}
                >
                  <svg
                    className="w-4 h-4 mr-1.5"
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
                  Edit
                </Link>

                {/* Delete button */}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  aria-label={`Delete post: ${post.title}`}
                >
                  <svg
                    className="w-4 h-4 mr-1.5"
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
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            {post.title}
          </h1>

          {/* Content */}
          <div className="prose prose-sm sm:prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Updated at */}
          {post.updatedAt && post.updatedAt !== post.createdAt && (
            <div className="mt-8 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Last updated {formatDate(post.updatedAt)}
              </p>
            </div>
          )}
        </article>
      </main>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !deleting && setShowDeleteConfirm(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-lg border border-gray-100 p-6 w-full max-w-sm">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Post
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete &quot;{post.title}&quot;? This action cannot be undone.
              </p>
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}