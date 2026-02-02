# Deployment Checklist

## Pre-Deployment

### 1. Verify Local Setup

- [ ] Run `npm run verify-supabase` - should pass all checks
- [ ] Test complete order flow locally:
  - [ ] Upload 5 test images
  - [ ] Enter shipping details
  - [ ] Complete test payment (use 4242 4242 4242 4242)
  - [ ] Verify order appears in admin panel
  - [ ] Verify images are visible in admin panel
- [ ] Check all environment variables are in `.env.local`
- [ ] Run `npm run build` successfully

### 2. Supabase Configuration

- [ ] Database tables created (`orders`, `order_images`)
- [ ] Storage bucket created (`head-images`, private)
- [ ] RLS policies enabled
- [ ] Admin user created in Supabase Auth
- [ ] Service role key saved securely

### 3. Stripe Configuration

- [ ] Stripe account in production mode (or test mode for staging)
- [ ] Payment methods enabled
- [ ] Webhook endpoint ready to configure

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Select "Next.js" as framework

### 3. Configure Environment Variables

Add these in Vercel project settings → Environment Variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xrapcrdigvdzlptxwcel.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=[will be added after webhook setup]

# App
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**Important:** Use production keys for production deployment!

### 4. Deploy

Click "Deploy" and wait for build to complete.

## Post-Deployment

### 1. Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Developers → Webhooks
2. Click "Add endpoint"
3. Enter URL: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
8. Redeploy the application in Vercel

### 2. Test Production Flow

- [ ] Visit your production URL
- [ ] Complete a test order with Stripe test card
- [ ] Verify webhook receives payment event (check Stripe Dashboard → Webhooks → Events)
- [ ] Verify order created in Supabase
- [ ] Verify images uploaded to storage
- [ ] Login to admin panel
- [ ] Verify order appears in admin
- [ ] Set diagnosis and tracking number
- [ ] Verify order status updates

### 3. Switch to Live Mode

When ready for real customers:

1. Go to Stripe Dashboard
2. Toggle from "Test mode" to "Live mode"
3. Create new webhook endpoint with live URL
4. Update Vercel environment variables with live keys:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_live_...)
   - `STRIPE_SECRET_KEY` (sk_live_...)
   - `STRIPE_WEBHOOK_SECRET` (whsec_... from live webhook)
5. Redeploy

### 4. Configure Domain (Optional)

1. Go to Vercel project settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` in environment variables
5. Update Stripe webhook URL to use custom domain

## Monitoring

### Check These Regularly

- **Vercel Logs**: Check for application errors
- **Supabase Dashboard**: Monitor database usage and storage
- **Stripe Dashboard**: Monitor payments and webhook events

### Common Issues

#### Webhook not receiving events
- Check webhook URL is correct in Stripe
- Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Check webhook events are selected
- Check Vercel function logs for errors

#### Images not uploading
- Check storage bucket exists (`head-images`)
- Check bucket policies allow uploads
- Check `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check browser console for upload errors

#### Admin can't see images
- Images are in private bucket - admin uses signed URLs
- Check `/api/get-image-url` is working
- Check browser network tab for 404s

#### Orders not appearing in admin
- Check webhook is receiving events (Stripe dashboard)
- Check Vercel function logs
- Check Supabase table has RLS policies allowing reads
- Check admin user is authenticated

## Rollback Plan

If something goes wrong:

1. Go to Vercel deployments
2. Find previous working deployment
3. Click "⋯" → "Promote to Production"
4. Check Stripe webhook is still pointing to correct URL

## Security Checklist

- [ ] Service role key only used server-side (never in client code)
- [ ] RLS policies enabled on all tables
- [ ] Storage bucket is private
- [ ] Admin authentication required for admin panel
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Environment variables stored in Vercel (not in code)
- [ ] `.env.local` in `.gitignore`

## Support Contacts

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)
- **Stripe Support**: [support.stripe.com](https://support.stripe.com)

---

## Quick Commands

```bash
# Verify Supabase setup
npm run verify-supabase

# Build for production
npm run build

# Start production server locally
npm run start

# Run dev server
npm run dev
```

## Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard
- Stripe Dashboard: https://dashboard.stripe.com
- Stripe Webhooks: https://dashboard.stripe.com/webhooks
