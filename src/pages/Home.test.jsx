import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home.jsx';
import * as storage from '../utils/storage.js';
import * as auth from '../utils/auth.js';

vi.mock('../utils/storage.js', () => ({
  getPosts: vi.fn(),
  getUsers: vi.fn(() => []),
  addUser: vi.fn(),
  addPost: vi.fn(),
  updatePost: vi.fn(),
  deletePost: vi.fn(),
  getSession: vi.fn(),
  setSession: vi.fn(),
  clearSession: vi.fn(),
}));

vi.mock('../utils/auth.js', () => ({
  getCurrentUser: vi.fn(),
  isAuthenticated: vi.fn(() => true),
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
}));

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
}

const mockUser = {
  userId: 'u99',
  username: 'alice',
  displayName: 'Alice',
  role: 'user',
};

const mockAdmin = {
  userId: 'u1',
  username: 'admin',
  displayName: 'Admin',
  role: 'admin',
};

const mockPosts = [
  {
    id: 'p1',
    title: 'First Post',
    content: 'Content of the first post',
    createdAt: '2024-01-01T00:00:00.000Z',
    authorId: 'u99',
    authorName: 'Alice',
  },
  {
    id: 'p2',
    title: 'Second Post',
    content: 'Content of the second post',
    createdAt: '2024-06-15T00:00:00.000Z',
    authorId: 'u50',
    authorName: 'Bob',
  },
  {
    id: 'p3',
    title: 'Third Post',
    content: 'Content of the third post',
    createdAt: '2024-12-01T00:00:00.000Z',
    authorId: 'u99',
    authorName: 'Alice',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  auth.getCurrentUser.mockReturnValue(mockUser);
  auth.isAuthenticated.mockReturnValue(true);
  storage.getSession.mockReturnValue(mockUser);
});

describe('Home', () => {
  describe('rendering blog cards', () => {
    it('renders all blog post titles when posts exist', () => {
      storage.getPosts.mockReturnValue(mockPosts);

      renderHome();

      expect(screen.getByText('First Post')).toBeInTheDocument();
      expect(screen.getByText('Second Post')).toBeInTheDocument();
      expect(screen.getByText('Third Post')).toBeInTheDocument();
    });

    it('renders author names on blog cards', () => {
      storage.getPosts.mockReturnValue(mockPosts);

      renderHome();

      const aliceElements = screen.getAllByText('Alice');
      expect(aliceElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('renders the page heading', () => {
      storage.getPosts.mockReturnValue(mockPosts);

      renderHome();

      expect(screen.getByText('All Blogs')).toBeInTheDocument();
      expect(screen.getByText('Explore the latest posts from the community')).toBeInTheDocument();
    });

    it('renders "New Post" link', () => {
      storage.getPosts.mockReturnValue(mockPosts);

      renderHome();

      expect(screen.getByText('New Post')).toBeInTheDocument();
    });

    it('renders "Read more" links for each post', () => {
      storage.getPosts.mockReturnValue(mockPosts);

      renderHome();

      const readMoreLinks = screen.getAllByText('Read more →');
      expect(readMoreLinks).toHaveLength(3);
    });
  });

  describe('empty state', () => {
    it('shows empty state message when no posts exist', () => {
      storage.getPosts.mockReturnValue([]);

      renderHome();

      expect(screen.getByText('No posts yet')).toBeInTheDocument();
      expect(
        screen.getByText('It looks like no one has written anything yet. Be the first to share your thoughts!')
      ).toBeInTheDocument();
    });

    it('shows "Write your first post" CTA in empty state', () => {
      storage.getPosts.mockReturnValue([]);

      renderHome();

      expect(screen.getByText('Write your first post')).toBeInTheDocument();
    });

    it('does not render blog cards in empty state', () => {
      storage.getPosts.mockReturnValue([]);

      renderHome();

      expect(screen.queryByText('Read more →')).not.toBeInTheDocument();
    });
  });

  describe('sorting newest first', () => {
    it('renders posts sorted by newest first', () => {
      storage.getPosts.mockReturnValue(mockPosts);

      renderHome();

      const titles = screen.getAllByRole('heading', { level: 3 });
      expect(titles[0]).toHaveTextContent('Third Post');
      expect(titles[1]).toHaveTextContent('Second Post');
      expect(titles[2]).toHaveTextContent('First Post');
    });
  });

  describe('edit icon visibility based on role/ownership', () => {
    it('shows edit icon on posts owned by the current user', () => {
      storage.getPosts.mockReturnValue([mockPosts[0]]);
      auth.getCurrentUser.mockReturnValue(mockUser);
      storage.getSession.mockReturnValue(mockUser);

      renderHome();

      const editLink = screen.getByLabelText('Edit post: First Post');
      expect(editLink).toBeInTheDocument();
    });

    it('does not show edit icon on posts not owned by a regular user', () => {
      storage.getPosts.mockReturnValue([mockPosts[1]]);
      auth.getCurrentUser.mockReturnValue(mockUser);
      storage.getSession.mockReturnValue(mockUser);

      renderHome();

      expect(screen.queryByLabelText('Edit post: Second Post')).not.toBeInTheDocument();
    });

    it('shows edit icon on all posts for admin user', () => {
      storage.getPosts.mockReturnValue(mockPosts);
      auth.getCurrentUser.mockReturnValue(mockAdmin);
      storage.getSession.mockReturnValue(mockAdmin);

      renderHome();

      expect(screen.getByLabelText('Edit post: First Post')).toBeInTheDocument();
      expect(screen.getByLabelText('Edit post: Second Post')).toBeInTheDocument();
      expect(screen.getByLabelText('Edit post: Third Post')).toBeInTheDocument();
    });

    it('does not show any edit icons when currentUser is null', () => {
      storage.getPosts.mockReturnValue(mockPosts);
      auth.getCurrentUser.mockReturnValue(null);
      storage.getSession.mockReturnValue(null);

      renderHome();

      expect(screen.queryByLabelText('Edit post: First Post')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Edit post: Second Post')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Edit post: Third Post')).not.toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('shows empty state when getPosts throws an error', () => {
      storage.getPosts.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      renderHome();

      expect(screen.getByText('No posts yet')).toBeInTheDocument();
    });
  });
});