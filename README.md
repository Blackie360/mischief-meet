# Mischief Meet

A modern scheduling app (Calendly-like) built with Next.js 14 App Router, Clerk authentication, Prisma + PostgreSQL, Tailwind CSS, and Google Calendar integration with automatic Google Meet links and transactional email notifications.

## Features
- **Authentication**: Clerk-powered sign up/sign in, protected routes via middleware
- **Event types**: Create and manage event types with duration and privacy
- **Availability**: Configure weekly availability and minimum gaps
- **Booking**: Public booking pages per user and event type
- **Calendar sync**: Creates Google Calendar events and Google Meet links
- **Email notifications**: Confirmation to attendee and notification to host
- **Dashboard**: Overview of events, bookings, and actions

## Tech Stack
- **Framework**: Next.js 14 (App Router), React 18
- **Auth**: Clerk (`@clerk/nextjs`)
- **DB/ORM**: PostgreSQL + Prisma
- **UI**: Tailwind CSS + Radix UI + shadcn-inspired components
- **Email**: Nodemailer + React Email templates
- **Calendar**: Google Calendar API (OAuth via Clerk)

## Quick Start

### Prerequisites
- Node.js 18+ and pnpm/npm
- PostgreSQL database
- Clerk application (for auth + Google OAuth)
- SMTP credentials for email

### 1) Install dependencies
```bash
pnpm install
# or
npm install
```

### 2) Configure environment variables
Create a `.env` file in the project root with:
```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=public"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Optional: set custom sign-in URL base if needed
# CLERK_SIGN_IN_URL=/sign-in
# CLERK_SIGN_UP_URL=/sign-up

# SMTP (emails)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_user@example.com
SMTP_PASS=your_password
# Optional sender overrides
# SMTP_FROM=your_from@example.com
# SMTP_FROM_NAME=Mischief Meet
```

Notes:
- Google Calendar access uses Clerk OAuth. Enable Google as a social provider in Clerk, request calendar scope, and connect the host’s Google account in the app.
- `NEXT_PUBLIC_APP_URL` is used for metadata and OG tags.

### 3) Database setup
```bash
# Generate Prisma client
pnpm prisma generate
# Apply migrations
pnpm prisma migrate deploy
# (or for development)
pnpm prisma migrate dev
```

### 4) Run the app
```bash
pnpm dev
# or
npm run dev
```
Visit `http://localhost:3000`.

## Project Structure
```
app/
  (auth)/              # Auth routes and layout
  (main)/              # Authenticated app (dashboard, events, meetings, availability)
  [username]/          # Public profile and event booking pages
  layout.js            # Root layout with ClerkProvider and global UI drawers
  lib/validators.js    # zod validators for forms and actions
components/
  emails/              # React Email templates
  ui/                  # UI primitives (button, input, card, dialog, etc.)
actions/               # Server actions: bookings, availability, events, users
lib/
  prisma.js            # Prisma client singleton
  mailer.js            # Nodemailer transport + React Email rendering
  utils.js             # Utility helpers (className merge)
prisma/
  schema.prisma        # Prisma schema (User, Event, Booking, Availability)
  migrations/          # SQL migrations
```

## Key Flows
- **Authentication & Protection**
  - `middleware.js` protects `/dashboard`, `/events`, `/meetings`, `/availability` using Clerk.
- **Create Event Type**
  - UI via `components/event-form.jsx` and drawers in `app/layout.js`.
  - Data stored in Prisma `Event` tied to `User`.
- **Set Availability**
  - Pages in `app/(main)/availability/*` store `Availability` and `DayAvailability`.
- **Booking**
  - Public route `app/[username]/[eventId]` displays event details and `booking-form.jsx`.
  - `actions/bookings.js#createBooking` validates input, creates a Google Calendar event with Meet link, persists `Booking`, and sends emails.
- **Emails**
  - Transport and rendering in `lib/mailer.js` using Nodemailer + `@react-email/render`.
  - Templates in `components/emails/*`.

## Database Schema (Overview)
- `User`: Clerk-linked users; stores profile, relations to events/bookings/availability
- `Event`: Event types a user offers; fields include title, description, duration, isPrivate
- `Booking`: A scheduled meeting; includes attendee name/email, start/end, `meetLink`, `googleEventId`
- `Availability` + `DayAvailability`: Weekly schedule and minimum gaps

## Environment Variables
- **App**: `NEXT_PUBLIC_APP_URL`
- **Database**: `DATABASE_URL`
- **Clerk**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- **SMTP**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, optional `SMTP_FROM`, `SMTP_FROM_NAME`

See `README-email.md` for a focused email setup summary.

## Deployment
- Build and start:
```bash
pnpm build && pnpm start
```
- Ensure env vars are set on the host (Vercel, Fly, Render, etc.).
- Run Prisma migrations on deploy (`prisma migrate deploy`).
- Configure Clerk production keys and domain.
- Database should be a persistent Postgres instance.

### Vercel notes
- Set `DATABASE_URL`, Clerk keys, SMTP vars in project settings.
- Add a Postgres add-on or connect external Postgres.
- Enable Edge Functions is optional; app uses default Node runtime.

## Troubleshooting
- **Google Calendar event not created**: Ensure the host connected Google in Clerk and that the Google provider in Clerk includes Calendar scopes; reauthenticate if tokens expired.
- **Emails not sending**: Verify SMTP vars; for port 465 set `SMTP_PORT=465` and ensure TLS; some providers require app passwords.
- **Prisma connection issues in dev**: The project uses a global Prisma client (`lib/prisma.js`) to avoid hot-reload leaks; ensure only one dev server instance.
- **Auth redirects**: `middleware.js` enforces protection; if stuck in a loop, confirm Clerk URLs and keys.

## Scripts
- `dev`: next dev
- `build`: next build
- `start`: next start
- `postinstall`: prisma generate

## License
MIT
