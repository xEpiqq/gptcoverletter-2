import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe_secret_key = process.env.STRIPE_REAL_SECRET_KEY;
const stripe = Stripe(stripe_secret_key)

export async function POST(request) {
    const res = await request.json();
    const results = await createOrUpdateStripeCustomer(res.email, res.name, res.user_id);
    return NextResponse.json(results);
}

async function createOrUpdateStripeCustomer(emailAddress, fullname, userid) {
  const existingCustomers = await stripe.customers.list({ email: emailAddress, limit: 1 });
  // check if customer already exists in the DB
  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  } else {
    const customer = await stripe.customers.create({
      email: emailAddress,
      name: fullname,
      metadata: {
        uid: userid,
      },
    });
    return customer;
  }
}