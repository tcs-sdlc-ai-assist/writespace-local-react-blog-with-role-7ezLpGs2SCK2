# Deployment Guide

This guide covers deploying WriteSpace to [Vercel](https://vercel.com). Since WriteSpace is a fully client-side application with no backend, it can be deployed as a static site on any hosting platform. Vercel is recommended for its seamless GitHub integration and automatic deployments.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Deploying to Vercel](#deploying-to-vercel)
  - [Step 1: Push to GitHub](#step-1-push-to-github)
  - [Step 2: Connect Repository in Vercel](#step-2-connect-repository-in-vercel)
  - [Step 3: Configure Build Settings](#step-3-configure-build-settings)
  - [Step 4: Deploy](#step-4-deploy)
- [Build Settings Reference](#build-settings-reference)
- [SPA Rewrites (vercel.json)](#spa-rewrites-verceljson)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
  - [Direct URL Access Returns 404](#direct-url-access-returns-404)
  - [Blank Page After Deployment](#blank-page-after-deployment)
  - [Styles Not Loading](#styles-not-loading)
  - [Build Fails on Vercel](#build-fails-on-vercel)
- [Deploying to Other Platforms](#deploying-to-other-platforms)

---

## Prerequisites

- A [GitHub](https://github.com) account with the WriteSpace repository pushed to it
- A [Vercel](https://vercel.com) account (free tier is sufficient)
- The project builds successfully locally (`npm run build` completes without errors)

---

## Deploying to Vercel

### Step 1: Push to GitHub

Ensure your WriteSpace project is pushed to a GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/writespace.git
git push -u origin main
```

### Step 2: Connect Repository in Vercel

1. Log in to [Vercel](https://vercel.com)
2. Click **"Add New…"** → **"Project"**
3. Select **"Import Git Repository"**
4. Find and select your `writespace` repository from the list
5. Click **"Import"**

### Step 3: Configure Build Settings

Vercel auto-detects Vite projects and configures the build settings automatically. If auto-detection works, you do not need to change anything. If you need to configure settings manually, use the following values:

| Setting | Value |
|---|---|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |
| **Node.js Version** | 18.x or higher |

These settings tell Vercel to:

1. Run `npm install` to install all dependencies
2. Run `npm run build` to produce a production build via Vite
3. Serve the contents of the `dist/` directory as the deployed site

### Step 4: Deploy

1. Click **"Deploy"**
2. Vercel will install dependencies, build the project, and deploy it
3. Once complete, you will receive a production URL (e.g., `https://writespace-xxxx.vercel.app`)
4. Every subsequent push to the `main` branch will trigger an automatic redeployment

---

## Build Settings Reference

The production build is created by Vite. Running `npm run build` locally produces the same output that Vercel generates during deployment:

```bash
npm run build
```

This outputs optimized, minified files to the `dist/` directory:

```
dist/
├── index.html          # Entry HTML file
├── assets/
│   ├── index-[hash].js   # Bundled JavaScript
│   └── index-[hash].css  # Bundled CSS (Tailwind)
└── vite.svg            # Favicon
```

You can preview the production build locally before deploying:

```bash
npm run preview
```

This starts a local server at `http://localhost:4173` serving the `dist/` directory.

---

## SPA Rewrites (vercel.json)

WriteSpace uses client-side routing via React Router v6. All navigation (e.g., `/blogs`, `/login`, `/blog/p123`) is handled in the browser by JavaScript — there are no corresponding server-side routes or HTML files for these paths.

Without proper configuration, directly visiting a URL like `https://your-app.vercel.app/blogs` would result in a **404 error** because the server looks for a file at `/blogs` that does not exist.

The `vercel.json` file in the project root solves this:

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

**How it works:**

- The `rewrites` rule tells Vercel to serve `index.html` for **every** request, regardless of the URL path
- Once `index.html` loads, React Router reads the browser URL and renders the correct page component
- This is the standard pattern for all single-page applications (SPAs) deployed to static hosting

**Important:** Do not remove or modify `vercel.json` unless you understand the implications. Without it, any direct URL access or page refresh on a non-root route will return a 404 error.

---

## Environment Variables

WriteSpace does **not** require any environment variables to function. All data is stored in the browser's `localStorage` — there is no backend, no database, and no external API calls.

There is one optional environment variable for branding purposes:

| Variable | Description | Default | Required |
|---|---|---|---|
| `VITE_APP_NAME` | Application display name | `WriteSpace` | No |

If you want to set it in Vercel:

1. Go to your project in the Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the variable name `VITE_APP_NAME` and your desired value
4. Select the environments where it should apply (Production, Preview, Development)
5. Click **Save** and redeploy

Environment variables prefixed with `VITE_` are embedded into the build at compile time via `import.meta.env.VITE_*`. Changing an environment variable requires a new deployment to take effect.

---

## Troubleshooting

### Direct URL Access Returns 404

**Symptom:** Visiting `https://your-app.vercel.app/blogs` or any non-root URL directly returns a 404 page.

**Cause:** The `vercel.json` file is missing or misconfigured, so Vercel cannot rewrite requests to `index.html`.

**Solution:**

1. Verify that `vercel.json` exists in the project root (not inside `src/` or `public/`)
2. Verify its contents match:

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

3. Commit and push the file, then redeploy

### Blank Page After Deployment

**Symptom:** The deployed site loads but shows a blank white page with no content.

**Cause:** This is typically a JavaScript error preventing React from rendering. Common causes include:

- Missing environment variables that the code expects
- Build errors that were not caught locally

**Solution:**

1. Open the browser developer tools (F12) and check the **Console** tab for errors
2. Run `npm run build` locally and verify it completes without errors
3. Run `npm run preview` locally and verify the app works at `http://localhost:4173`
4. Ensure `index.html` contains `<script type="module" src="/src/main.jsx"></script>` (Vite replaces this with the bundled path during build)

### Styles Not Loading

**Symptom:** The page renders but without any styling — raw unstyled HTML.

**Cause:** Tailwind CSS was not processed during the build, or the CSS file failed to load.

**Solution:**

1. Verify that `src/index.css` contains the Tailwind directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

2. Verify that `src/main.jsx` imports the CSS file: `import './index.css';`
3. Verify that `tailwind.config.js` includes the correct content paths:

```js
content: [
  "./index.html",
  "./src/**/*.{js,jsx}",
],
```

4. Run `npm run build` locally and check that a CSS file is generated in `dist/assets/`

### Build Fails on Vercel

**Symptom:** The Vercel deployment fails during the build step.

**Cause:** Common causes include dependency issues, Node.js version mismatches, or syntax errors.

**Solution:**

1. Check the Vercel deployment logs for the specific error message
2. Ensure the build works locally:

```bash
rm -rf node_modules
npm install
npm run build
```

3. Verify the Node.js version in Vercel matches your local version (18.x or higher recommended). You can set this in Vercel under **Settings** → **General** → **Node.js Version**
4. Ensure all dependencies are listed in `package.json` under `dependencies` or `devDependencies`

---

## Deploying to Other Platforms

WriteSpace can be deployed to any static hosting platform. The key requirement is configuring a **fallback to `index.html`** for all routes to support client-side routing.

### General Steps

1. Run the production build:

```bash
npm run build
```

2. Deploy the contents of the `dist/` directory to your hosting platform
3. Configure the platform to serve `index.html` for all routes that do not match a static file

### Platform-Specific Fallback Configuration

**Netlify** — Create a `public/_redirects` file:

```
/*    /index.html   200
```

**GitHub Pages** — Copy `index.html` to `404.html` in the `dist/` directory:

```bash
cp dist/index.html dist/404.html
```

**Nginx** — Add to your server configuration:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache** — Create a `.htaccess` file in the `dist/` directory:

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```