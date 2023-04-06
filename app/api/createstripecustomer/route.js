import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = Stripe('sk_test_51Mn4sZHpzbXtemiLwuiQd4Fbki0Ooy3B6fVkQdRPBPDNd6j5qIHaht0RWaDOJACazPY19FHcp7bnOUbloAPL6Tiv00MdLhx6WM')

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
  } else {Loading
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