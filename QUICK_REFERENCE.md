# Quick Reference Guide

## Common Commands

### Development
```bash
npm run dev                 # Start dev server (http://localhost:3000)
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run ESLint
```

### Database
```bash
npm run db:generate        # Generate migrations from schema
npm run db:migrate         # Run migrations
npm run db:seed            # Seed factions and counter
npm run db:studio          # Open database GUI
npm run orders:view        # View all orders
npm run tickets:check      # Check ticket availability
```

### Stripe (Local Development)
```bash
stripe login                                                    # Authenticate
stripe listen --forward-to localhost:3000/api/webhooks/stripe  # Forward webhooks
stripe events list --limit 10                                  # View recent events
```

## Environment Variables

Required in `.env`:
```env
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
SITE_BASE_URL=http://localhost:3000
```

## Test Payment Cards

| Purpose | Card Number | Details |
|---------|-------------|---------|
| Success | 4242 4242 4242 4242 | Any future date, any CVC, any ZIP |
| Requires Auth | 4000 0025 0000 3155 | Any future date, any CVC, any ZIP |
| Declined | 4000 0000 0000 0002 | Any future date, any CVC, any ZIP |

## Faction Assignment

Order sequence → Faction mapping:
- Order #1, #5, #9... → Déjà Vu (index 0)
- Order #2, #6, #10... → Lucid (index 1)
- Order #3, #7, #11... → Hypnotic (index 2)
- Order #4, #8, #12... → Drift (index 3)

Formula: `faction_index = (order_sequence_number - 1) % 4`

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/tickets/availability` | GET | Get ticket availability |
| `/api/checkout/session` | POST | Create Stripe checkout |
| `/api/webhooks/stripe` | POST | Handle Stripe webhooks |
| `/api/order/by-session` | GET | Get order by session ID |

## File Structure

```
Key files:
├── app/page.tsx                        # Landing page
├── app/thank-you/page.tsx              # Thank you page
├── components/TicketPurchase.tsx       # Ticket selection UI
├── app/api/webhooks/stripe/route.ts    # Faction assignment logic
├── lib/db/schema.ts                    # Database schema
└── scripts/seed.ts                     # Initial data
```

## Database Tables

**factions** - The 4 factions (seeded)
- id, name, display_name, description, color_token, icon_url

**ticket_types** - Ticket products (manual insert required)
- id, stripe_price_id, name, description, price, inventory

**ticket_orders** - Completed purchases
- id, session_id, email, ticket_type_id, quantity, sequence_number, faction_id

**ticket_counter** - Sequence number generator
- id (always 1), current_value

## Adding a Ticket Type

1. Create in Stripe Dashboard → Products
2. Copy Price ID (starts with `price_`)
3. Insert into database:

```sql
INSERT INTO ticket_types (
  stripe_price_id, name, description, currency,
  base_price_minor, total_inventory, is_active
) VALUES (
  'price_YOUR_ID_HERE',
  'General Admission',
  'Full access to all experiences',
  'thb',
  150000,  -- 1500.00 THB (price in smallest unit)
  500,     -- Total tickets (NULL for unlimited)
  true
);
```

## Troubleshooting

**Problem**: Webhook not processing
**Solution**: Ensure `stripe listen` is running and webhook secret is correct

**Problem**: "Order not found" on thank-you page
**Solution**: Wait 2-3 seconds for webhook to process, check server logs

**Problem**: No tickets showing
**Solution**: Insert ticket types into database after creating in Stripe

**Problem**: Build fails with "DATABASE_URL not set"
**Solution**: Use placeholder: `DATABASE_URL=postgresql://x npm run build`

## Customization Points

1. **Content**: Edit components in `/components`
2. **Styles**: Modify `tailwind.config.ts` and `app/globals.css`
3. **Factions**: Update `scripts/seed.ts` and re-seed
4. **Images**: Add to `/public/images` and update component imports

## Deployment Checklist

- [ ] Database created and migrated
- [ ] Stripe products created
- [ ] Ticket types added to database
- [ ] Environment variables set in hosting platform
- [ ] Stripe webhook endpoint configured
- [ ] Test purchase completed
- [ ] Production domain set in Stripe webhook

## Support Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Stripe Docs**: https://stripe.com/docs
- **Drizzle Docs**: https://orm.drizzle.team
- **Tailwind Docs**: https://tailwindcss.com/docs

## Quick Test Flow

1. Start dev server: `npm run dev`
2. Start Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Visit: http://localhost:3000
4. Select ticket and quantity
5. Click "Proceed to Payment"
6. Use test card: 4242 4242 4242 4242
7. Complete payment
8. See faction assignment on thank-you page
9. Verify: `npm run orders:view`
