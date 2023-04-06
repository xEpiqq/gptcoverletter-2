import db from "@/utils/db";
import Stripe from "stripe";

const stripe_secret_key = process.env.STRIPE_REAL_SECRET_KEY;
const stripe = Stripe(stripe_secret_key);

export async function POST(request) {
  const body = await request.json();
  const { email, name, user_id } = body;

  const basic_price_id = process.env.BASIC_PRICE_ID;

  const userRef = db.collection("users").doc(user_id);
  const userDoc = await userRef.get();

  if (!userRef) {
    return new Response("User not found", { status: 404 });
  }

  const user = userDoc.data();

  let customer_id;
  let clientSecret;

  console.log("here")
  const existingCustomers = await stripe.customers.list({
    email: email,
    limit: 1,
  });
  // check if customer already exists in the DB
  if (existingCustomers.data.length > 0) {
    const customer = existingCustomers.data[0];
    customer_id = customer.id;
  } else {
    const customer = await stripe.customers.create({
      email: email,
      name: name,
      metadata: {
        uid: user_id,
      },
    });
    customer_id = customer.id;
    await userRef.update({ customer_id: customer_id });
  }
  console.log(`customer_id: ${customer_id}`)

  // return client secert
  console.log(customer_id)
  console.log(basic_price_id)
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customer_id,
      items: [{ price: basic_price_id }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });
    clientSecret = subscription.latest_invoice.payment_intent.client_secret;
  } catch (error) {
    console.log(error);
    return new Response(error.message, { status: 500 });
  }

  return new Response(JSON.stringify({ clientSecret }));
}
