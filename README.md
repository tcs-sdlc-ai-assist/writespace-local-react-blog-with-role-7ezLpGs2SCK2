# WriteSpace

A personal blogging platform built with React 18 and Vite. All data is stored locally in your browser — no backend, no servers, no tracking.

## Tech Stack

- **Vite** — Fast build tool and dev server
- **React 18** — UI library
- **React Router v6** — Client-side routing
- **Tailwind CSS** — Utility-first CSS framework
- **localStorage** — Browser-based data persistence
- **Vitest** — Unit and integration testing
- **React Testing Library** — Component testing utilities

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens the app at [http://localhost:5173](http://localhost:5173) by default.

### Build

```bash
npm run build
```

Outputs production-ready files to the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Run Tests

```bash
npm run test
```

## Environment Variables

Copy `.env.example` to `.env` to configure optional environment variables:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `VITE_APP_NAME` | Application display name | `WriteSpace` |

Environment variables are accessed via `import.meta.env.VITE_*` in the source code.

## Folder Structure

```
writespace/
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── vitest.config.js            # Vitest configuration
├── vitest.setup.js             # Test setup (jest-dom, localStorage mock)
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── vercel.json                 # Vercel deployment config
├── .env.example                # Environment variable template
├── public/
│   └── vite.svg                # Favicon
└── src/
    ├── main.jsx                # React entry point
    ├── App.jsx                 # Root component with routing
    ├── index.css               # Tailwind CSS imports
    ├── components/
    │   ├── Avatar.jsx          # Role-distinct avatar (admin/user)
    │   ├── BlogCard.jsx        # Blog post card for grid layout
    │   ├── Navbar.jsx          # Authenticated navigation bar
    │   ├── ProtectedRoute.jsx  # Route guard for auth and admin
    │   ├── PublicNavbar.jsx    # Public navigation bar
    │   ├── StatCard.jsx        # Dashboard stat card
    │   └── UserRow.jsx         # User management row
    ├── pages/
    │   ├── AdminDashboard.jsx  # Admin dashboard (/admin)
    │   ├── Home.jsx            # Blog list (/blogs)
    │   ├── Home.test.jsx       # Home page tests
    │   ├── LandingPage.jsx     # Public landing page (/)
    │   ├── LoginPage.jsx       # Login form (/login)
    │   ├── LoginPage.test.jsx  # Login page tests
    │   ├── ReadBlog.jsx        # Single blog view (/blog/:id)
    │   ├── RegisterPage.jsx    # Registration form (/register)
    │   ├── RegisterPage.test.jsx # Register page tests
    │   ├── UserManagement.jsx  # User management (/users)
    │   └── WriteBlog.jsx       # Create/edit blog (/write, /edit/:id)
    ├── utils/
    │   ├── auth.js             # Authentication utilities
    │   ├── auth.test.js        # Auth utility tests
    │   ├── storage.js          # localStorage utilities
    │   └── storage.test.js     # Storage utility tests
    └── test/
        └── setup.js            # Test setup file
```

## Features

- **Public Landing Page** — Hero section with gradient background, feature cards, latest posts preview, and footer
- **Authentication** — Login and registration with inline validation and error messages
- **Hard-coded Admin** — Default admin account (`admin` / `admin`) available out of the box
- **Blog CRUD** — Create, read, update, and delete blog posts
- **Ownership-based Access** — Regular users edit/delete only their own posts; admins can manage all posts
- **Blog List** — Responsive grid layout (1-column mobile, 2-column tablet, 3-column desktop) sorted newest first
- **Single Blog View** — Full post page with author avatar, name, formatted date, and content
- **Write/Edit Page** — Shared form for creating and editing posts with validation and character counter
- **Admin Dashboard** — Stat cards, quick actions, and recent posts overview
- **User Management** — Admin-only page for creating and managing user accounts
- **Role-Based Route Guards** — Protected routes redirect unauthenticated users; admin-only routes redirect non-admins
- **Role-Distinct Avatars** — Crown emoji (👑) with violet background for admins, book emoji (📖) with indigo background for users
- **Responsive Navigation** — Desktop nav links with avatar dropdown and mobile hamburger menu
- **localStorage Persistence** — All data stored in the browser with no external dependencies

## localStorage Schema

All application data is persisted in the browser's `localStorage` under the following keys:

### `writespace_users`

Array of user objects:

```json
[
  {
    "id": "u1a2b3c4d5e6f",
    "displayName": "Alice",
    "username": "alice",
    "password": "secret",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### `writespace_posts`

Array of post objects:

```json
[
  {
    "id": "p1a2b3c4d5e6f",
    "title": "My First Post",
    "content": "Hello, world!",
    "authorId": "u1",
    "authorName": "Admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### `writespace_session`

Current authenticated user session:

```json
{
  "userId": "u1",
  "username": "admin",
  "displayName": "Admin",
  "role": "admin"
}
```

## Routes

| Path | Access | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/login` | Public | Login form |
| `/register` | Public | Registration form |
| `/blogs` | Authenticated | Blog list |
| `/dashboard` | Authenticated | Blog list (alias) |
| `/write` | Authenticated | Create new post |
| `/write?edit=:id` | Authenticated | Edit existing post |
| `/edit/:id` | Authenticated | Edit existing post (route param) |
| `/blog/:id` | Authenticated | Read single post |
| `/admin` | Admin only | Admin dashboard |
| `/users` | Admin only | User management |

## Default Accounts

| Username | Password | Role |
|---|---|---|
| `admin` | `admin` | Admin |

Additional user accounts can be created via the registration page or the admin user management page.

## Deployment

### Vercel

The project includes a `vercel.json` configuration with SPA rewrite rules for client-side routing:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

To deploy:

1. Push the repository to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Vercel auto-detects Vite and configures the build
4. The `vercel.json` rewrites ensure all routes resolve to `index.html`

### Other Platforms

For any static hosting platform, configure a fallback to `index.html` for all routes to support client-side routing. Run `npm run build` and deploy the contents of the `dist/` directory.

## License

Private