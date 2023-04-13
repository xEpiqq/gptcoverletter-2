"use client";
import React from "react";
import s from "./upgrade_popup.module.scss";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./checkoutform";
import useSWR from "swr";
import axios from "axios";
import Image from 'next/image';



const stripe_public_key = "pk_live_51Mn4sZHpzbXtemiLt1PgKGM0Eo9yKpKWABzs3WeLN24ayguAeJPJ6CGKaIcSOSNjtkzFvfDJzhPRSyRcchX1QQ3r007EVzNPJZ";
const stripePromise = loadStripe(stripe_public_key);

// ///////////////////////////STRIPE TEST MODE/////////////////////////////
// const stripe_public_key = "pk_test_51Mn4sZHpzbXtemiL0XN5qLTlaBxkoriYCe4gwg8Vq7TQxYs2CLpIC5HZahV7Xyf0EfKlq7JhzcG6GP2TTwjbsi8t00nALOso66" // test mode
// const stripePromise = loadStripe(stripe_public_key) // test mode
// ////////////////////////////////////////////////////////////////////////


const UpgradePopup = () => {

  const auth = getAuth();
  const [clientSecret, setClientSecret] = useState(undefined);
  const [user, loading] = useAuthState(auth);
  const [paymentLoading, setPaymentLoading] = useState(false);


  useEffect(() => {
  async function setupPayment() {
    setPaymentLoading(true);

    if (!user) {
        return;
    }

    const response = await axios.post("/api/stripecreatesub", {
      user_id: user.uid,
    })

    // get the client secret from the response is json?
    const client_secret = response.data.clientSecret;

    setClientSecret(client_secret);
    console.log("client secret: " + client_secret);
    setPaymentLoading(false);
  }
    setupPayment();
    }, [user]);

  if (paymentLoading) {
    return (
      <>
      <div className="w-full h-full absolute z-10 bg-blackblack opacity-20"/>
      <div className="flex bg-white w-full max-w-120 h-auto fixed z-10 flex-col text-white rounded-md">
        <div className="w-full h-32 bg-white rounded-tl-md rounded-tr-md border-b-2 border-b-paymentborder p-8"><h1 className="font-bold text-3xl">Purchase Pro</h1></div>
          <div className="bg-paymentmid w-full h-80 flex flex-col p-8 border-b-paymentborder border-b-2">
            <h2>Add a payment method to start the Pro plan and create your first cover letter, unlock for $10 a month.</h2>
  
            <h3 className="text-paymenttext font-medium text-sm opacity-50 mt-5">Card Number</h3>
            <div className="bg-white text-paymenttext border-paymentboxborder border rounded-md flex flex-row mt-2 p-3 w-full">
            <Image src='/cardicon.png' alt="Image of credit card" width={20} height={15} draggable={false} className="w-8 opacity-70 pointer-events-none"/>
            <div className='ml-4 w-full'/>
            </div>
  
            <div className="flex flex-row gap-4">
                <div className="w-full">
                <h3 className="text-paymenttext font-medium text-sm opacity-50 mt-5">Expires</h3>
                <div className="bg-white text-paymenttext border-paymentboxborder border rounded-md flex flex-row mt-2 p-3 w-50">
                <div className='ml-4 w-full'/>
                </div>
                </div>
                <div className="w-full">
                <h3 className="text-paymenttext font-medium text-sm opacity-50 mt-5">CVC</h3>
                <div className="bg-white text-paymenttext border-paymentboxborder border rounded-md flex flex-row mt-2 p-3 w-full">
                <div className='ml-4 w-full'/>
                </div>
                </div>
            </div>
            {/* {message && <div className="">{message}</div>} */}
          </div>
  
  
          <div className="bg-transparent w-full h-22 flex flex-row items-center p-4 justify-between">
          <button className="border-paymentboxborder border rounded-md w-30 px-4 h-11 text-paymenttext font-semibold text-sm" >Cancel</button>
          <button className="bg-blackblack text-white rounded-md w-30 px-4 h-11 font-semibold text-sm" > Subscribe </button>
          </div>
  
      </div>
      </>
    );
  }

  if (true) {
    const options = {
      clientSecret: clientSecret,
      appearance: { theme: "stripe" },
    };
    return (
      <Elements options={options} stripe={stripePromise}>
        <CheckoutForm client_secret={clientSecret} />
      </Elements>
    );
  }
};

export default UpgradePopup;
