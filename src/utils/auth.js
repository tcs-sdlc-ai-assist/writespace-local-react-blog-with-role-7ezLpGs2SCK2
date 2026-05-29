import { getUsers, addUser, getSession, setSession, clearSession } from './storage.js';

/**
 * Generates a simple unique id.
 * @returns {string} A unique identifier string.
 */
function generateId() {
  return 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

/**
 * Attempts to log in a user with the given credentials.
 * Checks hard-coded admin account first, then localStorage users.
 * @param {string} username - The username to authenticate.
 * @param {string} password - The password to authenticate.
 * @returns {{ success: boolean, session?: Object, error?: string }}
 */
export function login(username, password) {
  if (!username || !password) {
    return { success: false, error: 'All fields are required' };
  }

  // Check hard-coded admin account first
  if (username === 'admin' && password === 'admin') {
    const session = {
      userId: 'u1',
      username: 'admin',
      displayName: 'Admin',
      role: 'admin',
    };
    setSession(session);
    return { success: true, session };
  }

  // Check localStorage users
  const users = getUsers();
  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) {
    return { success: false, error: 'Invalid credentials' };
  }

  const session = {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  };
  setSession(session);
  return { success: true, session };
}

/**
 * Logs out the current user by clearing the session.
 * @returns {void}
 */
export function logout() {
  clearSession();
}

/**
 * Registers a new user, validates uniqueness, creates user, and sets session.
 * @param {string} displayName - The display name for the new user.
 * @param {string} username - The desired username (must be unique).
 * @param {string} password - The password for the new user.
 * @returns {{ success: boolean, session?: Object, error?: string }}
 */
export function register(displayName, username, password) {
  if (!displayName || !username || !password) {
    return { success: false, error: 'All fields are required' };
  }

  // Check if username is reserved
  if (username === 'admin') {
    return { success: false, error: 'Username already exists' };
  }

  // Check uniqueness among existing users
  const users = getUsers();
  if (users.some((u) => u.username === username)) {
    return { success: false, error: 'Username already exists' };
  }

  const user = {
    id: generateId(),
    displayName,
    username,
    password,
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  const added = addUser(user);
  if (!added) {
    return { success: false, error: 'Failed to create user' };
  }

  const session = {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  };
  setSession(session);
  return { success: true, session };
}

/**
 * Checks whether a user is currently authenticated.
 * @returns {boolean} True if a session exists, false otherwise.
 */
export function isAuthenticated() {
  const session = getSession();
  return session !== null;
}

/**
 * Retrieves the current user's session object.
 * @returns {Object|null} The session object, or null if not authenticated.
 */
export function getCurrentUser() {
  return getSession();
}