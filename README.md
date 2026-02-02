# Schuppenweg - 30 Tage. Schuppenfrei. Mann.

A bold, tech-focused German website for solving dandruff problems. Users upload 5 head photos, pay €30 via Stripe, and receive a personalized 30-day treatment kit analyzed by a dermatologist.

![Schuppenweg Hero](https://via.placeholder.com/800x400?text=30+TAGE.+SCHUPPENFREI.+MANN.)

## Features

- **Landing Page**: Bold, dark aesthetic with statistics, problem/solution sections, education about dandruff types, 30-day plan preview, and founders' story
- **5-Photo Upload**: Seamless photo upload interface for front, back, left, right, and top views
- **Stripe Checkout**: Secure payment processing for €30
- **Admin Panel**: View orders, set diagnosis (oily/dry), add tracking numbers
- **Mobile-Optimized**: Works great on phones with native camera integration

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS 4 with custom dark theme
- **Animations**: Framer Motion
- **Backend/DB**: Supabase (PostgreSQL + Storage + Auth)
- **Payments**: Stripe Checkout
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/schuppenweg.git
cd schuppenweg
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Fill in the following variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Set up Supabase** (AUTOMATED):
   
   The database schema, storage buckets, and RLS policies have been automatically configured via MCP tools. To verify the setup:
   
   ```bash
   npm run verify-supabase
   ```
   
   This will check:
   - ✓ Database tables (`orders`, `order_images`)
   - ✓ Storage bucket (`head-images`)
   - ✓ RLS policies
   - ✓ Indexes
   
   **Manual verification (optional):**
   - Go to your Supabase project dashboard
   - Check **Table Editor** for `orders` and `order_images` tables
   - Check **Storage** for `head-images` bucket (should be private)
   - Check **Database** > **Policies** for RLS policies

5. Create an admin user:
   - Go to Supabase Authentication
   - Create a new user with email/password
   - Use these credentials to log into the admin panel at `/admin/login`

6. Set up local Stripe webhook testing (optional):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Copy the webhook secret and update `STRIPE_WEBHOOK_SECRET` in `.env.local`

7. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

## Deployment

### Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add all environment variables in Vercel's dashboard
4. Deploy!

### Stripe Webhook

After deploying to Vercel:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed` (legacy support)
4. Copy the signing secret and add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

### Post-Deployment Checklist

- [ ] All environment variables added to Vercel
- [ ] Stripe webhook endpoint configured
- [ ] Admin user created in Supabase Auth
- [ ] Test order flow end-to-end
- [ ] Verify images upload to storage
- [ ] Check admin panel displays orders correctly

## Project Structure

```
schuppenweg/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── upload/page.tsx          # Photo upload flow
│   ├── checkout/page.tsx        # Shipping + payment
│   ├── success/page.tsx         # Confirmation + image upload
│   ├── admin/
│   │   ├── page.tsx             # Orders list
│   │   ├── [id]/page.tsx        # Order detail
│   │   └── login/page.tsx       # Admin login
│   ├── api/
│   │   ├── create-payment-intent/ # Create Stripe payment intent
│   │   ├── complete-order/      # Upload images after payment
│   │   ├── get-image-url/       # Generate signed URLs for images
│   │   └── webhooks/stripe/     # Stripe webhook (creates order)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                      # Reusable UI components
│   ├── landing/                 # Landing page sections
│   ├── upload/                  # Upload flow components
│   ├── layout/                  # Header, Footer
│   └── admin/                   # Admin components
├── lib/
│   ├── supabase/                # Supabase clients
│   ├── stripe.ts                # Stripe client
│   ├── types.ts                 # TypeScript types
│   ├── utils.ts                 # Helpers
│   ├── context/                 # React context
│   └── hooks/                   # Custom hooks
├── scripts/
│   └── verify-supabase.ts       # Verify Supabase setup
├── supabase/
│   └── schema.sql               # Database schema (reference)
└── public/
```

## Database Schema

For complete schema documentation, see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

### orders
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | TEXT | Customer email |
| customer_name | TEXT | Customer full name |
| address | TEXT | Street address |
| city | TEXT | City |
| postal_code | TEXT | German postal code (5 digits) |
| payment_intent_id | TEXT | Stripe payment ID |
| payment_status | TEXT | pending/paid/failed |
| diagnosis | TEXT | oily/dry (set by admin) |
| tracking_number | TEXT | Shipping tracking (set by admin) |
| status | TEXT | pending/paid/diagnosed/shipped/delivered |
| created_at | TIMESTAMP | Order creation time |
| updated_at | TIMESTAMP | Last update time |

### order_images
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | UUID | Foreign key to orders (CASCADE DELETE) |
| image_url | TEXT | Supabase storage URL |
| position | TEXT | front/back/left/right/top |
| created_at | TIMESTAMP | Upload time |

### Storage

**head-images bucket** (private):
- Max file size: 5 MB
- Allowed types: JPEG, PNG, WebP
- Structure: `{order_id}/{position}.jpg`

## Application Flow

1. **Upload** → User uploads 5 photos (compressed to <2MB)
2. **Checkout** → User enters shipping details and pays €30
3. **Webhook** → Stripe sends payment success, order created in database
4. **Success** → Images uploaded to Supabase Storage, order_images records created
5. **Admin** → Dermatologist reviews images, sets diagnosis (oily/dry), adds tracking number

## Testing

### Test Payment Flow

Use Stripe test cards:
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`

Any future expiry date and any 3-digit CVC will work.

### Verify Supabase Setup

```bash
npm run verify-supabase
```

This script checks all database tables, storage buckets, and policies.

## License

MIT

---

Built with ❤️ in Germany. Für die Menschheit. ±0 Profit.
