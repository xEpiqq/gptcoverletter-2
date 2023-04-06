'use client'
import s from './page.module.css'
import React, { useState } from 'react';
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import {PaymentElement} from '@stripe/react-stripe-js';


const stripePromise = loadStripe('pk_test_51Mn4sZHpzbXtemiL0XN5qLTlaBxkoriYCe4gwg8Vq7TQxYs2CLpIC5HZahV7Xyf0EfKlq7JhzcG6GP2TTwjbsi8t00nALOso66');

export default function Home() {

  const basic_price_id = "price_1MpKHWHpzbXtemiLvV57mUHU"
  const premium_price_id = "price_1MpKOEHpzbXtemiLEEwFEXJV"

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  const options = {
    clientSecret: clientSecret,
    appearance: { theme: 'stripe' }
  };

  async function createCustomer() {
    const response = await fetch('/api/createstripecustomer', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ email, name })});
    const customer_object = await response.json();
    return customer_object.id
  }

  // store customer id in the firestore database
  // check if a customer id already exists, if so use that, if not create one

  async function subscribeBasic() {
    const customer_id = await createCustomer();
    const response = await fetch('/api/createstripesub', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ priceId: basic_price_id, customerId: customer_id })});
    const responseData = await response.json();
    console.log(`subscriptionId: ${responseData.subscriptionId}`)
    console.log(`current period end: ${responseData.current_period_end}`)
    console.log(`customer: ${responseData.customer}`)
    console.log(`client secret: ${responseData.clientSecret}`)
    setClientSecret(responseData.clientSecret)
  }

  async function subscribePremium() {
    console.log("dummy function")
  }

  if (clientSecret) {
    return (
      <Elements stripe={stripePromise} options={options}>
        <form>
          <PaymentElement />
          <button>Submit</button>
        </form>
      </Elements>
    )
  }

  return (
    <div className={s.container}>
      <h1>Stripe test</h1>
      <h4>pass email & name automatically when signed in but for now type</h4>
      <input type="email" value={email} onChange={(e) => {setEmail(e.target.value)}} placeholder="Enter your email address"/>
      <input type="email" value={name} onChange={(e) => {setName(e.target.value)}} placeholder="Enter your full name"/>
      <button className={s.sub_basic} onClick={subscribeBasic}>BASIC PLAN</button>
      <button className={s.sub_premium} onClick={subscribePremium}>PREMIUM PLAN</button>
    </div>
    )
}
