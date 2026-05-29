import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
import { getCurrentUser, isAuthenticated } from '../utils/auth.js';
import { getPosts, addPost, updatePost } from '../utils/storage.js';
import { Navbar } from '../components/Navbar.jsx';

/**
 * Generates a simple unique id for a new post.
 * @returns {string} A unique identifier string.
 */
function generatePostId() {
  return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

/**
 * WriteBlog component — blog post create and edit page.
 * Create mode at '/write', edit mode at '/write?edit=:id' or '/edit/:id'.
 * All authenticated users can create. Editing restricted by ownership:
 * users can edit own posts, admin can edit any.
 * Title and content fields required with inline validation errors.
 * Character counter for content field.
 * On save, creates/updates post in localStorage and redirects to '/blog/:id'.
 * Guests redirected to '/login'.
 *
 * @returns {JSX.Element}
 */
export default function WriteBlog() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [editPost, setEditPost] = useState(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const location = useLocation();

  const currentUser = getCurrentUser();

  // Determine edit ID from either query param or route param
  const editId = searchParams.get('edit') || params.id || null;
  const isEditMode = Boolean(editId);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }

    if (isEditMode) {
      try {
        const posts = getPosts();
        const post = posts.find((p) => p.id === editId);

        if (!post) {
          navigate('/dashboard', { replace: true });
          return;
        }

        // Check edit permission: admin can edit any, user can only edit own
        const user = getCurrentUser();
        if (user.role !== 'admin' && post.authorId !== user.userId) {
          navigate('/dashboard', { replace: true });
          return;
        }

        setEditPost(post);
        setTitle(post.title);
        setContent(post.content);
      } catch (e) {
        console.error('WriteBlog: failed to load post for editing', e);
        navigate('/dashboard', { replace: true });
        return;
      }
    }

    setPageLoading(false);
  }, [editId, isEditMode, navigate]);

  const validateTitle = (value) => {
    if (!value.trim()) {
      setTitleError('Title is required');
      return false;
    }
    setTitleError('');
    return true;
  };

  const validateContent = (value) => {
    if (!value.trim()) {
      setContentError('Content is required');
      return false;
    }
    setContentError('');
    return true;
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    if (titleError) {
      validateTitle(value);
    }
  };

  const handleContentChange = (e) => {
    const value = e.target.value;
    setContent(value);
    if (contentError) {
      validateContent(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isTitleValid = validateTitle(title);
    const isContentValid = validateContent(content);

    if (!isTitleValid || !isContentValid) {
      return;
    }

    setLoading(true);

    try {
      if (isEditMode && editPost) {
        const updated = updatePost(editPost.id, {
          title: title.trim(),
          content: content.trim(),
          updatedAt: new Date().toISOString(),
        });

        if (updated) {
          navigate(`/blog/${editPost.id}`, { replace: true });
        } else {
          console.error('WriteBlog: failed to update post');
          setLoading(false);
        }
      } else {
        const user = getCurrentUser();
        const newPost = {
          id: generatePostId(),
          title: title.trim(),
          content: content.trim(),
          authorId: user.userId,
          authorName: user.displayName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const added = addPost(newPost);

        if (added) {
          navigate(`/blog/${newPost.id}`, { replace: true });
        } else {
          console.error('WriteBlog: failed to create post');
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('WriteBlog: save failed', err);
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Post' : 'Create New Post'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {isEditMode
              ? 'Update your blog post below'
              : 'Share your thoughts with the community'}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6"
        >
          {/* Title field */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              onBlur={() => validateTitle(title)}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-writespace-primary focus:border-writespace-primary transition-colors ${
                titleError ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your post title"
            />
            {titleError && (
              <p className="mt-1 text-sm text-red-600">{titleError}</p>
            )}
          </div>

          {/* Content field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700"
              >
                Content
              </label>
              <span className="text-xs text-gray-400">
                {content.length} characters
              </span>
            </div>
            <textarea
              id="content"
              name="content"
              rows={12}
              value={content}
              onChange={handleContentChange}
              onBlur={() => validateContent(content)}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-writespace-primary focus:border-writespace-primary transition-colors resize-y ${
                contentError ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Write your blog post content here…"
            />
            {contentError && (
              <p className="mt-1 text-sm text-red-600">{contentError}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-writespace-gradient rounded-lg hover:bg-writespace-gradient-hover transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? isEditMode
                  ? 'Updating…'
                  : 'Publishing…'
                : isEditMode
                  ? 'Update Post'
                  : 'Publish Post'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}