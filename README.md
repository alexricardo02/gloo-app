# GLOO 🎉

> **The best nights of your life.**

GLOO is a mobile-first social nightlife app that connects groups of people before and during a night out. Think of it as a Tinder-style discovery experience — but for groups, not individuals. Find other crews for a pre-party, discover events nearby, and match with people who share your vibe.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Internationalization](#internationalization)
- [Authentication](#authentication)
- [Key Pages & Routes](#key-pages--routes)
- [Group Discovery](#group-discovery)
- [Testing & CI](#testing--ci)
- [Scripts](#scripts)

---

## Overview

GLOO lets users create a group profile (with photos, description, age range, gender, and Instagram handles), then browse other nearby groups in a vertical snap-scroll carousel — similar to Instagram Stories meets TikTok. Each group card supports horizontal photo swiping. Users can like groups, send messages, and filter by distance and preferences.

The app supports a **guest mode** that lets anyone browse content without an account, with a contextual paywall that appears when they try to access restricted features.

---

## Features

###  Group Discovery
- Vertical snap-scroll carousel (TikTok-style) to browse nearby groups
- Horizontal photo carousel per group card (Instagram Stories-style navigation)
  - Tap left third → previous photo
  - Tap right two-thirds → next photo
  - Swipe horizontally to navigate
- Progress bars at the top indicate current photo position
- Distance-based filtering using the Haversine formula
- Gender and age range preference filters
- Infinite scroll with IntersectionObserver pagination

###  Group Profiles
- Create and edit a group profile with up to 6 photos
- Set group gender, age range, description, and search preferences
- Add Instagram handles (displayed as clickable @links)
- GPS-based location capture on profile save
- Max distance preference saved and applied to discovery feed

###  Games (Guest-accessible)
- Never Have I Ever
- Truth or Dare
- Accessible to all users, including guests

###  Messages
- Chat list with unread indicators
- Search bar

###  Map
- Location-based map view (placeholder, extendable)

###  Internationalization (i18n)
- Full multi-language support: **English, German, Spanish, French, Italian**
- Language selector on the welcome screen with cookie-based persistence
- All UI strings, modals, and action sheets translated
- Dynamic locale routing via `next-intl`

###  Authentication
- Email/username + password login
- Registration with age validation (18+)
- bcrypt password hashing
- Session managed via httpOnly cookies
- Guest mode with temporary session cookies

###  Guest Mode
- One-tap guest entry from the welcome screen
- Full loading overlay (branded spinner) while session is created
- Paywall shown on first visit — dismissed state persisted in `sessionStorage` so it doesn't repeat in the same tab
- Contextual bottom sheet (instead of redirect) when a guest touches a restricted feature
- Games remain accessible to guests

###  Mobile-First UX
- `100dvh` layout, no browser chrome overflow
- Touch-native carousel with transform-based animation (no CSS overflow-x conflicts)
- Branded loading overlay on guest entry transition
- Video background on welcome screen with fade-in (no poster flash)
- Bottom navigation bar with active state indicators

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Database | PostgreSQL |
| ORM | [Prisma](https://www.prisma.io/) |
| Auth | Custom cookie-based sessions + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| i18n | [next-intl](https://next-intl-docs.vercel.app/) |
| Testing | [Vitest](https://vitest.dev/) |
| CI/CD | GitHub Actions |
| Icons | [Lucide React](https://lucide.dev/) |
| Fonts | Geist Sans & Geist Mono (via `next/font`) |

---

## Project Structure

```
gloo/
├── app/
│   ├── [locale]/                    # Locale-scoped routes
│   │   ├── page.tsx                 # Welcome / landing page
│   │   ├── layout.tsx               # Root layout with next-intl provider
│   │   ├── dashboard/page.tsx       # Main dashboard
│   │   ├── pre-party/page.tsx       # Group discovery carousel
│   │   ├── games/page.tsx           # Party games
│   │   ├── messages/page.tsx        # Chat list
│   │   ├── map/page.tsx             # Map view
│   │   ├── login/page.tsx           # Login
│   │   ├── register/page.tsx        # Registration
│   │   ├── forgotPassword/page.tsx  # Password reset
│   │   ├── termsOfService/page.tsx  # Terms of Service
│   │   ├── privacyPolicy/page.tsx   # Privacy Policy
│   │   └── profile/
│   │       ├── page.tsx             # User profile
│   │       ├── create-group/        # Create / edit group
│   │       └── preferences/         # Search preferences
│   ├── actions/                     # Next.js Server Actions
│   │   ├── auth.ts                  # Login, register, logout, getCurrentUser
│   │   ├── guest.ts                 # Guest session management
│   │   ├── group.ts                 # Group CRUD
│   │   └── discoverGroups.ts        # Discovery feed + like toggle
│   ├── components/
│   │   ├── GroupCard.tsx            # Photo carousel card component
│   │   ├── Navigation.tsx           # Bottom navigation bar
│   │   └── SocialLinks.tsx          # Instagram link component
│   ├── global-error.tsx             # Global error boundary
│   └── globals.css                  # Global styles + Tailwind config
├── messages/                        # i18n translation files
│   ├── en.json
│   ├── de.json
│   ├── es.json
│   ├── fr.json
│   └── it.json
├── prisma/
│   ├── schema.prisma                # Database schema
│   ├── seed.ts                      # Test data seeder
│   └── migrations/                  # Migration history
├── public/
│   ├── images/                      # Static images
│   ├── videos/                      # Background video
│   └── flags/                       # Locale flag SVGs
├── i18n.ts                          # next-intl configuration
├── middleware.ts                    # Locale routing middleware
└── .github/workflows/ci.yml        # GitHub Actions CI pipeline
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- npm

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/your-org/gloo.git
cd gloo

# 2. Install dependencies
npm install

# 3. Set up environment variables (see below)
cp .env.example .env

# 4. Push the schema to your database
npx prisma db push

# 5. Generate the Prisma client
npx prisma generate

# 6. (Optional) Seed test data
npx prisma db seed

# 7. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env` file at the root of the project:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/gloo"
```

> **Note:** The app uses cookie-based sessions with no external auth provider, so no additional OAuth secrets are required for the base setup.

---

## Database

GLOO uses **PostgreSQL** with Prisma ORM. The schema includes:

| Model | Description |
|---|---|
| `User` | Registered users and their profile data |
| `Group` | Group profiles with photos, location, preferences |
| `GroupLike` | Likes between groups (unique pair constraint) |
| `Chat` | Direct chats between two group hosts |
| `Message` | Individual messages within a chat |
| `Event` | Nightlife events (extendable) |
| `GameScore` | Scores from in-app games (supports guests via `guestId`) |

### Key schema details

- `Group.photos` — `String[]` array of URLs (Unsplash or base64 from upload)
- `Group.latitude / longitude` — captured via browser Geolocation API at profile save
- `Group.searchGender / searchAgeMin / searchAgeMax / maxDistance` — preference filters applied to the discovery feed
- `GroupLike` has a `@@unique([fromGroupId, toGroupId])` constraint to prevent duplicate likes
- `GameScore` can be attributed to a registered user (`userId`) or a guest (`guestId`)

### Seeding test data

```bash
npx prisma db seed
```

This creates 3 test groups around Mainz/Frankfurt/Wiesbaden with multiple photos each. The seeder uses `upsert` for both user and group separately, so re-running it always updates photos and preferences without duplicating records.

### Resetting the database

```bash
npx prisma db push --force-reset
npx prisma db seed
```

---

## Internationalization

GLOO supports 5 languages out of the box, selectable from the welcome screen:

| Code | Language |
|---|---|
| `en` | English |
| `de` | Deutsch (German) |
| `es` | Español (Spanish) |
| `fr` | Français (French) |
| `it` | Italiano (Italian) |

Language is stored in a `NEXT_LOCALE` cookie and applied via Next.js middleware. All route segments are prefixed with the locale: `/en/dashboard`, `/de/pre-party`, etc.

Translation files live in `messages/[locale].json` and are organized by namespace:

```
Common, WelcomePage, Dashboard, Games, Login, Register,
Profile, CreateGroup, Messages, Pre-party, ForgotPassword,
Terms, Privacy, Map
```

---

## Authentication

Authentication uses **custom cookie-based sessions** with no external providers.

### Flow

1. **Register** → password hashed with bcrypt (10 rounds) → `gloo_user_id` cookie set
2. **Login** → credentials verified → `gloo_user_id` cookie set
3. **Guest** → `gloo_is_guest=true` + `gloo_guest_id=<uuid>` cookies set (24h expiry)
4. **Logout** → `gloo_user_id` deleted → new guest session created → redirect to login

All cookies are `httpOnly` and `secure` in production. Session is read server-side in Server Actions via `cookies()` from `next/headers`.

### Guest restrictions

| Feature | Guest | Registered |
|---|---|---|
| Browse dashboard | ✅ | ✅ |
| Play games | ✅ | ✅ |
| View pre-party feed | ❌ | ✅ |
| Like groups | ❌ | ✅ |
| Send messages | ❌ | ✅ |
| View map | ❌ | ✅ |
| Create group profile | ❌ | ✅ |

When a guest taps a restricted feature, a **bottom sheet** slides up with "Create free account" and "Sign in" options — keeping the user in context rather than redirecting them away.

---

## Key Pages & Routes

### `/[locale]` — Welcome Page
- Looping background video with fade-in (no poster flash)
- Language selector dropdown
- One-tap guest entry with branded loading overlay
- Live group count indicator

### `/[locale]/dashboard` — Main Dashboard
- Entry points to Pre-party and Party modes
- Games button (guest-accessible)
- Guest paywall on first visit (sessionStorage-dismissed so it doesn't repeat in the same tab)
- Contextual action sheet for restricted features

### `/[locale]/pre-party` — Group Discovery
- Vertical snap-scroll carousel (one group per full screen)
- Each `GroupCard` has its own horizontal photo carousel
- Tap zones (left ⅓ / right ⅔) for photo navigation — works reliably on mobile without scroll conflicts
- Distance modal with range slider
- "No group" teaser mode — shows a blurred preview and prompts group creation

### `/[locale]/profile/create-group` — Group Editor
- 6-slot photo gallery with add/remove
- Members count stepper
- Gender radio buttons for group and search preferences
- Age range sliders (min + max independently controlled)
- Distance slider
- Instagram handle manager
- GPS location captured on submit

### `/[locale]/profile/preferences` — Quick Preference Editor
- Standalone page to update search preferences without re-editing the full group profile
- Saves and redirects to pre-party feed

---

## Group Discovery

The discovery algorithm in `discoverGroups.ts`:

1. Reads the logged-in user's group (location + search preferences)
2. If the user has no group, returns a teaser preview (one random group, `hasNoGroup: true`)
3. Fetches candidates using a bounding box filter (`latitude ± distance/111`)
4. Refines with the **Haversine formula** in JavaScript for accurate circular radius
5. Applies age range filter (`group.ageMax >= searchAgeMin && group.ageMin <= searchAgeMax`)
6. Paginates in sets of 10

---

## Testing & CI

Tests use **Vitest** and cover the guest action module:

```bash
npm run test        # run tests interactively
npm run test:ci     # run tests in CI mode (no watch)
```

### Test coverage (`guest.test.ts`)

- `loginAsGuest` sets correct cookies and redirects
- `loginAsGuest` sets `secure: true` in production, `false` in development
- `clearGuestSession` deletes both guest cookies
- `checkIsGuest` returns `true` when cookie is present
- `checkIsGuest` returns `false` when cookie is absent

### GitHub Actions (`.github/workflows/ci.yml`)

On every push and pull request:

1. Checkout code
2. Install Node 24
3. `npm install`
4. `npx prisma validate` — schema validation
5. `npx prisma generate` — client generation
6. `npm run test:ci` — run unit tests
7. `npm run build` — production build check

---

## Scripts

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Vitest in watch mode
npm run test:ci      # Run Vitest once (for CI)
npx prisma studio    # Open Prisma visual DB browser
npx prisma db seed   # Seed test data
npx prisma db push   # Sync schema to database
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

Please make sure `npm run test:ci` and `npm run build` pass before submitting a PR.

---

## License

This project is proprietary. All rights reserved © GLOO 2026.
