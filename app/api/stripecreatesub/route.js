import db from "@/utils/db";
import Stripe from "stripe";
import { getFirestore, collection, addDoc, setDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import app from '../../../components/FirebaseApp'
const dbtwo = getFirestore(app);

/////////////////////////STRIPE LIVE MODE/////////////////////////////
const stripe_secret_key = process.env.STRIPE_REAL_SECRET_KEY; // production mode
const stripe = Stripe(stripe_secret_key); // production mode
const basic_price_id = process.env.BASIC_PRICE_ID;
//////////////////////////////////////////////////////////////////////

// ///////////////////////////STRIPE TEST MODE/////////////////////////////
// const stripe_secret_test_key = process.env.STRIPE_SECRET_TEST_KEY; // test mode
// const stripe = Stripe(stripe_secret_test_key) // test mode
// const basic_price_id = "price_1MoSC4HpzbXtemiLsVTqsFIG"
// ////////////////////////////////////////////////////////////////////////

export async function POST(request) {

  let clientSecret;

  const body = await request.json();
  const { user_id } = body
  const userRef = doc(dbtwo, "users", user_id)
  const userDoc = await getDoc(userRef)
  const firestore_user = userDoc.data()

  try {
    const subscription = await stripe.subscriptions.create({
      customer: firestore_user.stripe_customer_id,
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
