import { NextResponse } from 'next/server';
import { buffer } from 'micro';
import Stripe from 'stripe';
var getRawBody = require('raw-body')
import { getFirestore, collection, addDoc, setDoc, doc, getDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
import app from '../../components/FirebaseApp'

const db = getFirestore(app);

/////////////////////////STRIPE LIVE MODE/////////////////////////////
const stripe_secret_key = process.env.STRIPE_REAL_SECRET_KEY; // production mode
const stripe = Stripe(stripe_secret_key) // production mode
const endpointSecret = process.env.STRIPE_WEBHOOK_ENDPOINT; // production mode
//////////////////////////////////////////////////////////////////////

// ///////////////////////////STRIPE TEST MODE/////////////////////////////
// const stripe_secret_test_key = process.env.STRIPE_SECRET_TEST_KEY; // test mode
// const stripe = Stripe(stripe_secret_test_key) // test mode
// const endpointSecret = "whsec_8e2ff906dd09de3e52c1c391f3ed020eabc58cf1e305bda9166d52ccddb89e01" // test mode
// ////////////////////////////////////////////////////////////////////////


export const config = {
    api: {
      bodyParser: false,
    },
  }

export default async function stripe_webhook(req, res) { 
    const sig = req.headers['stripe-signature'];
    const reqBuffer = await buffer(req)
    let event;
    try {
      event = stripe.webhooks.constructEvent(reqBuffer, sig, endpointSecret);
    } catch (err) {
        console.log(err);
        console.log(`⚠️  Webhook signature verification failed.`);
        console.log(
          `⚠️  Check the env file and enter the correct webhook secret.`
        );
        return res.sendStatus(400);
    }

    const dataObject = event.data.object;

    switch (event.type) {

        case 'customer.subscription.created':
            subscriptionCreated(dataObject)
            break
        case 'customer.subscription.updated':
            subscriptionUpdated(dataObject)
            break
        case 'customer.subscription.deleted':
            subscriptionDeleted(dataObject)
            break;
        default:
        
    }

    res.status(200).json({received: true})

}


async function subscriptionCreated(dataObject) {

  console.log('customer subscription created!!!')
  const product_id = dataObject.items.data[0].price.product
  const subscription_id = dataObject.id
  const subscription_status = dataObject.status
  const customer_id = dataObject.customer

  const usersRef = collection(db, "users");
  // Create a query to search for the document with the specified customer_id
  const queryRef = query(usersRef, where("stripe_customer_id", "==", customer_id));
  const querySnap = await getDocs(queryRef);
  // Check if the query snapshot has any documents
  const docRef = querySnap.docs[0].ref;
  // Update the fields of the document with the specified data
  // await updateDoc(docRef, {
  //   productid: product_id,
  //   subscriptionid: subscription_id,
  //   subscription_status: subscription_status,
  //   customerid: customer_id
  // });
  // dont add to the database yet. it can overwrite an active subscription with "incomplete"

}

async function subscriptionUpdated(dataObject) {
  console.log('customer subscription updated!!!')
  const product_id = dataObject.items.data[0].price.product
  const subscription_id = dataObject.id
  const subscription_status = dataObject.status
  const customer_id = dataObject.customer

  const usersRef = collection(db, "users");
  // Create a query to search for the document with the specified customer_id
  const queryRef = query(usersRef, where("stripe_customer_id", "==", customer_id));
  const querySnap = await getDocs(queryRef);
  // Check if the query snapshot has any documents
  const docRef = querySnap.docs[0].ref;
  // Update the fields of the document with the specified data
  await updateDoc(docRef, {
    productid: product_id,
    subscriptionid: subscription_id,
    subscription_status: subscription_status,
  });
}

async function subscriptionDeleted(dataObject) {
  console.log('customer subscription deleted!!!')
  const customer_id = dataObject.customer
  const usersRef = collection(db, "users");
  const queryRef = query(usersRef, where("stripe_customer_id", "==", customer_id));
  const querySnap = await getDocs(queryRef);
  const docRef = querySnap.docs[0].ref;

  await updateDoc(docRef, {
    subscription_status: "cancelled",
  });
}