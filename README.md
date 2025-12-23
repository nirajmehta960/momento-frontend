# Momento Frontend

Frontend for the Momento Social Network, built with Next.js, React, TypeScript, and Tailwind CSS.

## Overview

Momento is a responsive social network that supports anonymous browsing, role-based access (USER, ADMIN), rich posting, and reviews.  
This repository contains the client-side application powered by the Next.js App Router and React Query.

## Tech Stack

- Next.js (App Router), React, TypeScript
- Tailwind CSS for styling
- React Query (TanStack Query) for server state
- Axios for API calls
- React Hook Form + Zod for forms and validation
- Lucide React icons

## Features

### User and Access Model

- Sign-up and sign-in with email and password
- Role selection at registration (USER, ADMIN)
- Session-based authentication with protected routes
- Anonymous users can browse most public pages with limited content

### Core Social Features

- Home feed with dynamic posts and anonymous vs authenticated views
- Create, edit, and delete posts with image upload and tags
- Likes, saves, and post-level review system with star ratings
- User profiles (own and others) with grouped sections for posts, followers, following, saved, and reviews
- Explore page with filters (latest, oldest, most liked, most reviewed)
- Search functionality for posts
- Personalized feed showing posts from followed users
- In-app notifications for likes, follows, and reviews with unread badge counts and mark-as-read

### External Content Integration

- Unsplash-powered search and details pages
- Ability to review external photos and link those reviews back to user profiles and the details page

### Admin Features

- Admin dashboard route restricted to ADMIN role
- View all users and delete user accounts (except own)
- View all posts and delete any post

### UI and Responsiveness

- Fully responsive layout for mobile, tablet, and desktop
- Icon-only sidebar on tablet, full sidebar on desktop, bottom navigation on mobile
- Consistent dark theme and professional styling across authentication, home, profile, details, and admin pages

## Project Structure (High Level)

```
app/
  (auth)/          Authentication (sign-in, sign-up)
  (momento)/       Main application (home, explore, posts, profile, admin, about, privacy)
components/
  shared/          Shared UI (cards, navigation, dialogs, etc.)
  forms/           Post, profile, review, and auth forms
lib/
  api/             Axios API client
  react-query/     Query and mutation hooks
  utils.ts         Shared utilities
context/
  AuthContext.tsx  Authentication context
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Running backend API (see `momento-backend`)

### Installation

```bash
git clone https://github.com/nirajmehta960/momento-frontend
cd momento-frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Run the development server:

```bash
npm run dev
```

The app is available at `http://localhost:3000`.

## Project Links

- Frontend repository: [`momento-frontend`](https://github.com/nirajmehta960/momento-frontend)
- Backend repository: [`momento-backend`](https://github.com/nirajmehta960/momento-backend)

## Environment Variables

| Variable                       | Description                  |
| ------------------------------ | ---------------------------- |
| `NEXT_PUBLIC_API_URL`          | Backend API base URL         |

## Scripts

- `npm run dev` – start development server
- `npm run build` – build for production
- `npm start` – run production build
- `npm run lint` – run lint checks

## License

ISC

## Notes

This repository is part of an academic project and is intended to be used together with the `momento-backend` API server.
