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
import Image from "next/image";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'


const stripe_public_key =
  "pk_live_51Mn4sZHpzbXtemiLt1PgKGM0Eo9yKpKWABzs3WeLN24ayguAeJPJ6CGKaIcSOSNjtkzFvfDJzhPRSyRcchX1QQ3r007EVzNPJZ";
const stripePromise = loadStripe(stripe_public_key);

// ///////////////////////////STRIPE TEST MODE/////////////////////////////
// const stripe_public_key = "pk_test_51Mn4sZHpzbXtemiL0XN5qLTlaBxkoriYCe4gwg8Vq7TQxYs2CLpIC5HZahV7Xyf0EfKlq7JhzcG6GP2TTwjbsi8t00nALOso66" // test mode
// const stripePromise = loadStripe(stripe_public_key) // test mode
// ////////////////////////////////////////////////////////////////////////

const UpgradePopup = ({ closePopup }) => {
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
      });

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
        <div className="absolute z-10 h-full w-full bg-blackblack opacity-20" />
        <div className="fixed z-10 flex h-auto w-full max-w-120 flex-col rounded-md bg-white text-white">
          <div className="h-32 w-full rounded-tl-md rounded-tr-md border-b-2 border-b-paymentborder bg-white p-8">
            <h1 className="text-3xl font-bold">Purchase Pro</h1>
          </div>
          <div className="flex h-80 w-full flex-col border-b-2 border-b-paymentborder bg-paymentmid p-8">
            <h2>
              Add a payment method to start the Pro plan and create your first
              cover letter, unlock for $10 a month.
            </h2>

            <h3 className="mt-5 text-sm font-medium text-paymenttext opacity-50">
              Card Number
            </h3>
            <Skeleton className="mt-2 flex w-full flex-row rounded-md border border-paymentboxborder bg-white p-3 text-paymenttext" />
              {/* <Image
                src="/cardicon.png"
                alt="Image of credit card"
                width={20}
                height={15}
                draggable={false}
                className="pointer-events-none w-8 opacity-70"
              />
              <Skeleton className="w-full" /> */}
            {/* </div> */}

            <div className="flex flex-row gap-4">
              <div className="w-full">
                <h3 className="mt-5 text-sm font-medium text-paymenttext opacity-50">
                  Expires
                </h3>
                <Skeleton className="w-50 mt-2 flex flex-row rounded-md border border-paymentboxborder bg-white p-3 text-paymenttext" />
              </div>
              <div className="w-full">
                <h3 className="mt-5 text-sm font-medium text-paymenttext opacity-50">
                  CVC
                </h3>
                <Skeleton className="mt-2 flex w-full flex-row rounded-md border border-paymentboxborder bg-white p-3 text-paymenttext" />
              </div>
            </div>
            {/* {message && <div className="">{message}</div>} */}
          </div>

          <div className="h-22 flex w-full flex-row items-center justify-between bg-transparent p-4">
            <button className="w-30 h-11 rounded-md border border-paymentboxborder px-4 text-sm font-semibold text-paymenttext">
              Cancel
            </button>
            <button className="w-30 h-11 rounded-md bg-blackblack px-4 text-sm font-semibold dark:text-white text-white" style={{color:"white"}}>
              {" "}
              Subscribe{" "}
            </button>
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
        <CheckoutForm client_secret={clientSecret} closePopup={closePopup} />
      </Elements>
    );
  }
};

export default UpgradePopup;
