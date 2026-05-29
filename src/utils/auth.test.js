import { describe, it, expect, beforeEach } from 'vitest';
import {
  login,
  logout,
  register,
  isAuthenticated,
  getCurrentUser,
} from './auth.js';
import { getUsers, getSession, clearSession } from './storage.js';

beforeEach(() => {
  localStorage.clear();
});

describe('login', () => {
  it('authenticates the hard-coded admin with admin/admin', () => {
    const result = login('admin', 'admin');
    expect(result.success).toBe(true);
    expect(result.session).toEqual({
      userId: 'u1',
      username: 'admin',
      displayName: 'Admin',
      role: 'admin',
    });
  });

  it('sets session in localStorage after admin login', () => {
    login('admin', 'admin');
    const session = getSession();
    expect(session).not.toBeNull();
    expect(session.userId).toBe('u1');
    expect(session.role).toBe('admin');
  });

  it('authenticates a user stored in localStorage', () => {
    const mockUsers = [
      {
        id: 'u99',
        displayName: 'Alice',
        username: 'alice',
        password: 'secret',
        role: 'user',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    ];
    localStorage.setItem('writespace_users', JSON.stringify(mockUsers));

    const result = login('alice', 'secret');
    expect(result.success).toBe(true);
    expect(result.session).toEqual({
      userId: 'u99',
      username: 'alice',
      displayName: 'Alice',
      role: 'user',
    });
  });

  it('sets session in localStorage after user login', () => {
    const mockUsers = [
      {
        id: 'u99',
        displayName: 'Alice',
        username: 'alice',
        password: 'secret',
        role: 'user',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    ];
    localStorage.setItem('writespace_users', JSON.stringify(mockUsers));

    login('alice', 'secret');
    const session = getSession();
    expect(session).not.toBeNull();
    expect(session.username).toBe('alice');
  });

  it('returns error for invalid credentials', () => {
    const result = login('nonexistent', 'wrongpassword');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid credentials');
  });

  it('returns error for correct username but wrong password', () => {
    const mockUsers = [
      {
        id: 'u99',
        displayName: 'Alice',
        username: 'alice',
        password: 'secret',
        role: 'user',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    ];
    localStorage.setItem('writespace_users', JSON.stringify(mockUsers));

    const result = login('alice', 'wrongpassword');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid credentials');
  });

  it('returns error when username is empty', () => {
    const result = login('', 'password');
    expect(result.success).toBe(false);
    expect(result.error).toBe('All fields are required');
  });

  it('returns error when password is empty', () => {
    const result = login('admin', '');
    expect(result.success).toBe(false);
    expect(result.error).toBe('All fields are required');
  });

  it('returns error when both fields are empty', () => {
    const result = login('', '');
    expect(result.success).toBe(false);
    expect(result.error).toBe('All fields are required');
  });

  it('prioritizes hard-coded admin over localStorage user with same username', () => {
    const mockUsers = [
      {
        id: 'u50',
        displayName: 'Fake Admin',
        username: 'admin',
        password: 'differentpassword',
        role: 'user',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    ];
    localStorage.setItem('writespace_users', JSON.stringify(mockUsers));

    const result = login('admin', 'admin');
    expect(result.success).toBe(true);
    expect(result.session.userId).toBe('u1');
    expect(result.session.role).toBe('admin');
  });
});

describe('logout', () => {
  it('clears the session from localStorage', () => {
    login('admin', 'admin');
    expect(getSession()).not.toBeNull();
    logout();
    expect(getSession()).toBeNull();
  });

  it('does not throw when no session exists', () => {
    expect(() => logout()).not.toThrow();
  });
});

describe('register', () => {
  it('registers a new user with unique username', () => {
    const result = register('Bob', 'bob', 'password123');
    expect(result.success).toBe(true);
    expect(result.session).toBeDefined();
    expect(result.session.username).toBe('bob');
    expect(result.session.displayName).toBe('Bob');
    expect(result.session.role).toBe('user');
  });

  it('stores the new user in localStorage', () => {
    register('Bob', 'bob', 'password123');
    const users = getUsers();
    expect(users).toHaveLength(1);
    expect(users[0].username).toBe('bob');
    expect(users[0].displayName).toBe('Bob');
    expect(users[0].password).toBe('password123');
    expect(users[0].role).toBe('user');
    expect(users[0].id).toBeDefined();
    expect(users[0].createdAt).toBeDefined();
  });

  it('sets session after successful registration', () => {
    register('Bob', 'bob', 'password123');
    const session = getSession();
    expect(session).not.toBeNull();
    expect(session.username).toBe('bob');
    expect(session.role).toBe('user');
  });

  it('returns error for duplicate username', () => {
    register('Bob', 'bob', 'password123');
    const result = register('Bob Two', 'bob', 'otherpassword');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Username already exists');
  });

  it('returns error when trying to register with reserved admin username', () => {
    const result = register('Fake Admin', 'admin', 'password');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Username already exists');
  });

  it('returns error when displayName is empty', () => {
    const result = register('', 'bob', 'password');
    expect(result.success).toBe(false);
    expect(result.error).toBe('All fields are required');
  });

  it('returns error when username is empty', () => {
    const result = register('Bob', '', 'password');
    expect(result.success).toBe(false);
    expect(result.error).toBe('All fields are required');
  });

  it('returns error when password is empty', () => {
    const result = register('Bob', 'bob', '');
    expect(result.success).toBe(false);
    expect(result.error).toBe('All fields are required');
  });

  it('always assigns user role to registered accounts', () => {
    const result = register('Charlie', 'charlie', 'pw');
    expect(result.success).toBe(true);
    expect(result.session.role).toBe('user');
    const users = getUsers();
    expect(users[0].role).toBe('user');
  });

  it('allows multiple unique registrations', () => {
    register('Alice', 'alice', 'pw1');
    clearSession();
    register('Bob', 'bob', 'pw2');
    const users = getUsers();
    expect(users).toHaveLength(2);
    expect(users[0].username).toBe('alice');
    expect(users[1].username).toBe('bob');
  });
});

describe('isAuthenticated', () => {
  it('returns false when no session exists', () => {
    expect(isAuthenticated()).toBe(false);
  });

  it('returns true after login', () => {
    login('admin', 'admin');
    expect(isAuthenticated()).toBe(true);
  });

  it('returns true after registration', () => {
    register('Bob', 'bob', 'pw');
    expect(isAuthenticated()).toBe(true);
  });

  it('returns false after logout', () => {
    login('admin', 'admin');
    logout();
    expect(isAuthenticated()).toBe(false);
  });
});

describe('getCurrentUser', () => {
  it('returns null when no session exists', () => {
    expect(getCurrentUser()).toBeNull();
  });

  it('returns the session object after admin login', () => {
    login('admin', 'admin');
    const user = getCurrentUser();
    expect(user).toEqual({
      userId: 'u1',
      username: 'admin',
      displayName: 'Admin',
      role: 'admin',
    });
  });

  it('returns the session object after user login', () => {
    const mockUsers = [
      {
        id: 'u99',
        displayName: 'Alice',
        username: 'alice',
        password: 'secret',
        role: 'user',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    ];
    localStorage.setItem('writespace_users', JSON.stringify(mockUsers));

    login('alice', 'secret');
    const user = getCurrentUser();
    expect(user).toEqual({
      userId: 'u99',
      username: 'alice',
      displayName: 'Alice',
      role: 'user',
    });
  });

  it('returns the session object after registration', () => {
    register('Bob', 'bob', 'pw');
    const user = getCurrentUser();
    expect(user).not.toBeNull();
    expect(user.username).toBe('bob');
    expect(user.displayName).toBe('Bob');
    expect(user.role).toBe('user');
  });

  it('returns null after logout', () => {
    login('admin', 'admin');
    logout();
    expect(getCurrentUser()).toBeNull();
  });
});

describe('auth flow integration', () => {
  it('register then logout then login with same credentials', () => {
    const regResult = register('Dave', 'dave', 'mypassword');
    expect(regResult.success).toBe(true);

    logout();
    expect(isAuthenticated()).toBe(false);

    const loginResult = login('dave', 'mypassword');
    expect(loginResult.success).toBe(true);
    expect(loginResult.session.username).toBe('dave');
    expect(loginResult.session.displayName).toBe('Dave');
    expect(loginResult.session.role).toBe('user');
  });

  it('login overwrites existing session', () => {
    login('admin', 'admin');
    expect(getCurrentUser().role).toBe('admin');

    register('Eve', 'eve', 'pw');
    expect(getCurrentUser().username).toBe('eve');
    expect(getCurrentUser().role).toBe('user');
  });
});