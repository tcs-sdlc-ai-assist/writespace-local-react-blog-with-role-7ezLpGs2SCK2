import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, isAuthenticated } from '../utils/auth.js';
import { getUsers, addUser, getPosts, deletePost } from '../utils/storage.js';
import { Navbar } from '../components/Navbar.jsx';
import { UserRow } from '../components/UserRow.jsx';

/**
 * Generates a simple unique id for a new user.
 * @returns {string} A unique identifier string.
 */
function generateUserId() {
  return 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

/**
 * Deletes a user from localStorage by id.
 * @param {string} id - The id of the user to delete.
 * @returns {boolean} True if the user was found and deleted, false otherwise.
 */
function deleteUser(id) {
  try {
    const data = localStorage.getItem('writespace_users');
    if (!data) return false;
    const users = JSON.parse(data);
    if (!Array.isArray(users)) return false;
    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length === users.length) return false;
    localStorage.setItem('writespace_users', JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('deleteUser: failed to delete user', e);
    return false;
  }
}

/**
 * UserManagement component — admin-only user management page at '/users'.
 * Create user form with Display Name, Username, Password, Role dropdown (admin/user).
 * Unique username validation.
 * Responsive card layout showing all users via UserRow component.
 * Delete with confirmation; cannot delete self or default admin (button disabled with tooltip).
 * Non-admins redirected to '/blogs'.
 *
 * @returns {JSX.Element}
 */
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }

    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      navigate('/blogs', { replace: true });
      return;
    }

    loadUsers();
  }, [navigate]);

  const loadUsers = () => {
    try {
      const allUsers = getUsers();
      setUsers(allUsers);
    } catch (e) {
      console.error('UserManagement: failed to load users', e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Builds the full user list including the hard-coded admin account.
   * @returns {Array<Object>} Combined array of default admin + localStorage users.
   */
  const getAllUsersWithAdmin = () => {
    const defaultAdmin = {
      id: 'u1',
      displayName: 'Admin',
      username: 'admin',
      role: 'admin',
      createdAt: new Date('2024-01-01').toISOString(),
    };
    return [defaultAdmin, ...users];
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!displayName.trim() || !username.trim() || !password.trim()) {
      setFormError('All fields are required');
      return;
    }

    // Check if username is reserved
    if (username.trim() === 'admin') {
      setFormError('Username already exists');
      return;
    }

    // Check uniqueness among existing users
    const existingUsers = getUsers();
    if (existingUsers.some((u) => u.username === username.trim())) {
      setFormError('Username already exists');
      return;
    }

    setFormLoading(true);

    try {
      const newUser = {
        id: generateUserId(),
        displayName: displayName.trim(),
        username: username.trim(),
        password: password,
        role: role,
        createdAt: new Date().toISOString(),
      };

      const added = addUser(newUser);

      if (added) {
        setDisplayName('');
        setUsername('');
        setPassword('');
        setRole('user');
        setFormSuccess(`User "${newUser.displayName}" created successfully`);
        loadUsers();

        setTimeout(() => {
          setFormSuccess('');
        }, 3000);
      } else {
        setFormError('Failed to create user');
      }
    } catch (err) {
      console.error('UserManagement: create user failed', err);
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteRequest = (userId) => {
    setShowDeleteConfirm(userId);
  };

  const handleDeleteConfirm = () => {
    if (!showDeleteConfirm) return;

    setDeleting(true);

    try {
      // Also delete all posts by this user
      const posts = getPosts();
      const userPosts = posts.filter((p) => p.authorId === showDeleteConfirm);
      userPosts.forEach((p) => deletePost(p.id));

      const deleted = deleteUser(showDeleteConfirm);

      if (deleted) {
        setShowDeleteConfirm(null);
        loadUsers();
      } else {
        console.error('UserManagement: failed to delete user');
      }
    } catch (err) {
      console.error('UserManagement: delete failed', err);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(null);
    }
  };

  const allUsers = getAllUsersWithAdmin();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            User Management
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Create and manage user accounts
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">Loading users…</p>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create User Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Create New User
                </h2>

                <form onSubmit={handleCreateUser} className="space-y-4">
                  {/* Error message */}
                  {formError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                      {formError}
                    </div>
                  )}

                  {/* Success message */}
                  {formSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
                      {formSuccess}
                    </div>
                  )}

                  {/* Display Name field */}
                  <div>
                    <label
                      htmlFor="displayName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Display Name
                    </label>
                    <input
                      id="displayName"
                      name="displayName"
                      type="text"
                      autoComplete="name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-writespace-primary focus:border-writespace-primary transition-colors"
                      placeholder="Enter display name"
                    />
                  </div>

                  {/* Username field */}
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-writespace-primary focus:border-writespace-primary transition-colors"
                      placeholder="Choose a username"
                    />
                  </div>

                  {/* Password field */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-writespace-primary focus:border-writespace-primary transition-colors"
                      placeholder="Create a password"
                    />
                  </div>

                  {/* Role dropdown */}
                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-writespace-primary focus:border-writespace-primary transition-colors bg-white"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-writespace-gradient rounded-lg hover:bg-writespace-gradient-hover transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formLoading ? 'Creating…' : 'Create User'}
                  </button>
                </form>
              </div>
            </div>

            {/* Users List */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  All Users ({allUsers.length})
                </h2>
              </div>

              {allUsers.length === 0 && (
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
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No users found
                  </h3>
                  <p className="text-sm text-gray-600">
                    Create a new user using the form.
                  </p>
                </div>
              )}

              {allUsers.length > 0 && (
                <div className="space-y-3">
                  {allUsers.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      currentUser={currentUser}
                      onDelete={handleDeleteRequest}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
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
                Delete User
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this user? All their posts will also be removed. This action cannot be undone.
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
                  onClick={handleDeleteConfirm}
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