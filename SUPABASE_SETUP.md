# Supabase Setup Documentation

## Overview
This document describes the complete Supabase infrastructure for the Schuppenweg application.

## Database Schema

### Tables

#### `orders`
Stores customer order information.

**Columns:**
- `id` (UUID, PRIMARY KEY) - Unique order identifier
- `email` (TEXT, NOT NULL) - Customer email
- `customer_name` (TEXT, NOT NULL) - Customer name
- `address` (TEXT, NOT NULL) - Shipping address
- `city` (TEXT, NOT NULL) - City
- `postal_code` (TEXT, NOT NULL) - Postal code (5 digits)
- `payment_intent_id` (TEXT, NULLABLE) - Stripe payment intent ID
- `payment_status` (TEXT, NOT NULL, DEFAULT 'pending') - Payment status: pending, paid, failed
- `diagnosis` (TEXT, NULLABLE) - Scalp diagnosis: oily, dry
- `tracking_number` (TEXT, NULLABLE) - Shipping tracking number
- `status` (TEXT, NOT NULL, DEFAULT 'pending') - Order status: pending, paid, diagnosed, shipped, delivered
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW()) - Auto-updated via trigger

**Indexes:**
- `idx_orders_email` on `email`
- `idx_orders_status` on `status`
- `idx_orders_payment_intent` on `payment_intent_id`

**Triggers:**
- `update_orders_updated_at` - Automatically updates `updated_at` on row update

#### `order_images`
Stores references to uploaded scalp images.

**Columns:**
- `id` (UUID, PRIMARY KEY) - Unique image identifier
- `order_id` (UUID, NOT NULL, FOREIGN KEY -> orders.id) - Reference to order
- `image_url` (TEXT, NOT NULL) - URL to image in storage
- `position` (TEXT, NOT NULL) - Image position: front, back, left, right, top
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())

**Indexes:**
- `idx_order_images_order_id` on `order_id`

**Foreign Keys:**
- CASCADE DELETE when order is deleted

## Storage

### Buckets

#### `head-images`
Private bucket for storing customer scalp photos.

**Configuration:**
- Public: `false` (private bucket)
- File size limit: 5 MB (5242880 bytes)
- Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp

**File Structure:**
```
head-images/
  └── {order_id}/
      ├── front.jpg
      ├── back.jpg
      ├── left.jpg
      ├── right.jpg
      └── top.jpg
```

## Row Level Security (RLS)

### Orders Table Policies
- **Service role can do everything on orders** - Full access for service role
- **Authenticated users can read orders** - Admins can view all orders
- **Authenticated users can update orders** - Admins can update order status
- **Anyone can insert orders** - Anonymous users can create orders during checkout

### Order Images Table Policies
- **Service role can do everything on order_images** - Full access for service role
- **Authenticated users can read order_images** - Admins can view all images
- **Anyone can insert order_images** - Allow image uploads after payment

### Storage Policies (head-images bucket)
- **Service role can do everything** - Full access for service role
- **Authenticated users can read images** - Admins can view uploaded images
- **Anyone can upload images** - Allow image uploads during order completion

## Application Flow

### Order Creation Flow

1. **User Upload** (`/upload`)
   - User uploads 5 scalp photos
   - Images compressed client-side (max 2MB, max 1920px)
   - Images stored in React context

2. **Checkout** (`/checkout`)
   - User enters shipping details
   - Payment intent created via Stripe
   - Payment processed

3. **Stripe Webhook** (`/api/webhooks/stripe`)
   - Receives `payment_intent.succeeded` event
   - Creates order record in `orders` table
   - Order status: `paid`

4. **Success Page** (`/success`)
   - Uploads images to Supabase Storage
   - Creates records in `order_images` table
   - Links images to order

5. **Admin Panel** (`/admin`)
   - Lists all orders
   - Admin can view order details
   - Admin can diagnose (oily/dry)
   - Admin can add tracking number
   - Admin can update order status

### API Endpoints

#### POST `/api/create-payment-intent`
Creates a Stripe payment intent with customer metadata.

**Input:**
```json
{
  "shippingDetails": {
    "email": "customer@example.com",
    "customer_name": "John Doe",
    "address": "Street 123",
    "city": "Berlin",
    "postal_code": "10115"
  },
  "amount": 3000
}
```

**Output:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

#### POST `/api/webhooks/stripe`
Handles Stripe webhook events.

**Events:**
- `payment_intent.succeeded` - Creates order in database
- `checkout.session.completed` - Legacy support
- `payment_intent.payment_failed` - Logs failure

#### POST `/api/complete-order`
Uploads images and completes order after payment.

**Input:** FormData with:
- `paymentIntentId`
- `email`, `customer_name`, `address`, `city`, `postal_code`
- `image_front`, `image_back`, `image_left`, `image_right`, `image_top`

**Output:**
```json
{
  "orderId": "uuid",
  "uploadedImages": 5,
  "message": "Order created successfully"
}
```

#### GET `/api/get-image-url?path={url}`
Generates signed URL for private image access.

**Output:**
```json
{
  "signedUrl": "https://...signed_url..."
}
```

## Environment Variables

Required variables in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xrapcrdigvdzlptxwcel.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Testing

### Local Testing

1. Start development server:
```bash
npm run dev
```

2. Test order flow:
   - Visit http://localhost:3000
   - Click "Jetzt beginnen"
   - Upload 5 test images
   - Enter test shipping details
   - Use Stripe test card: 4242 4242 4242 4242

3. Verify in Supabase:
   - Check `orders` table for new order
   - Check `order_images` table for image records
   - Check `head-images` storage bucket for uploaded files

### Webhook Testing

Use Stripe CLI for local webhook testing:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Update `.env.local` with the webhook secret provided by Stripe CLI.

## Production Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Stripe Webhook Setup

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy webhook secret to Vercel environment variables

## Maintenance

### Database Migrations

All migrations are in `supabase/schema.sql` for reference.

To apply changes, use Supabase Studio or run SQL directly.

### Backup

- Database: Automatic backups via Supabase
- Storage: Files stored redundantly in Supabase Storage

### Monitoring

- Check Supabase Dashboard for usage metrics
- Monitor Stripe Dashboard for payment issues
- Check Vercel logs for application errors

## Security

- RLS enabled on all tables
- Storage bucket is private
- Signed URLs used for image access (1 hour expiry)
- Service role key only used server-side
- Payment processing via Stripe (PCI compliant)

## Support

For issues:
1. Check Supabase logs
2. Check Stripe logs
3. Check Vercel function logs
4. Review webhook delivery in Stripe Dashboard
