# Stripe Payment Setup Guide

## Overview
This guide will help you set up Stripe for Dreamstate ticket sales.

## Ticket Types
- **Super Early Bird**: 900 THB (30 tickets)
- **Early Bird**: 1,200 THB (30 tickets)
- **General Admission**: 1,500 THB (240 tickets)
- **Donor Ticket**: 2,000 THB (unlimited)

## Discount Codes
- **notacult**: 30% off General Admission (1,500 THB → 1,050 THB)
- **valleylove**: 30% off General Admission (1,500 THB → 1,050 THB)

---

## Step 1: Create Stripe Account

1. Go to https://stripe.com
2. Sign up for a new account
3. Switch to **Test Mode** (toggle in top right)

---

## Step 2: Create Products in Stripe

Go to https://dashboard.stripe.com/test/products

### Product 1: Super Early Bird
1. Click **"+ Add product"**
2. Fill in:
   - **Name**: `Super Early Bird`
   - **Description**: `Limited super early bird pricing - 30 tickets only!`
   - **Pricing**: One-time payment
   - **Price**: `900` THB
   - **Currency**: THB
3. Click **"Save product"**
4. **Copy the Price ID** (starts with `price_...`) - you'll need this!

### Product 2: Early Bird
- **Name**: `Early Bird`
- **Description**: `Early bird pricing - 30 tickets only!`
- **Price**: `1200` THB
- Copy the **Price ID**

### Product 3: General Admission
- **Name**: `General Admission`
- **Description**: `Standard entry to Dreamstate`
- **Price**: `1500` THB
- Copy the **Price ID**

### Product 4: Donor Ticket
- **Name**: `Donor Ticket`
- **Description**: `Support Dreamstate with a donor ticket - includes all general admission benefits plus exclusive donor perks`
- **Price**: `2000` THB
- Copy the **Price ID**

---

## Step 3: Create Discount Codes

Go to https://dashboard.stripe.com/test/coupons

### Coupon 1: notacult
1. Click **"+ New"**
2. Fill in:
   - **Name**: `notacult`
   - **Type**: Percentage
   - **Percent off**: `30`
   - **Duration**: Forever (or set an expiration date)
   - **Products**: Select "General Admission" product only
3. Click **"Create coupon"**

### Coupon 2: valleylove
- Same settings as above with name `valleylove`

---

## Step 4: Get API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy these keys:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...` (click "Reveal test key" to see it)

---

## Step 5: Update .env File

Edit the `.env` file in your project root:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

---

## Step 6: Update Ticket Types Script

Edit `scripts/add-ticket-types.ts` and replace the placeholder Price IDs:

```typescript
stripePriceId: 'price_YOUR_SUPER_EARLY_BIRD_PRICE_ID',  // Line for Super Early Bird
stripePriceId: 'price_YOUR_EARLY_BIRD_PRICE_ID',        // Line for Early Bird
stripePriceId: 'price_YOUR_GENERAL_ADMISSION_PRICE_ID', // Line for General Admission
stripePriceId: 'price_YOUR_DONOR_TICKET_PRICE_ID',      // Line for Donor Ticket
```

---

## Step 7: Add Ticket Types to Database

Run this command to add the ticket types:

```bash
npm run tickets:add
```

---

## Step 8: Set Up Webhook (for production)

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click **"+ Add endpoint"**
3. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Copy the **Signing secret** (starts with `whsec_...`)
6. Add to `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
   ```

For local testing, use Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Step 9: Test the Checkout

1. Start the dev server: `npm run dev`
2. Go to http://localhost:3000
3. Click "Buy Tickets"
4. Select a ticket type and quantity
5. Click "Proceed to Payment"
6. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any postal code
7. Complete the payment

To test discount codes:
- In Stripe Checkout, click "Add promotion code"
- Enter `notacult` or `valleylove`
- The discount should apply to General Admission tickets only

---

## Checklist

- [ ] Created Stripe account
- [ ] Created 4 products in Stripe
- [ ] Copied all 4 Price IDs
- [ ] Created 2 discount coupons
- [ ] Got API keys (publishable & secret)
- [ ] Updated `.env` file with Stripe keys
- [ ] Updated `scripts/add-ticket-types.ts` with Price IDs
- [ ] Ran `npm run tickets:add` successfully
- [ ] Tested checkout with test card
- [ ] Tested discount codes

---

## Going Live

When ready for production:

1. Switch Stripe to **Live Mode**
2. Recreate all products and coupons in Live Mode
3. Get **Live API keys**
4. Update `.env` with live keys
5. Run `npm run tickets:add` again (or manually update price IDs in database)
6. Set up webhook with live endpoint
7. Test thoroughly before announcing!
