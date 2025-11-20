import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

async function checkPrice() {
  try {
    const price = await stripe.prices.retrieve('price_1SVP23RqZ4vIrmRFEnrIRPp8');
    console.log('Price details:', JSON.stringify(price, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPrice();
