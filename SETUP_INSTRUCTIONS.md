# BarPulse Setup Instructions

## Overview
BarPulse is a real-time bar discovery platform with owner subscriptions (PayPal), map search (Mapbox), media storage (AWS S3), and auth (NextAuth + Google OAuth).

## Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)
- PayPal Business account
- Mapbox account
- AWS S3 bucket
- Google OAuth credentials (optional)
- SendGrid or SMTP for emails (optional)

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Create PayPal Billing Plans
1. Log in to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard)
2. Create 3 subscription plans:
   - **Monthly**: $30/month
   - **6-Month**: $150 every 6 months
   - **Yearly**: $250 every year
3. Copy each plan ID

## Step 3: Configure PayPal Webhook
1. In PayPal Developer Dashboard, go to Webhooks
2. Create a new webhook pointing to: `https://your-render-url.onrender.com/api/paypal/webhook`
3. Select these events:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `BILLING.SUBSCRIPTION.UPDATED`
   - `BILLING.SUBSCRIPTION.PAYMENT.FAILED`
4. Copy the Webhook ID

## Step 4: Set Environment Variables
Create a `.env` file (or configure Render environment variables):

```bash
# Database (Neon)
DATABASE_URL="postgresql://user:password@your-neon-host.neon.tech:5432/barpulse?sslmode=require"

# NextAuth
NEXTAUTH_URL="https://your-render-url.onrender.com"
NEXTAUTH_SECRET="generate-with: node -e console.log(require('crypto').randomBytes(32).toString('base64'))"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# PayPal
PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-client-secret"
PAYPAL_WEBHOOK_ID="your-webhook-id"
PAYPAL_ENV="sandbox"  # or "live"
PAYPAL_CURRENCY="USD"
PAYPAL_PLAN_MONTHLY_ID="P-xxx"
PAYPAL_PLAN_SIXMONTH_ID="P-xxx"
PAYPAL_PLAN_YEARLY_ID="P-xxx"
PAYPAL_MERCHANT_ID="your-merchant-id"

# Mapbox (for maps + geocoding)
NEXT_PUBLIC_MAPBOX_TOKEN="pk.your-mapbox-token"

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="barpulse-media"
AWS_S3_PUBLIC_BASE_URL="https://barpulse-media.s3.amazonaws.com"

# Email (choose SendGrid OR SMTP)
SENDGRID_API_KEY="SG.xxx"
EMAIL_FROM="BarPulse <no-reply@barpulse.com>"
# OR SMTP:
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT="587"
# SMTP_USER="your-email@gmail.com"
# SMTP_PASSWORD="your-app-password"
# SMTP_FROM="BarPulse <no-reply@barpulse.com>"

# Feature flags
NEW_FLAG_DAYS=7
SPECIAL_DEFAULT_EXPIRY_DAYS=14

# Render (auto-set by Render)
RENDER_EXTERNAL_URL="https://your-render-url.onrender.com"
```

## Step 5: Run Database Migrations
```bash
npx prisma migrate dev
npx prisma generate
```

## Step 6: Run Locally
```bash
npm run dev
```

Visit `http://localhost:3000`

## Step 7: Deploy to Render
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your GitHub repo
4. Set build command: `npm install && npx prisma generate && npm run build`
5. Set start command: `npm start`
6. Add all environment variables from Step 4
7. Deploy!

## Step 8: Post-Deployment
1. Update PayPal webhook URL to your Render URL
2. Set `PAYPAL_ENV=live` when ready for production
3. Update `NEXTAUTH_URL` to your custom domain if applicable

## Common Issues
- **Geocoding fails**: Verify `NEXT_PUBLIC_MAPBOX_TOKEN` is set
- **PayPal webhook not triggering**: Check webhook URL and event selections
- **Auth errors**: Ensure `NEXTAUTH_SECRET` is set and `NEXTAUTH_URL` matches your domain
- **Database connection**: Verify `DATABASE_URL` includes `?sslmode=require` for Neon

## Next Steps
1. Create owner account at `/auth/signup`
2. Complete onboarding (bar profile + subscription)
3. Add offerings/events in dashboard
4. Test patron search at `/explore`
