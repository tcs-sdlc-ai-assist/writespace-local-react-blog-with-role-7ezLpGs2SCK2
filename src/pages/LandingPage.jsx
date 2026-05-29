import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPosts } from '../utils/storage.js';
import { isAuthenticated } from '../utils/auth.js';
import { PublicNavbar } from '../components/PublicNavbar.jsx';

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
 * @param {number} [maxLength=100] - Maximum character length.
 * @returns {string} Truncated content string.
 */
function truncateContent(content, maxLength = 100) {
  if (!content) return '';
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength).trimEnd() + '…';
}

const features = [
  {
    title: 'Write Freely',
    description: 'Express your thoughts without limits. Create, edit, and publish blog posts with a clean, distraction-free writing experience.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    title: 'Private & Local',
    description: 'Your data stays on your device. All posts and user data are stored locally in your browser — no servers, no tracking.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: 'Instant & Fast',
    description: 'No loading spinners, no waiting. Everything runs instantly in your browser for a seamless writing and reading experience.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

/**
 * LandingPage component — public landing page at '/'.
 * Hero section with gradient background, app name, tagline, CTA buttons.
 * Features section with 3 cards.
 * Latest posts preview showing up to 3 most recent posts from localStorage.
 * Footer with navigation links and copyright.
 *
 * @returns {JSX.Element}
 */
export default function LandingPage() {
  const [latestPosts, setLatestPosts] = useState([]);
  const navigate = useNavigate();
  const authed = isAuthenticated();

  useEffect(() => {
    try {
      const posts = getPosts();
      const sorted = [...posts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setLatestPosts(sorted.slice(0, 3));
    } catch (e) {
      console.error('LandingPage: failed to load posts', e);
      setLatestPosts([]);
    }
  }, []);

  const handlePostClick = (postId) => {
    if (authed) {
      navigate(`/blog/${postId}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-writespace-gradient py-20 sm:py-28 lg:py-36">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Welcome to{' '}
            <span className="underline decoration-white/30 underline-offset-8">
              WriteSpace
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-10">
            Your personal writing space. Create, share, and explore blog posts — all stored locally in your browser. No accounts required to read, no servers to worry about.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/blogs"
              className="inline-flex items-center px-6 py-3 text-base font-medium text-writespace-primary bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              Start Reading
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 text-base font-medium text-white border-2 border-white/50 rounded-lg hover:bg-white/10 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why WriteSpace?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A simple, private, and fast blogging platform that puts you in control.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-gray-50 rounded-xl p-6 sm:p-8 text-center hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-writespace-light text-writespace-primary mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Posts Preview */}
      {latestPosts.length > 0 && (
        <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Latest Posts
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Check out what people have been writing about recently.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestPosts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => handlePostClick(post.id)}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5 text-left flex flex-col h-full"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {truncateContent(post.content)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {post.authorName || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                to="/blogs"
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-writespace-primary border border-writespace-primary rounded-lg hover:bg-writespace-light transition-colors"
              >
                View All Posts →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-2">
              <span className="bg-writespace-gradient bg-clip-text text-transparent font-bold text-lg">
                WriteSpace
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                to="/blogs"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Blogs
              </Link>
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Register
              </Link>
            </div>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} WriteSpace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}