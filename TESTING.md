# Testing Guide

## Manual Testing Checklist

### 1. Landing Page Tests

- [ ] **Header displays correctly**
  - Title: "Dreamstate"
  - Subtitle: "Where circus meets the subconscious"

- [ ] **Hero section**
  - Placeholder image shows
  - Text is readable
  - "Buy Tickets" button scrolls to ticket section

- [ ] **Faction grid**
  - All 4 factions display (Déjà Vu, Lucid, Hypnotic, Drift)
  - Each has unique styling/colors
  - Hover effects work
  - Responsive on mobile (stacks vertically)

- [ ] **Ticket info section**
  - Content displays correctly
  - Section visually separated

- [ ] **Ticket purchase section**
  - Scrolls to correct position when "Buy Tickets" clicked

### 2. Ticket Availability Tests

- [ ] **API endpoint works**
  ```bash
  curl http://localhost:3000/api/tickets/availability
  ```
  - Returns ticket types
  - Shows correct pricing
  - Shows inventory (if limited)

- [ ] **Frontend displays availability**
  - Ticket types load on page
  - Prices shown correctly
  - Availability indicator shows
  - Auto-refreshes every 30 seconds

### 3. Checkout Flow Tests

#### Test Card Numbers (Stripe Test Mode)

Use these Stripe test cards:

- **Success**: `4242 4242 4242 4242`
- **Requires authentication**: `4000 0025 0000 3155`
- **Declined**: `4000 0000 0000 0002`

For all cards:
- Any future expiry date
- Any 3-digit CVC
- Any postal code

#### Checkout Steps

- [ ] **Select ticket type**
  - Can select different ticket types
  - Price updates correctly

- [ ] **Select quantity**
  - Can change quantity (1-10 or max remaining)
  - Total price calculates correctly

- [ ] **Click "Proceed to Payment"**
  - Loading state shows
  - Redirects to Stripe Checkout

- [ ] **Complete payment on Stripe**
  - Stripe page loads correctly
  - Test card accepted
  - Redirects to thank-you page

### 4. Webhook Tests

- [ ] **Webhook receives event**
  - Check terminal running `stripe listen`
  - Should see `checkout.session.completed` event

- [ ] **Order created in database**
  ```bash
  npm run orders:view
  ```
  - Order appears in list
  - Correct email
  - Correct quantity
  - Faction assigned

- [ ] **Sequence number increments**
  - Each order gets unique sequence number
  - No gaps or duplicates

- [ ] **Faction assignment correct**
  - Order #1 → Déjà Vu
  - Order #2 → Lucid
  - Order #3 → Hypnotic
  - Order #4 → Drift
  - Order #5 → Déjà Vu (wraps around)

### 5. Thank You Page Tests

- [ ] **Page loads from Stripe redirect**
  - URL has `session_id` parameter
  - Loading spinner shows briefly

- [ ] **Faction reveal works**
  - Correct faction displayed
  - Faction colors/styling applied
  - Description shows

- [ ] **Order details shown**
  - Participant number correct
  - Quantity correct
  - "What's Next" section displays

- [ ] **Return to home works**
  - Button links back to `/`

### 6. Error Handling Tests

- [ ] **Invalid session ID**
  - Visit `/thank-you?session_id=invalid`
  - Should show error message
  - Should offer return to home

- [ ] **Missing session ID**
  - Visit `/thank-you` (no parameter)
  - Should show error message

- [ ] **Sold out tickets**
  - Set `total_inventory` lower than sold
  - Should show "Sold out"
  - Purchase button disabled

- [ ] **Network errors**
  - Stop dev server
  - Try to load page
  - Should show appropriate errors (browser handles this)

### 7. Inventory Tests

- [ ] **Check initial availability**
  ```bash
  npm run tickets:check
  ```

- [ ] **Purchase tickets**
  - Complete 1-2 test purchases

- [ ] **Verify inventory decreased**
  ```bash
  npm run tickets:check
  ```
  - Sold count increased
  - Remaining decreased

- [ ] **Verify sold equals orders**
  ```bash
  npm run orders:view
  npm run tickets:check
  ```
  - Numbers should match

### 8. Responsive Design Tests

Test on different screen sizes:

- [ ] **Mobile (375px)**
  - All sections stack vertically
  - Text is readable
  - Buttons are tappable
  - No horizontal scroll

- [ ] **Tablet (768px)**
  - Faction grid shows 2x2
  - Content well-spaced
  - Images scale appropriately

- [ ] **Desktop (1280px+)**
  - Content centered with max-width
  - Spacing comfortable
  - All hover effects work

### 9. Browser Compatibility

Test in:

- [ ] **Chrome/Edge** (latest)
- [ ] **Firefox** (latest)
- [ ] **Safari** (latest)
- [ ] **Mobile Safari** (iOS)
- [ ] **Chrome Mobile** (Android)

### 10. Performance Tests

- [ ] **Lighthouse audit**
  - Open DevTools → Lighthouse
  - Run audit
  - Target: 90+ Performance, 90+ Accessibility

- [ ] **Page load time**
  - Should load in < 2 seconds on good connection

- [ ] **Images optimized**
  - Check Network tab
  - Images should be reasonable sizes

## Automated Testing (Future)

Consider adding:

1. **Unit tests** (Jest + React Testing Library)
   - Component rendering
   - Helper functions
   - Faction assignment logic

2. **Integration tests**
   - API endpoints
   - Database operations

3. **E2E tests** (Playwright)
   - Complete purchase flow
   - Webhook handling

## Common Issues & Solutions

### Webhook not processing

**Problem**: Order created but no faction assigned

**Solutions**:
1. Check `stripe listen` is running
2. Verify webhook secret in `.env`
3. Check server logs for errors
4. Verify database connection

### Wrong faction assigned

**Problem**: Faction doesn't match expected sequence

**Solutions**:
1. Check `ticket_counter` value
2. Verify no gaps in sequence numbers
3. Check faction assignment logic in webhook

### Checkout fails

**Problem**: Can't create checkout session

**Solutions**:
1. Verify Stripe API key is correct
2. Check ticket type exists
3. Verify Price ID matches Stripe
4. Check inventory availability

### Thank you page shows error

**Problem**: "Order not found"

**Solutions**:
1. Wait 2-3 seconds (webhook may be processing)
2. Check webhook processed successfully
3. Verify session ID is correct
4. Check order status is "PAID"

## Test Data Cleanup

To reset test data:

```sql
-- Delete all orders
TRUNCATE ticket_orders CASCADE;

-- Reset counter
UPDATE ticket_counter SET current_value = 0 WHERE id = 1;

-- Verify cleanup
SELECT COUNT(*) FROM ticket_orders;  -- Should be 0
SELECT current_value FROM ticket_counter;  -- Should be 0
```

Then use Stripe Dashboard to cancel/refund test payments if needed.

## Production Testing

Before going live:

- [ ] Test with real Stripe account (not test mode)
- [ ] Verify production webhook endpoint
- [ ] Test from multiple devices/networks
- [ ] Verify email notifications work (if implemented)
- [ ] Load test with realistic traffic
- [ ] Have rollback plan ready
- [ ] Monitor error logs during first sales

## Monitoring

Keep an eye on:

1. **Server logs** - Check for errors
2. **Stripe Dashboard** - Monitor payments
3. **Database** - Watch for issues
4. **Error tracking** (Sentry, etc. if implemented)
