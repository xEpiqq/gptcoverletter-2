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


const stripe_public_key = "pk_live_51Mn4sZHpzbXtemiLt1PgKGM0Eo9yKpKWABzs3WeLN24ayguAeJPJ6CGKaIcSOSNjtkzFvfDJzhPRSyRcchX1QQ3r007EVzNPJZ";
const stripePromise = loadStripe(stripe_public_key);

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

    const response = await axios.post("/api/stripe", {
      email: user.email,
      name: user.displayName,
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
      <div className={s.paget}>
        <div class={s.ldsring}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <h1 className={s.loading_text}>Loading Form</h1>
      </div>
    );
  }

  if (clientSecret) {
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
