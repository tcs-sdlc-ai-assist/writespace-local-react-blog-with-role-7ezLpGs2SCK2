import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage.jsx';
import * as auth from '../utils/auth.js';
import * as storage from '../utils/storage.js';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../utils/auth.js', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  isAuthenticated: vi.fn(() => false),
  getCurrentUser: vi.fn(() => null),
}));

vi.mock('../utils/storage.js', () => ({
  getUsers: vi.fn(() => []),
  addUser: vi.fn(),
  getPosts: vi.fn(() => []),
  addPost: vi.fn(),
  updatePost: vi.fn(),
  deletePost: vi.fn(),
  getSession: vi.fn(() => null),
  setSession: vi.fn(),
  clearSession: vi.fn(),
}));

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <LoginPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  auth.isAuthenticated.mockReturnValue(false);
  auth.getCurrentUser.mockReturnValue(null);
  storage.getSession.mockReturnValue(null);
});

describe('LoginPage', () => {
  describe('form rendering', () => {
    it('renders the login page heading', () => {
      renderLoginPage();

      expect(screen.getByText('Welcome back')).toBeInTheDocument();
    });

    it('renders username and password fields', () => {
      renderLoginPage();

      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('renders the Sign In button', () => {
      renderLoginPage();

      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });

    it('renders a link to the register page', () => {
      renderLoginPage();

      expect(screen.getByText('Create one')).toBeInTheDocument();
    });

    it('renders placeholder text for inputs', () => {
      renderLoginPage();

      expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    });
  });

  describe('successful admin login', () => {
    it('navigates to /admin on successful admin login', async () => {
      const user = userEvent.setup();
      auth.login.mockReturnValue({
        success: true,
        session: {
          userId: 'u1',
          username: 'admin',
          displayName: 'Admin',
          role: 'admin',
        },
      });

      renderLoginPage();

      await user.type(screen.getByLabelText('Username'), 'admin');
      await user.type(screen.getByLabelText('Password'), 'admin');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      expect(auth.login).toHaveBeenCalledWith('admin', 'admin');
      expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true });
    });
  });

  describe('successful user login', () => {
    it('navigates to /blogs on successful user login', async () => {
      const user = userEvent.setup();
      auth.login.mockReturnValue({
        success: true,
        session: {
          userId: 'u99',
          username: 'alice',
          displayName: 'Alice',
          role: 'user',
        },
      });

      renderLoginPage();

      await user.type(screen.getByLabelText('Username'), 'alice');
      await user.type(screen.getByLabelText('Password'), 'secret');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      expect(auth.login).toHaveBeenCalledWith('alice', 'secret');
      expect(mockNavigate).toHaveBeenCalledWith('/blogs', { replace: true });
    });
  });

  describe('failed login', () => {
    it('displays error message on invalid credentials', async () => {
      const user = userEvent.setup();
      auth.login.mockReturnValue({
        success: false,
        error: 'Invalid credentials',
      });

      renderLoginPage();

      await user.type(screen.getByLabelText('Username'), 'wrong');
      await user.type(screen.getByLabelText('Password'), 'wrong');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('displays error when fields are empty', async () => {
      const user = userEvent.setup();

      renderLoginPage();

      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      expect(screen.getByText('All fields are required')).toBeInTheDocument();
      expect(auth.login).not.toHaveBeenCalled();
    });

    it('displays error when username is empty but password is filled', async () => {
      const user = userEvent.setup();

      renderLoginPage();

      await user.type(screen.getByLabelText('Password'), 'somepassword');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      expect(screen.getByText('All fields are required')).toBeInTheDocument();
      expect(auth.login).not.toHaveBeenCalled();
    });

    it('displays error when password is empty but username is filled', async () => {
      const user = userEvent.setup();

      renderLoginPage();

      await user.type(screen.getByLabelText('Username'), 'someuser');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      expect(screen.getByText('All fields are required')).toBeInTheDocument();
      expect(auth.login).not.toHaveBeenCalled();
    });
  });

  describe('redirect when already authenticated', () => {
    it('redirects admin to /admin when already authenticated', () => {
      auth.isAuthenticated.mockReturnValue(true);
      auth.getCurrentUser.mockReturnValue({
        userId: 'u1',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      });

      renderLoginPage();

      expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true });
    });

    it('redirects regular user to /blogs when already authenticated', () => {
      auth.isAuthenticated.mockReturnValue(true);
      auth.getCurrentUser.mockReturnValue({
        userId: 'u99',
        username: 'alice',
        displayName: 'Alice',
        role: 'user',
      });

      renderLoginPage();

      expect(mockNavigate).toHaveBeenCalledWith('/blogs', { replace: true });
    });
  });

  describe('error handling', () => {
    it('displays unexpected error message when login throws', async () => {
      const user = userEvent.setup();
      auth.login.mockImplementation(() => {
        throw new Error('Unexpected failure');
      });

      renderLoginPage();

      await user.type(screen.getByLabelText('Username'), 'admin');
      await user.type(screen.getByLabelText('Password'), 'admin');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
    });

    it('clears previous error when submitting again', async () => {
      const user = userEvent.setup();
      auth.login
        .mockReturnValueOnce({
          success: false,
          error: 'Invalid credentials',
        })
        .mockReturnValueOnce({
          success: true,
          session: {
            userId: 'u99',
            username: 'alice',
            displayName: 'Alice',
            role: 'user',
          },
        });

      renderLoginPage();

      await user.type(screen.getByLabelText('Username'), 'alice');
      await user.type(screen.getByLabelText('Password'), 'wrong');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();

      await user.clear(screen.getByLabelText('Password'));
      await user.type(screen.getByLabelText('Password'), 'secret');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/blogs', { replace: true });
    });
  });
});