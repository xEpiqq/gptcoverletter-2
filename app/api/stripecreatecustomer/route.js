import db from "@/utils/db";
import Stripe from "stripe";
import { getFirestore, collection, addDoc, setDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import app from '../../../components/FirebaseApp'
const dbtwo = getFirestore(app);

/////////////////////////STRIPE LIVE MODE/////////////////////////////
const stripe_secret_key = process.env.STRIPE_REAL_SECRET_KEY; // production mode
const stripe = Stripe(stripe_secret_key); // production mode
//////////////////////////////////////////////////////////////////////

// ///////////////////////////STRIPE TEST MODE/////////////////////////////
// const stripe_secret_test_key = process.env.STRIPE_SECRET_TEST_KEY; // test mode
// const stripe = Stripe(stripe_secret_test_key) // test mode
// ////////////////////////////////////////////////////////////////////////

export async function POST(request) {
  const body = await request.json();
  const { email, name, user_id } = body;
  const userRef = doc(dbtwo, "users", user_id);
  const userDoc = await getDoc(userRef);

  if (!userRef) {
    return new Response("User not found", { status: 404 });
  }

  const user = userDoc.data();

  let customer_id;

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

  }

  await updateDoc(userRef, {
    stripe_customer_id: customer_id
  })
  console.log(`customer_id: ${customer_id}`)

  return new Response(JSON.stringify({ "stripe user created": "they were created" }));
}
