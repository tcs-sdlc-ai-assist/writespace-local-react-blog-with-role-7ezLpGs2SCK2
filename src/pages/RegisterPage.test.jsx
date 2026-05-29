import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage.jsx';
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

function renderRegisterPage() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <RegisterPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  auth.isAuthenticated.mockReturnValue(false);
  auth.getCurrentUser.mockReturnValue(null);
  storage.getSession.mockReturnValue(null);
});

describe('RegisterPage', () => {
  describe('form rendering', () => {
    it('renders the register page heading', () => {
      renderRegisterPage();

      expect(screen.getByText('Create your account')).toBeInTheDocument();
    });

    it('renders all form fields', () => {
      renderRegisterPage();

      expect(screen.getByLabelText('Display Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    });

    it('renders the Create Account button', () => {
      renderRegisterPage();

      expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    });

    it('renders a link to the login page', () => {
      renderRegisterPage();

      expect(screen.getByText('Sign in')).toBeInTheDocument();
    });

    it('renders placeholder text for inputs', () => {
      renderRegisterPage();

      expect(screen.getByPlaceholderText('Enter your display name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Choose a username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Create a password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
    });
  });

  describe('successful registration', () => {
    it('navigates to /blogs on successful registration', async () => {
      const user = userEvent.setup();
      auth.register.mockReturnValue({
        success: true,
        session: {
          userId: 'u99',
          username: 'alice',
          displayName: 'Alice',
          role: 'user',
        },
      });

      renderRegisterPage();

      await user.type(screen.getByLabelText('Display Name'), 'Alice');
      await user.type(screen.getByLabelText('Username'), 'alice');
      await user.type(screen.getByLabelText('Password'), 'secret');
      await user.type(screen.getByLabelText('Confirm Password'), 'secret');
      await user.click(screen.getByRole('button', { name: 'Create Account' }));

      expect(auth.register).toHaveBeenCalledWith('Alice', 'alice', 'secret');
      expect(mockNavigate).toHaveBeenCalledWith('/blogs', { replace: true });
    });
  });

  describe('validation errors', () => {
    it('displays error when all fields are empty', async () => {
      const user = userEvent.setup();

      renderRegisterPage();

      await user.click(screen.getByRole('button', { name: 'Create Account' }));

      expect(screen.getByText('All fields are required')).toBeInTheDocument();
      expect(auth.register).not.toHaveBeenCalled();
    });

    it('displays error when display name is empty', async () => {
      const user = userEvent.setup();

      renderRegisterPage();

      await user.type(screen.getByLabelText('Username'), 'alice');
      await user.type(screen.getByLabelText('Password'), 'secret');
      await user.type(screen.getByLabelText('Confirm Password'), 'secret');
      await user.click(screen.getByRole('button', { name: 'Create Account' }));

      expect(screen.getByText('All fields are required')).toBeInTheDocument();
      expect(auth.register).not.toHaveBeenCalled();
    });

    it('displays error when username is empty', async () => {
      const user = userEvent.setup();

      renderRegisterPage();

      await user.type(screen.getByLabelText('Display Name'), 'Alice');
      await user.type(screen.getByLabelText('Password'), 'secret');
      await user.type(screen.getByLabelText('Confirm Password'), 'secret');
      await user.click(screen.getByRole('button', { name: 'Create Account' }));

      expect(screen.getByText('All fields are required')).toBeInTheDocument();
      expect(auth.register).not.toHaveBeenCalled();
    });

    it('displays error when password is empty', async () => {
      const user = userEvent.setup();

      renderRegisterPage();

      await user.type(screen.getByLabelText('Display Name'), 'Alice');
      await user.type(screen.getByLabelText('Username'), 'alice');
      await user.type(screen.getByLabelText('Confirm Password'), 'secret');
      await user.click(screen.getByRole('button', { name: 'Create Account' }));

      expect(screen.getByText('All fields are required')).toBeInTheDocument();
      expect(auth.register).not.toHaveBeenCalled();
    });

    it('displays error when confirm password is empty', async () => {
      const user = userEvent.setup();

      renderRegisterPage();

      await user.type(screen.getByLabelText('Display Name'), 'Alice');
      await user.type(screen.getByLabelText('Username'), 'alice');
      await user.type(screen.getByLabelText('Password'), 'secret');
      await user.click(screen.getByRole('button', { name: 'Create Account' }));

      expect(screen.getByText('All fields are required')).toBeInTheDocument();
      expect(auth.register).not.toHaveBeenCalled();
    });

    it('displays error when passwords do not match', async () => {
      const user = userEvent.setup();

      renderRegisterPage();

      await user.type(screen.getByLabelText('Display Name'), 'Alice');
      await user.type(screen.getByLabelText('Username'), 'alice');
      await user.type(screen.getByLabelText('Password'), 'secret');
      await user.type(screen.getByLabelText('Confirm Password'), 'different');
      await user.click(screen.getByRole('button', { name: 'Create Account' }));

      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      expect(auth.register).not.toHaveBeenCalled();
    });

    it('displays error when username already exists', async () => {
      const user = userEvent.setup();
      auth.register.mockReturnValue({
        success: false,
        error: 'Username already exists',
      });

      renderRegisterPage();

      await user.type(screen.getByLabelText('Display Name'), 'Alice');
      await user.type(screen.getByLabelText('Username'), 'admin');
      await user.type(screen.getByLabelText('Password'), 'secret');
      await user.type(screen.getByLabelText('Confirm Password'), 'secret');
      await user.click(screen.getByRole('button', { name: 'Create Account' }));

      expect(screen.getByText('Username already exists')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
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

      renderRegisterPage();

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

      renderRegisterPage();

      expect(mockNavigate).toHaveBeenCalledWith('/blogs', { replace: true });
    });
  });

  describe('error handling', () => {
    it('displays unexpected error message when register throws', async () => {
      const user = userEvent.setup();
      auth.register.mockImplementation(() => {
        throw new Error('Unexpected failure');
      });

      renderRegisterPage();

      await user.type(screen.getByLabelText('Display Name'), 'Alice');
      await user.type(screen.getByLabelText('Username'), 'alice');
      await user.type(screen.getByLabelText('Password'), 'secret');
      await user.type(screen.getByLabelText('Confirm Password'), 'secret');
      await user.click(screen.getByRole('button', { name: 'Create Account' }));

      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
    });

    it('clears previous error when submitting again', async () => {
      const user = userEvent.setup();
      auth.register
        .mockReturnValueOnce({
          success: false,
          error: 'Username already exists',
        })
        .mockReturnValueOnce({
          success: true,
          session: {
            userId: 'u99',
            username: 'alice2',
            displayName: 'Alice',
            role: 'user',
          },
        });

      renderRegisterPage();

      await user.type(screen.getByLabelText('Display Name'), 'Alice');
      await user.type(screen.getByLabelText('Username'), 'alice');
      await user.type(screen.getByLabelText('Password'), 'secret');
      await user.type(screen.getByLabelText('Confirm Password'), 'secret');
      await user.click(screen.getByRole('button', { name: 'Create Account' }));

      expect(screen.getByText('Username already exists')).toBeInTheDocument();

      await user.clear(screen.getByLabelText('Username'));
      await user.type(screen.getByLabelText('Username'), 'alice2');
      await user.click(screen.getByRole('button', { name: 'Create Account' }));

      expect(screen.queryByText('Username already exists')).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/blogs', { replace: true });
    });

    it('displays registration failed error from auth module', async () => {
      const user = userEvent.setup();
      auth.register.mockReturnValue({
        success: false,
        error: 'Registration failed',
      });

      renderRegisterPage();

      await user.type(screen.getByLabelText('Display Name'), 'Alice');
      await user.type(screen.getByLabelText('Username'), 'alice');
      await user.type(screen.getByLabelText('Password'), 'secret');
      await user.type(screen.getByLabelText('Confirm Password'), 'secret');
      await user.click(screen.getByRole('button', { name: 'Create Account' }));

      expect(screen.getByText('Registration failed')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});