const USERS_KEY = 'writespace_users';
const POSTS_KEY = 'writespace_posts';
const SESSION_KEY = 'writespace_session';

/**
 * Retrieves all users from localStorage.
 * @returns {Array<Object>} Array of user objects, or empty array on error.
 */
export function getUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('storage.getUsers: failed to read users', e);
    return [];
  }
}

/**
 * Adds a user to localStorage.
 * @param {Object} user - The user object to add.
 * @returns {boolean} True if successful, false otherwise.
 */
export function addUser(user) {
  try {
    const users = getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  } catch (e) {
    console.error('storage.addUser: failed to add user', e);
    return false;
  }
}

/**
 * Retrieves all posts from localStorage.
 * @returns {Array<Object>} Array of post objects, or empty array on error.
 */
export function getPosts() {
  try {
    const data = localStorage.getItem(POSTS_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('storage.getPosts: failed to read posts', e);
    return [];
  }
}

/**
 * Adds a post to localStorage.
 * @param {Object} post - The post object to add.
 * @returns {boolean} True if successful, false otherwise.
 */
export function addPost(post) {
  try {
    const posts = getPosts();
    posts.push(post);
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    return true;
  } catch (e) {
    console.error('storage.addPost: failed to add post', e);
    return false;
  }
}

/**
 * Updates an existing post in localStorage by id.
 * @param {string} id - The id of the post to update.
 * @param {Object} data - An object with fields to merge into the existing post.
 * @returns {boolean} True if the post was found and updated, false otherwise.
 */
export function updatePost(id, data) {
  try {
    const posts = getPosts();
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) return false;
    posts[index] = { ...posts[index], ...data };
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    return true;
  } catch (e) {
    console.error('storage.updatePost: failed to update post', e);
    return false;
  }
}

/**
 * Deletes a post from localStorage by id.
 * @param {string} id - The id of the post to delete.
 * @returns {boolean} True if the post was found and deleted, false otherwise.
 */
export function deletePost(id) {
  try {
    const posts = getPosts();
    const filtered = posts.filter((p) => p.id !== id);
    if (filtered.length === posts.length) return false;
    localStorage.setItem(POSTS_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('storage.deletePost: failed to delete post', e);
    return false;
  }
}

/**
 * Retrieves the current session from localStorage.
 * @returns {Object|null} The session object, or null if not found or on error.
 */
export function getSession() {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (e) {
    console.error('storage.getSession: failed to read session', e);
    return null;
  }
}

/**
 * Saves a session object to localStorage.
 * @param {Object} session - The session object to persist.
 * @returns {void}
 */
export function setSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('storage.setSession: failed to save session', e);
  }
}

/**
 * Clears the current session from localStorage.
 * @returns {void}
 */
export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error('storage.clearSession: failed to clear session', e);
  }
}