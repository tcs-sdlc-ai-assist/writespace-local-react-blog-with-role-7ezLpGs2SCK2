# Changelog

All notable changes to the WriteSpace project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-01

### Added

- **Public Landing Page** — Hero section with gradient background, feature cards (Write Freely, Private & Local, Instant & Fast), latest posts preview, and footer with navigation links.
- **Login Page** — Username and password authentication form with inline error messages. Hard-coded admin account (`admin`/`admin`) and support for localStorage-registered users. Redirects authenticated users to their appropriate dashboard.
- **Registration Page** — Self-service account creation with Display Name, Username, Password, and Confirm Password fields. All self-registered accounts receive the `user` role. Validates required fields, password match, and unique username.
- **Blog CRUD with Ownership** — Authenticated users can create, read, update, and delete blog posts. Regular users can only edit and delete their own posts. Admin users can edit and delete any post.
- **Blog List (Home)** — Responsive grid layout (1-column mobile, 2-column tablet, 3-column desktop) displaying all posts sorted newest first. Empty state with call-to-action when no posts exist.
- **Single Blog View** — Full post reading page with author avatar, author name, formatted date, and full content. Edit and delete actions shown based on ownership and role.
- **Write/Edit Blog Page** — Shared create and edit form at `/write` (create) and `/write?edit=:id` or `/edit/:id` (edit). Title and content fields with inline validation and character counter.
- **Admin Dashboard** — Admin-only dashboard displaying stat cards (Total Posts, Total Users, Admins, Regular Users), quick-action buttons (Write New Post, Manage Users), and a recent posts section with edit/delete controls.
- **User Management** — Admin-only page for creating and managing user accounts. Create user form with Display Name, Username, Password, and Role dropdown. User list with delete functionality (cannot delete self or default admin).
- **Role-Based Route Guards** — `ProtectedRoute` component redirecting unauthenticated users to `/login` and non-admin users away from admin-only routes to `/blogs`.
- **Avatar Component** — Role-distinct avatars with crown emoji (👑) and violet background for admins, book emoji (📖) and indigo background for regular users. Supports `sm`, `md`, and `lg` sizes.
- **Public Navbar** — Navigation bar for guest and authenticated users on public pages. Guests see Login and Get Started buttons; authenticated users see avatar chip, Dashboard link, and Logout button.
- **Authenticated Navbar** — Navigation bar for logged-in users with role-based links (All Blogs, Write, Users for admin; All Blogs, Write for regular users), avatar chip with dropdown, and mobile hamburger menu.
- **localStorage Persistence** — All data (users, posts, sessions) stored in browser localStorage under `writespace_users`, `writespace_posts`, and `writespace_session` keys. No backend or external API required.
- **Auth Utilities** — `login()`, `logout()`, `register()`, `isAuthenticated()`, and `getCurrentUser()` functions in `src/utils/auth.js` handling authentication logic with hard-coded admin fallback.
- **Storage Utilities** — `getUsers()`, `addUser()`, `getPosts()`, `addPost()`, `updatePost()`, `deletePost()`, `getSession()`, `setSession()`, and `clearSession()` functions in `src/utils/storage.js` for localStorage operations.
- **Tailwind CSS Styling** — Custom color palette (`writespace-primary`, `writespace-secondary`, `writespace-accent`, `writespace-light`, `writespace-dark`) and gradient backgrounds (`writespace-gradient`, `writespace-gradient-hover`).
- **Vercel SPA Deployment** — `vercel.json` with SPA rewrite rules for client-side routing support.
- **Test Suite** — Unit and integration tests using Vitest and React Testing Library covering auth utilities, storage utilities, LoginPage, RegisterPage, and Home page components.