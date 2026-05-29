import { describe, it, expect, beforeEach } from 'vitest';
import {
  getUsers,
  addUser,
  getPosts,
  addPost,
  updatePost,
  deletePost,
  getSession,
  setSession,
  clearSession,
} from './storage.js';

beforeEach(() => {
  localStorage.clear();
});

describe('getUsers', () => {
  it('returns an empty array when no users exist', () => {
    const users = getUsers();
    expect(users).toEqual([]);
  });

  it('returns stored users', () => {
    const mockUsers = [
      { id: 'u1', displayName: 'Alice', username: 'alice', password: 'pw', role: 'user', createdAt: '2024-01-01T00:00:00.000Z' },
    ];
    localStorage.setItem('writespace_users', JSON.stringify(mockUsers));
    const users = getUsers();
    expect(users).toEqual(mockUsers);
    expect(users).toHaveLength(1);
  });

  it('returns an empty array when localStorage contains invalid JSON', () => {
    localStorage.setItem('writespace_users', 'not-json');
    const users = getUsers();
    expect(users).toEqual([]);
  });

  it('returns an empty array when localStorage contains a non-array value', () => {
    localStorage.setItem('writespace_users', JSON.stringify({ foo: 'bar' }));
    const users = getUsers();
    expect(users).toEqual([]);
  });
});

describe('addUser', () => {
  it('adds a user to an empty store and returns true', () => {
    const user = { id: 'u2', displayName: 'Bob', username: 'bob', password: 'pw', role: 'user', createdAt: '2024-01-02T00:00:00.000Z' };
    const result = addUser(user);
    expect(result).toBe(true);
    const users = getUsers();
    expect(users).toHaveLength(1);
    expect(users[0]).toEqual(user);
  });

  it('appends a user to existing users', () => {
    const user1 = { id: 'u1', displayName: 'Alice', username: 'alice', password: 'pw', role: 'user', createdAt: '2024-01-01T00:00:00.000Z' };
    const user2 = { id: 'u2', displayName: 'Bob', username: 'bob', password: 'pw', role: 'admin', createdAt: '2024-01-02T00:00:00.000Z' };
    addUser(user1);
    addUser(user2);
    const users = getUsers();
    expect(users).toHaveLength(2);
    expect(users[0].id).toBe('u1');
    expect(users[1].id).toBe('u2');
  });
});

describe('getPosts', () => {
  it('returns an empty array when no posts exist', () => {
    const posts = getPosts();
    expect(posts).toEqual([]);
  });

  it('returns stored posts', () => {
    const mockPosts = [
      { id: 'p1', title: 'Hello', content: 'World', createdAt: '2024-01-01T00:00:00.000Z', authorId: 'u1', authorName: 'Admin' },
    ];
    localStorage.setItem('writespace_posts', JSON.stringify(mockPosts));
    const posts = getPosts();
    expect(posts).toEqual(mockPosts);
  });

  it('returns an empty array when localStorage contains invalid JSON', () => {
    localStorage.setItem('writespace_posts', '{broken');
    const posts = getPosts();
    expect(posts).toEqual([]);
  });

  it('returns an empty array when localStorage contains a non-array value', () => {
    localStorage.setItem('writespace_posts', JSON.stringify('string'));
    const posts = getPosts();
    expect(posts).toEqual([]);
  });
});

describe('addPost', () => {
  it('adds a post to an empty store and returns true', () => {
    const post = { id: 'p1', title: 'Test', content: 'Content', createdAt: '2024-01-01T00:00:00.000Z', authorId: 'u1', authorName: 'Admin' };
    const result = addPost(post);
    expect(result).toBe(true);
    const posts = getPosts();
    expect(posts).toHaveLength(1);
    expect(posts[0]).toEqual(post);
  });

  it('appends a post to existing posts', () => {
    const post1 = { id: 'p1', title: 'First', content: 'Content 1', createdAt: '2024-01-01T00:00:00.000Z', authorId: 'u1', authorName: 'Admin' };
    const post2 = { id: 'p2', title: 'Second', content: 'Content 2', createdAt: '2024-01-02T00:00:00.000Z', authorId: 'u2', authorName: 'Bob' };
    addPost(post1);
    addPost(post2);
    const posts = getPosts();
    expect(posts).toHaveLength(2);
    expect(posts[1].id).toBe('p2');
  });
});

describe('updatePost', () => {
  it('updates an existing post and returns true', () => {
    const post = { id: 'p1', title: 'Original', content: 'Original content', createdAt: '2024-01-01T00:00:00.000Z', authorId: 'u1', authorName: 'Admin' };
    addPost(post);
    const result = updatePost('p1', { title: 'Updated Title', updatedAt: '2024-06-01T00:00:00.000Z' });
    expect(result).toBe(true);
    const posts = getPosts();
    expect(posts[0].title).toBe('Updated Title');
    expect(posts[0].content).toBe('Original content');
    expect(posts[0].updatedAt).toBe('2024-06-01T00:00:00.000Z');
  });

  it('returns false when the post does not exist', () => {
    const result = updatePost('nonexistent', { title: 'Nope' });
    expect(result).toBe(false);
  });

  it('returns false when no posts are stored', () => {
    const result = updatePost('p1', { title: 'Nope' });
    expect(result).toBe(false);
  });

  it('preserves other posts when updating one', () => {
    const post1 = { id: 'p1', title: 'First', content: 'C1', createdAt: '2024-01-01T00:00:00.000Z', authorId: 'u1', authorName: 'Admin' };
    const post2 = { id: 'p2', title: 'Second', content: 'C2', createdAt: '2024-01-02T00:00:00.000Z', authorId: 'u2', authorName: 'Bob' };
    addPost(post1);
    addPost(post2);
    updatePost('p1', { title: 'Updated First' });
    const posts = getPosts();
    expect(posts).toHaveLength(2);
    expect(posts[0].title).toBe('Updated First');
    expect(posts[1].title).toBe('Second');
  });
});

describe('deletePost', () => {
  it('deletes an existing post and returns true', () => {
    const post = { id: 'p1', title: 'To Delete', content: 'Content', createdAt: '2024-01-01T00:00:00.000Z', authorId: 'u1', authorName: 'Admin' };
    addPost(post);
    const result = deletePost('p1');
    expect(result).toBe(true);
    const posts = getPosts();
    expect(posts).toHaveLength(0);
  });

  it('returns false when the post does not exist', () => {
    const result = deletePost('nonexistent');
    expect(result).toBe(false);
  });

  it('returns false when no posts are stored', () => {
    const result = deletePost('p1');
    expect(result).toBe(false);
  });

  it('only removes the targeted post and preserves others', () => {
    const post1 = { id: 'p1', title: 'Keep', content: 'C1', createdAt: '2024-01-01T00:00:00.000Z', authorId: 'u1', authorName: 'Admin' };
    const post2 = { id: 'p2', title: 'Delete', content: 'C2', createdAt: '2024-01-02T00:00:00.000Z', authorId: 'u2', authorName: 'Bob' };
    addPost(post1);
    addPost(post2);
    deletePost('p2');
    const posts = getPosts();
    expect(posts).toHaveLength(1);
    expect(posts[0].id).toBe('p1');
  });
});

describe('getSession', () => {
  it('returns null when no session exists', () => {
    const session = getSession();
    expect(session).toBeNull();
  });

  it('returns the stored session object', () => {
    const mockSession = { userId: 'u1', username: 'admin', displayName: 'Admin', role: 'admin' };
    localStorage.setItem('writespace_session', JSON.stringify(mockSession));
    const session = getSession();
    expect(session).toEqual(mockSession);
  });

  it('returns null when localStorage contains invalid JSON for session', () => {
    localStorage.setItem('writespace_session', 'invalid-json');
    const session = getSession();
    expect(session).toBeNull();
  });
});

describe('setSession', () => {
  it('stores a session object in localStorage', () => {
    const session = { userId: 'u1', username: 'admin', displayName: 'Admin', role: 'admin' };
    setSession(session);
    const stored = getSession();
    expect(stored).toEqual(session);
  });

  it('overwrites an existing session', () => {
    const session1 = { userId: 'u1', username: 'admin', displayName: 'Admin', role: 'admin' };
    const session2 = { userId: 'u2', username: 'bob', displayName: 'Bob', role: 'user' };
    setSession(session1);
    setSession(session2);
    const stored = getSession();
    expect(stored).toEqual(session2);
  });
});

describe('clearSession', () => {
  it('removes the session from localStorage', () => {
    const session = { userId: 'u1', username: 'admin', displayName: 'Admin', role: 'admin' };
    setSession(session);
    clearSession();
    const stored = getSession();
    expect(stored).toBeNull();
  });

  it('does not throw when no session exists', () => {
    expect(() => clearSession()).not.toThrow();
  });
});

describe('data integrity across operations', () => {
  it('maintains separate storage for users and posts', () => {
    const user = { id: 'u1', displayName: 'Alice', username: 'alice', password: 'pw', role: 'user', createdAt: '2024-01-01T00:00:00.000Z' };
    const post = { id: 'p1', title: 'Post', content: 'Content', createdAt: '2024-01-01T00:00:00.000Z', authorId: 'u1', authorName: 'Alice' };
    addUser(user);
    addPost(post);
    expect(getUsers()).toHaveLength(1);
    expect(getPosts()).toHaveLength(1);
    deletePost('p1');
    expect(getUsers()).toHaveLength(1);
    expect(getPosts()).toHaveLength(0);
  });

  it('session operations do not affect users or posts', () => {
    const user = { id: 'u1', displayName: 'Alice', username: 'alice', password: 'pw', role: 'user', createdAt: '2024-01-01T00:00:00.000Z' };
    const post = { id: 'p1', title: 'Post', content: 'Content', createdAt: '2024-01-01T00:00:00.000Z', authorId: 'u1', authorName: 'Alice' };
    addUser(user);
    addPost(post);
    setSession({ userId: 'u1', username: 'alice', displayName: 'Alice', role: 'user' });
    clearSession();
    expect(getUsers()).toHaveLength(1);
    expect(getPosts()).toHaveLength(1);
    expect(getSession()).toBeNull();
  });
});