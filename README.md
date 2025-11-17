# Dreamstate Ticketing System

A complete Next.js ticketing platform for Dreamstate events with Stripe payment integration and faction-based assignment system.

## Features

- **Responsive Marketing Site**: Mobile-first design with smooth scrolling and transitions
- **Stripe Payments**: Secure checkout with Stripe integration
- **Faction Assignment**: Automatic round-robin faction assignment based on order sequence
- **Real-time Availability**: Live ticket availability tracking
- **Secure Backend**: Server-side validation and webhook processing
- **SEO Optimized**: Open Graph tags and metadata for social sharing

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM (Neon serverless)
- **Payments**: Stripe
- **Hosting**: Optimized for Vercel deployment

## Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── checkout/session/     # Stripe checkout session creation
│   │   ├── order/by-session/     # Order retrieval by session ID
│   │   ├── tickets/availability/ # Ticket availability endpoint
│   │   └── webhooks/stripe/      # Stripe webhook handler
│   ├── thank-you/                # Thank you page with faction reveal
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/
│   ├── Header.tsx                # Site header
│   ├── Hero.tsx                  # Hero section
│   ├── FactionGrid.tsx           # Faction display grid
│   ├── TicketInfo.tsx            # Ticket information
│   └── TicketPurchase.tsx        # Ticket purchase form
├── lib/
│   ├── db/
│   │   ├── schema.ts             # Database schema (Drizzle)
│   │   └── index.ts              # Database client
│   └── types.ts                  # Shared TypeScript types
├── scripts/
│   ├── migrate.ts                # Database migration script
│   └── seed.ts                   # Database seeding script
└── drizzle.config.ts             # Drizzle configuration

```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ (recommended: 20+)
- PostgreSQL database (or Neon account for serverless PostgreSQL)
- Stripe account

### 2. Database Setup

#### Option A: Using Neon (Recommended for production)

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

#### Option B: Local PostgreSQL

1. Install PostgreSQL
2. Create a new database:
   ```bash
   createdb dreamstate
   ```

### 3. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your values:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/dreamstate
   # Or for Neon:
   # DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dreamstate?sslmode=require

   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

   # Site
   SITE_BASE_URL=http://localhost:3000
   ```

### 4. Stripe Configuration

1. **Get API Keys**:
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Navigate to Developers → API keys
   - Copy the Secret key and Publishable key

2. **Create Products & Prices**:
   ```bash
   # In Stripe Dashboard:
   # 1. Go to Products
   # 2. Click "Add Product"
   # 3. Create ticket types (e.g., "General Admission", "VIP")
   # 4. Set prices in Thai Baht (THB)
   # 5. Copy the Price ID (starts with price_...)
   ```

3. **Setup Webhook** (for local development):
   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe

   # Login to Stripe
   stripe login

   # Forward webhooks to local server
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   # This will output a webhook signing secret (whsec_...)
   # Add this to your .env as STRIPE_WEBHOOK_SECRET
   ```

4. **Setup Webhook** (for production):
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events to listen for: `checkout.session.completed`
   - Copy the signing secret to your production environment

### 5. Database Migration & Seeding

```bash
# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate

# Seed factions and initialize counter
npm run db:seed
```

### 6. Add Ticket Types to Database

After setting up Stripe products, manually insert ticket types into your database:

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
  'price_xxxxx', -- Your Stripe Price ID
  'General Admission',
  'Full access to all performance areas and experiences',
  'thb',
  150000, -- 1500 THB in satang (smallest unit)
  500, -- Total tickets available (or NULL for unlimited)
  true
);
```

### 7. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables from your `.env`
   - Deploy

3. **Configure Stripe Webhook**:
   - Update `STRIPE_WEBHOOK_SECRET` with production webhook secret
   - Add webhook endpoint in Stripe Dashboard pointing to your Vercel URL

### Environment Variables for Production

Make sure to set these in Vercel/Netlify:
- `DATABASE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `SITE_BASE_URL` (your production domain)

## API Endpoints

### GET `/api/tickets/availability`
Returns available ticket types and inventory.

**Response**:
```json
{
  "ticketTypes": [
    {
      "id": 1,
      "name": "General Admission",
      "description": "...",
      "basePriceMinor": 150000,
      "currency": "thb",
      "remaining": 120,
      "sold": 80,
      "totalInventory": 200
    }
  ]
}
```

### POST `/api/checkout/session`
Creates a Stripe checkout session.

**Request**:
```json
{
  "ticketTypeId": 1,
  "quantity": 2,
  "customerEmail": "user@example.com" // optional
}
```

**Response**:
```json
{
  "url": "https://checkout.stripe.com/...",
  "sessionId": "cs_..."
}
```

### GET `/api/order/by-session?session_id=cs_xxx`
Retrieves order information for thank you page.

**Response**:
```json
{
  "faction": {
    "displayName": "Lucid",
    "description": "...",
    "colorToken": "faction-lucid",
    "iconUrl": "/images/factions/lucid.svg"
  },
  "orderSequenceNumber": 23,
  "quantity": 2
}
```

### POST `/api/webhooks/stripe`
Stripe webhook handler (automatically processes `checkout.session.completed`).

## Faction Assignment Logic

Factions are assigned in round-robin order based on the order sequence number:

```typescript
function assignFaction(orderSequenceNumber: number): number {
  return (orderSequenceNumber - 1) % 4;
}
```

- Order #1 → Déjà Vu (index 0)
- Order #2 → Lucid (index 1)
- Order #3 → Hypnotic (index 2)
- Order #4 → Drift (index 3)
- Order #5 → Déjà Vu (index 0)
- ...and so on

The `ticket_counter` table maintains a global sequence number that increments atomically for each successful order.

## Database Schema

### factions
- `id` - Primary key
- `name` - Enum: DEJA_VU, LUCID, HYPNOTIC, DRIFT
- `display_name` - Human-readable name
- `description` - Faction description
- `color_token` - CSS color class identifier
- `icon_url` - Path to faction icon

### ticket_types
- `id` - Primary key
- `stripe_price_id` - Stripe Price ID
- `name` - Ticket name
- `description` - Ticket description
- `currency` - Currency code (e.g., "thb")
- `base_price_minor` - Price in smallest currency unit
- `total_inventory` - Total tickets available (NULL = unlimited)
- `is_active` - Whether ticket is currently for sale

### ticket_orders
- `id` - Primary key
- `stripe_checkout_session_id` - Stripe session ID (unique)
- `stripe_payment_intent_id` - Stripe payment ID
- `customer_email` - Customer email
- `ticket_type_id` - Foreign key to ticket_types
- `quantity` - Number of tickets purchased
- `order_sequence_number` - Global order number (unique)
- `assigned_faction_id` - Foreign key to factions
- `status` - PENDING, PAID, CANCELED, REFUNDED

### ticket_counter
- `id` - Always 1 (singleton)
- `current_value` - Current sequence number

## Security Considerations

- All Stripe operations use server-side API
- Webhook signature verification prevents tampering
- Faction assignment cannot be manipulated from client
- Inventory checks happen server-side
- No sensitive data exposed to client

## Customization

### Updating Content
- Edit component files in `/components` to update copy
- Replace placeholder images in the `Hero` component
- Update faction descriptions in the seed script

### Styling
- Modify Tailwind config in `tailwind.config.ts`
- Update faction colors in the config
- Edit global styles in `app/globals.css`

### Adding Ticket Types
Insert new rows into `ticket_types` table after creating corresponding Stripe products.

## Troubleshooting

### Webhook Not Working
- Ensure Stripe CLI is running for local development
- Check webhook signing secret is correct
- Verify endpoint is accessible (use Stripe Dashboard webhook logs)

### Faction Not Showing
- Verify webhook processed successfully (check server logs)
- Ensure database seeding completed
- Check order status is "PAID"

### Inventory Issues
- Run availability endpoint to check current state
- Verify ticket_counter is incrementing
- Check for duplicate orders (should be prevented by unique constraint)

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Drizzle Studio (database GUI)
```

## Support

For issues or questions, please contact the development team or file an issue in the repository.

## License

Proprietary - Dreamstate Event
