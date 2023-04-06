import { NextResponse } from 'next/server';
import { buffer } from 'micro';
import Stripe from 'stripe';

const stripe = Stripe('sk_test_51Mn4sZHpzbXtemiLwuiQd4Fbki0Ooy3B6fVkQdRPBPDNd6j5qIHaht0RWaDOJACazPY19FHcp7bnOUbloAPL6Tiv00MdLhx6WM')
const signingSecret = "whsec_8e2ff906dd09de3e52c1c391f3ed020eabc58cf1e305bda9166d52ccddb89e01"

export const config = {
    api: {
      bodyParser: false
    }
  };

export async function POST(request) {
    // const req = request
    const signature = req.headers['stripe-signature'];
    const reqBuffer = await buffer(req)
    let event
    try {
        event = stripe.webhooks.constructEvent(reqBuffer, signature, signingSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        event = stripe.webhooks.constructEvent(
          req.body,
          req.headers['stripe-signature'],
          "whsec_8e2ff906dd09de3e52c1c391f3ed020eabc58cf1e305bda9166d52ccddb89e01" //web hook signing secret
        );
      } catch (err) {
        console.log(err);
        console.log(`⚠️  Webhook signature verification failed.`);
        console.log(
          `⚠️  Check the env file and enter the correct webhook secret.`
        );
        return NextResponse.json({ message: 'Failed 400' });

      }
      const dataObject = event.data.object;
  
      switch (event.type) {
        case 'invoice.paid':
            console.log("the invoice has been paid")
          break;
        case 'invoice.payment_failed':
            console.log("the payment failed")
          break;
        case 'customer.subscription.deleted':
          if (event.request != null) {
          } else {
          }
          break;
        default:
      }
    return NextResponse.json({ message: 'Success 200' });
}
    

// import initStripe from 'stripe';

// const handler = async (req, res) => {
//     const stripe = initStripe(process.env.STRIPE_SECRET_KEY);
//     const signature = req.headers['stripe-signature'];
//     const signingSecret = process.env.STRIPE_SIGNING_SECRET;
//     const reqBuffer = await buffer(req)
//     let event
//     try {
//         event = stripe.webhooks.constructEvent(reqBuffer, signature, signingSecret);
//     } catch (err) {
//         return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     if (event.type === 'invoice.paid') {
//         const invoice = event.data.object;
//         console.log('Invoice paid!', invoice);
//     }

//     if (event.type === 'invoice.payment_failed') {
//         const invoice = event.data.object;
//         console.log('Invoice payment failed!', invoice);
//     }

//     if (event.type === 'customer.subscription.deleted') {
//         const subscription = event.data.object;
//         console.log('Subscription deleted!', subscription);
//     }

//     res.status(200).json({ received: true });

// }

// export default handler 