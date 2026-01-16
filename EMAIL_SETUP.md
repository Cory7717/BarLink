# Email Setup Instructions for BarLink360

## Current Status
The contact form is **logging to console only** until you configure an email service.

## Quick Setup with Resend (Recommended - 5 minutes)

### Why Resend?
- **Free tier**: 100 emails/day, 3,000/month
- **No credit card** required for free tier
- **Next.js optimized**
- **Simple API**

### Setup Steps:

1. **Get API Key** (2 minutes)
   - Go to [https://resend.com/signup](https://resend.com/signup)
   - Sign up with GitHub or email
   - Create an API key in the dashboard
   - Copy the key (starts with `re_`)

2. **Add to Environment** (1 minute)
   - Create/edit `.env.local` in project root:
     ```bash
     RESEND_API_KEY="re_your_actual_api_key_here"
     CONTACT_FROM_EMAIL="BarLink360 Contact <contact@yourdomain.com>"
     ```

3. **Verify Domain** (optional for production)
   - For development: Use `onboarding@resend.dev` as from address
   - For production: Verify your domain in Resend dashboard

4. **Test**
   - Restart dev server: `npm run dev`
   - Submit contact form
   - Check email at coryarmer@gmail.com

## Alternative: SendGrid

If you prefer SendGrid:

```bash
# Install package
npm install @sendgrid/mail

# Add to .env.local
SENDGRID_API_KEY="your-sendgrid-api-key"
```

Then update `/src/app/api/contact/route.ts` to use SendGrid instead.

## Alternative: AWS SES

For AWS SES (if already using AWS):

```bash
# Add to .env.local
AWS_SES_REGION="us-east-1"
AWS_SES_FROM_EMAIL="noreply@yourdomain.com"
```

Update the API route to use AWS SES SDK.

## Current Behavior

**Without API key configured:**
- Form shows success message
- Email is logged to server console
- No actual email sent
- Warning appears in logs

**With API key configured:**
- Form shows success message
- Email sent to coryarmer@gmail.com
- User can reply to sender's email
- Success logged to console

## Testing

1. Submit contact form at `/contact`
2. Check server console logs
3. If configured: Check coryarmer@gmail.com inbox
4. Reply-to should be the user's email address
