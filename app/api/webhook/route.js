import { NextResponse } from 'next/server';
import { buffer } from 'micro';
import Stripe from 'stripe';
var getRawBody = require('raw-body')

// This is your Stripe CLI webhook secret for testing your endpoint locally.

const stripe = Stripe('sk_test_51Mn4sZHpzbXtemiLwuiQd4Fbki0Ooy3B6fVkQdRPBPDNd6j5qIHaht0RWaDOJACazPY19FHcp7bnOUbloAPL6Tiv00MdLhx6WM')
const endpointSecret = "whsec_8e2ff906dd09de3e52c1c391f3ed020eabc58cf1e305bda9166d52ccddb89e01";

export const config = {
    api: {
      bodyParser: false,
    },
  }

  export default async (req, res) => {
    console.log("webhook")
    // const sig = req.headers['stripe-signature'];
    // const reqBuffer = await buffer(req)
    // let event;
    // try {
    //   event = stripe.webhooks.constructEvent(reqBuffer, sig, endpointSecret);
    //   console.log(event)
    // } catch (err) {
    //   console.log(`%c event`, "color: green;")
    //   console.log(`%c err`, 'color: red;')
    // }
    
    // switch (event.type) {
    //   case 'payment_intent.succeeded':
    //     const paymentIntentSucceeded = event.data.object;
    //     console.log("PAYMENT INTENT SUCCEEDED YAY")
    //     console.log("PAYMENT INTENT SUCCEEDED YAY")
    //     console.log("PAYMENT INTENT SUCCEEDED YAY")
    //     console.log("PAYMENT INTENT SUCCEEDED YAY")
    //     break;
    //   // ... handle other event types
    //   default:
    //     console.log(`Unhandled event type ${event.type}`);
    // }
    // res.send(200)
    // return NextResponse.json({ message: 'Success 200' });
  };
  

// export async function POST(request) {

//     const rawBody = await getRawBody(reqest);

//     // console.log(request)
//     const sig = request.headers['stripe-signature'];
// //   const reqBuffer = await buffer(request)

//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
//     console.log(event)
//   } catch (err) {
//     console.log(`%c event`, "color: green;")
//     console.log(`%c err`, 'color: red;')
//   }

//   switch (event.type) {
//     case 'payment_intent.succeeded':
//       const paymentIntentSucceeded = event.data.object;
//       console.log("PAYMENT INTENT SUCCEEDED YAY")
//       console.log("PAYMENT INTENT SUCCEEDED YAY")
//       console.log("PAYMENT INTENT SUCCEEDED YAY")
//       console.log("PAYMENT INTENT SUCCEEDED YAY")
//       break;
//     // ... handle other event types
//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   return NextResponse.json({ message: 'Success 200' });

// }