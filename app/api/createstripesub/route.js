import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = Stripe('sk_test_51Mn4sZHpzbXtemiLwuiQd4Fbki0Ooy3B6fVkQdRPBPDNd6j5qIHaht0RWaDOJACazPY19FHcp7bnOUbloAPL6Tiv00MdLhx6WM')

export async function POST(request) {
    const res = await request.json();
    const priceId = res.priceId;
    const customerId = res.customerId;
    
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId, items: [{ price: priceId, }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      })
      return NextResponse.json({ subscriptionId: subscription.id, current_period_end: subscription.current_period_end, customer: subscription.customer, clientSecret: subscription.latest_invoice.payment_intent.client_secret });
    } catch (error) {
      return NextResponse.error(400, { error: { message: error.message } });    
    }
    
}