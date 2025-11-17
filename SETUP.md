# Quick Setup Guide

## 🚀 Fast Track Setup (5 minutes)

### 1. Install Dependencies ✅
```bash
npm install
```

### 2. Set Up Database

**Using Neon (Easiest)**:
1. Go to https://neon.tech and create free account
2. Create new project
3. Copy connection string

**Using Local PostgreSQL**:
```bash
createdb dreamstate
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your values
```

Minimum required:
- `DATABASE_URL` - Your PostgreSQL connection string
- `STRIPE_SECRET_KEY` - From Stripe Dashboard
- `STRIPE_WEBHOOK_SECRET` - From Stripe CLI or Dashboard
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - From Stripe Dashboard
- `SITE_BASE_URL` - http://localhost:3000 (for dev)

### 4. Set Up Stripe

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks (keep this running in a separate terminal)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook secret (whsec_...) to `.env` as `STRIPE_WEBHOOK_SECRET`

### 5. Create Stripe Products

1. Go to Stripe Dashboard → Products
2. Create a product (e.g., "General Admission")
3. Add a price in THB (e.g., 1500.00)
4. Copy the Price ID (price_...)

### 6. Initialize Database

```bash
# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate

# Seed factions
npm run db:seed
```

### 7. Add Ticket Type to Database

Connect to your database and run:

```sql
INSERT INTO ticket_types (
  stripe_price_id,
  name,
  description,
  currency,
  base_price_minor,
  total_inventory,
  is_active
) VALUES (
  'price_PASTE_YOUR_PRICE_ID_HERE',
  'General Admission',
  'Full access to all Dreamstate experiences',
  'thb',
  150000,  -- 1500.00 THB
  500,     -- Total tickets (or NULL for unlimited)
  true
);
```

### 8. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 🧪 Testing the Flow

1. **Browse**: Go to http://localhost:3000
2. **Select Tickets**: Choose ticket type and quantity
3. **Checkout**: Click "Proceed to Payment"
4. **Test Payment**: Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code
5. **Faction Reveal**: You'll be redirected to thank-you page with your faction

## 📋 Checklist

- [ ] Dependencies installed
- [ ] Database created
- [ ] `.env` configured
- [ ] Stripe CLI running (webhooks forwarding)
- [ ] Stripe products created
- [ ] Database migrated
- [ ] Database seeded
- [ ] Ticket types added
- [ ] Dev server running
- [ ] Test purchase completed

## 🐛 Common Issues

**"DATABASE_URL is not set"**
- Make sure `.env` file exists and contains `DATABASE_URL`

**"Failed to create checkout session"**
- Verify Stripe API keys are correct
- Check that ticket type exists in database
- Ensure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set

**"Order not found" on thank-you page**
- Ensure Stripe webhook is running (`stripe listen`)
- Check webhook secret matches in `.env`
- Look for errors in terminal where webhook is running

**No tickets showing**
- Verify you inserted ticket types into `ticket_types` table
- Check `is_active = true`
- Ensure Stripe Price ID is correct

## 🔧 Useful Commands

```bash
# View database in browser
npm run db:studio

# Check webhook events
stripe events list --limit 10

# View logs
# (Check terminal where dev server is running)

# Reset database (careful!)
# Drop and recreate database, then run migrate and seed again
```

## 📝 Next Steps

1. **Customize Content**: Edit components in `/components`
2. **Add Images**: Replace placeholder images
3. **Update Copy**: Modify text in components
4. **Style Tweaks**: Adjust colors in `tailwind.config.ts`
5. **Test Thoroughly**: Try different ticket quantities and types

## 🚀 Ready to Deploy?

See the **Deployment** section in README.md for Vercel deployment instructions.
