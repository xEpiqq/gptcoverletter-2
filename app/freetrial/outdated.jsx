'use client'
import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CheckoutForm } from "./checkoutform"
import s from "./freetrial.module.scss";
 
const stripePromise = loadStripe('pk_test_51Mn4sZHpzbXtemiL0XN5qLTlaBxkoriYCe4gwg8Vq7TQxYs2CLpIC5HZahV7Xyf0EfKlq7JhzcG6GP2TTwjbsi8t00nALOso66');
 
export default function App() {
  const [clientSecret, setClientSecret] = useState("");
 
  useEffect(() => {
    fetch("/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ id: "xl-tshirt" }] }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, []);
 
  const appearance = {
    theme: 'stripe',
  };
  
  const options = {
    clientSecret,
    appearance,
  };
 
  return (
    <div className={s.what}>
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
}