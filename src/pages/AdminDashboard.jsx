import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth.js';
import { getPosts, getUsers, deletePost } from '../utils/storage.js';
import { Navbar } from '../components/Navbar.jsx';
import { StatCard } from '../components/StatCard.jsx';
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
 * @param {number} [maxLength=80] - Maximum character length.
 * @returns {string} Truncated content string.
 */
function truncateContent(content, maxLength = 80) {
  if (!content) return '';
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength).trimEnd() + '…';
}

/**
 * AdminDashboard component — admin-only dashboard at '/admin'.
 * Displays four stat cards (total posts, total users, admin count, user count).
 * Quick-action buttons for 'Write New Post' and 'Manage Users'.
 * Recent posts section showing latest 5 posts with edit/delete controls.
 *
 * @returns {JSX.Element}
 */
export default function AdminDashboard() {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const currentUser = getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const allPosts = getPosts();
      const sorted = [...allPosts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setPosts(sorted);

      const allUsers = getUsers();
      setUsers(allUsers);
    } catch (e) {
      console.error('AdminDashboard: failed to load data', e);
      setPosts([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const totalPosts = posts.length;
  const totalUsers = users.length + 1; // +1 for hard-coded admin
  const adminCount = users.filter((u) => u.role === 'admin').length + 1; // +1 for hard-coded admin
  const userCount = users.filter((u) => u.role === 'user').length;
  const recentPosts = posts.slice(0, 5);

  const handleDelete = (postId) => {
    setDeleting(true);

    try {
      const deleted = deletePost(postId);

      if (deleted) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        setShowDeleteConfirm(null);
      } else {
        console.error('AdminDashboard: failed to delete post');
      }
    } catch (err) {
      console.error('AdminDashboard: delete failed', err);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Overview of your WriteSpace platform
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">Loading dashboard…</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                label="Total Posts"
                value={totalPosts}
                bgColor="bg-violet-100"
                textColor="text-violet-600"
                icon={
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
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                }
              />
              <StatCard
                label="Total Users"
                value={totalUsers}
                bgColor="bg-indigo-100"
                textColor="text-indigo-600"
                icon={
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                }
              />
              <StatCard
                label="Admins"
                value={adminCount}
                bgColor="bg-violet-100"
                textColor="text-violet-600"
                icon={
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                }
              />
              <StatCard
                label="Regular Users"
                value={userCount}
                bgColor="bg-indigo-100"
                textColor="text-indigo-600"
                icon={
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                }
              />
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/write"
                  className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-writespace-gradient rounded-lg hover:bg-writespace-gradient-hover transition-all shadow-sm"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Write New Post
                </Link>
                <Link
                  to="/users"
                  className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  Manage Users
                </Link>
              </div>
            </div>

            {/* Recent Posts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Posts
                </h2>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-writespace-primary hover:text-writespace-secondary transition-colors"
                >
                  View All →
                </Link>
              </div>

              {recentPosts.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-writespace-light text-writespace-primary mb-4">
                    <svg
                      className="w-7 h-7"
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
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No posts yet
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Get started by creating your first blog post.
                  </p>
                  <Link
                    to="/write"
                    className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-writespace-gradient rounded-lg hover:bg-writespace-gradient-hover transition-all shadow-sm"
                  >
                    Write your first post
                  </Link>
                </div>
              )}

              {recentPosts.length > 0 && (
                <div className="space-y-3">
                  {recentPosts.map((post) => {
                    const authorRole =
                      currentUser && post.authorId === currentUser.userId
                        ? currentUser.role
                        : 'user';

                    return (
                      <div
                        key={post.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-4 flex items-center space-x-4"
                      >
                        {/* Avatar */}
                        <Avatar
                          role={authorRole}
                          displayName={post.authorName}
                          size="sm"
                        />

                        {/* Post info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/blog/${post.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-writespace-primary transition-colors truncate block"
                          >
                            {post.title}
                          </Link>
                          <p className="text-xs text-gray-500 truncate">
                            {post.authorName} · {formatDate(post.createdAt)}
                          </p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {truncateContent(post.content)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <Link
                            to={`/write?edit=${post.id}`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-writespace-primary hover:bg-writespace-light transition-colors"
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
                          <button
                            onClick={() => setShowDeleteConfirm(post.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label={`Delete post: ${post.title}`}
                            title="Delete post"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !deleting && setShowDeleteConfirm(null)}
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
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={deleting}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
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