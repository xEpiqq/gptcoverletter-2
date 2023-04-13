import Stripe from "stripe";

// /////////////////////////STRIPE LIVE MODE/////////////////////////////
// const stripe_secret_key = process.env.STRIPE_REAL_SECRET_KEY; // production mode
// const stripe = Stripe(stripe_secret_key); // production mode
// //////////////////////////////////////////////////////////////////////

///////////////////////////STRIPE TEST MODE/////////////////////////////
const stripe_secret_test_key = process.env.STRIPE_SECRET_TEST_KEY; // test mode
const stripe = Stripe(stripe_secret_test_key) // test mode
////////////////////////////////////////////////////////////////////////

export async function POST(request) {

    const body = await request.json();
    const { subscriptionid } = body;
    console.log(`subscriptionid is (from api route): ${subscriptionid}`)

    try {
        const deletedSubscription = await stripe.subscriptions.del(subscriptionid)
        console.log("subscription cancelled")
        return new Response(JSON.stringify({ deletedSubscription }));
    } catch {
        console.log("subscription not cancelled")
        return new Response( JSON.stringify({ error: "Something happened, subscription not cancelled" }));

    }

}
