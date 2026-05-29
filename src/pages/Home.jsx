import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../utils/storage.js';
import { getCurrentUser } from '../utils/auth.js';
import { Navbar } from '../components/Navbar.jsx';
import { BlogCard } from '../components/BlogCard.jsx';

/**
 * Home component — authenticated blog list page at '/blogs'.
 * Displays all posts in a responsive grid (1-col mobile, 2-col tablet, 3-col desktop).
 * Posts are sorted newest first.
 * Shows empty state with CTA to write first post if no posts exist.
 *
 * @returns {JSX.Element}
 */
export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();

  useEffect(() => {
    try {
      const allPosts = getPosts();
      const sorted = [...allPosts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setPosts(sorted);
    } catch (e) {
      console.error('Home: failed to load posts', e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              All Blogs
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Explore the latest posts from the community
            </p>
          </div>
          <Link
            to="/write"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-writespace-gradient rounded-lg hover:bg-writespace-gradient-hover transition-all shadow-sm"
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
            New Post
          </Link>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">Loading posts…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-writespace-light text-writespace-primary mb-4">
              <svg
                className="w-8 h-8"
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No posts yet
            </h2>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              It looks like no one has written anything yet. Be the first to share your thoughts!
            </p>
            <Link
              to="/write"
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-writespace-gradient rounded-lg hover:bg-writespace-gradient-hover transition-all shadow-sm"
            >
              Write your first post
            </Link>
          </div>
        )}

        {/* Posts grid */}
        {!loading && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}