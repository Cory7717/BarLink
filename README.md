# BarLink360 - Bar Discovery Platform

A modern web and mobile application connecting bar owners with patrons looking for specific activities on specific days.

## Project Status

? **Completed:**
- Next.js 16.1.1 project initialized
- TypeScript + Tailwind CSS configured
- Database schema (Prisma) created
- Core dependencies installed
- Navigation component created
- Directory structure established

? **In Progress:**
Creating remaining pages and components...

## Tech Stack

- **Framework:** Next.js 16.1.1 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (via Prisma)
- **Auth:** NextAuth.js
- **Payments:** Stripe
- **Maps:** Mapbox GL
- **Email:** Nodemailer

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Update .env with your DATABASE_URL
npx prisma generate
npx prisma db push
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and fill in:
- DATABASE_URL
- NEXTAUTH_SECRET (generate with: `openssl rand -base64 32`)
- GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET (optional, for OAuth)
- STRIPE_SECRET_KEY & STRIPE_PUBLISHABLE_KEY
- NEXT_PUBLIC_MAPBOX_TOKEN
- SMTP credentials (optional, for emails)

### 4. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

### 5. Mobile App (Expo)
```
cd mobile
npm install
npm start
```
Set `EXPO_PUBLIC_API_URL` in your `.env` to point at the running Next.js server (default: http://localhost:3000). The mobile app shares the same API, Prisma database, and auth/PayPal setup.

## Project Structure

```
src/
+-- app/                    # Next.js app router pages
¦   +-- page.tsx           # Home page
¦   +-- explore/           # Bar search & map
¦   +-- pricing/           # Subscription plans
¦   +-- about/             # About page
¦   +-- contact/           # Contact form
¦   +-- dashboard/         # Owner dashboard
¦   +-- auth/              # Authentication pages
¦   +-- api/               # API routes
+-- components/            # React components
¦   +-- Navigation.tsx     # Main navigation
¦   +-- ui/                # Reusable UI components
+-- lib/                   # Utilities
    +-- prisma.ts          # Database client
    +-- auth.ts            # NextAuth config
    +-- utils.ts           # Helper functions
    +-- constants.ts       # App constants
```

## Features

### For Patrons (Free)
- Search bars by day of week + activity
- Interactive map view
- Bar details & directions
- Special event discovery
- Optional favorites (with account)

### For Bar Owners (Subscription Required)
- Bar profile management
- Add unlimited offerings & events
- Recurring weekly activities
- Special event flags
- Basic analytics
- Quick updates anytime

## Pricing
- Monthly: $30/month
- 6 Months: $150 (save $30)
- Annual: $250 (save $110)

## Development Roadmap

- [ ] Complete all marketing pages
- [ ] Implement Explore page with map
- [ ] Build owner dashboard
- [ ] Integrate Stripe subscriptions
- [ ] Add API routes
- [ ] Implement analytics
- [ ] Create mobile app (React Native)
- [ ] SEO optimization
- [ ] Admin panel

## License

Proprietary - All rights reserved

## Support

Contact: coryarmer@gmail.com
