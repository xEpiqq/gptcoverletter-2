"use client";
import React from "react";
import s from "./freetrial.module.scss";
import { useState, useEffect } from "react";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import app from "../../components/FirebaseApp";
import { useRouter } from "next/navigation";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./checkoutform";
import useSWR from "swr";
import { useDocument } from "react-firebase-hooks/firestore";
import Breadcrumb from "@/components/Common/Breadcrumb";
import axios from "axios";

///////////////////////////////////////////////////////////////
//CONSIDER USING FIREBASE REDIRECT ON MOBILE INSTEAD OF POPUP//
///////////////////////////////////////////////////////////////
const stripe_public_key = "pk_live_51Mn4sZHpzbXtemiLt1PgKGM0Eo9yKpKWABzs3WeLN24ayguAeJPJ6CGKaIcSOSNjtkzFvfDJzhPRSyRcchX1QQ3r007EVzNPJZ";
const stripePromise = loadStripe(stripe_public_key);

function Freetrial() {
  ////firebase - firestore////
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // fetch user data from firestore

  const { data, error, isLoading } = useSWR("/api/firestoreUserData", (url) => {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: user.uid }),
    }).then((res) => res.json());
  });

  if (user && data) {
    if (data.subscriptionstatus == "active") {
      router.push("/dashboard");
    } else {
      console.log("user is not logged in / subscribed");
    }
  }

  ///////////stripe///////////
  const basic_price_id = process.env.BASIC_PRICE_ID;
  const [clientSecret, setClientSecret] = useState(undefined);

  async function setupPayment() {
    setPaymentLoading(true);
    const response = await axios.post("/api/stripe", {
      email: user.email,
      name: user.displayName,
      user_id: user.uid,
    });
    
    // get the client secret from the response is json?
    const client_secret = response.data.clientSecret;

    setClientSecret(client_secret);
    console.log("client secret: " + client_secret)
    setPaymentLoading(false);
  }

  async function googleLogin() {
    try {
      setupPayment();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // we need to call the userLogin api
      await axios.post("/api/userLogin", {
        user_id: user.uid,
        email: user.email,
        displayname: user.displayName,
      });
    } catch (error) {
      console.log("error signing in");
    }
  }

  if (paymentLoading) {
    return (
      <div className={s.rollerpage}>
        <div class={s.ldsring}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <h1>Loading trial form.</h1>
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

  if (user) {
    return (
      <>
        <div className={s.page}>
          <img
            src="/logo.png"
            className={s.logo}
            draggable={false}
            onClick={() => router.push("/")}
          />
          <div className={s.box}>
            <h1 className={s.box_lt}>Sign up now!</h1>
            <h2 className={s.box_st}>
              No risk, no contracts, and no long-term commitment. Cancel
              anytime, hassle-free.
            </h2>

            <div className={s.bar}>
              <div className={s.cbar} />
            </div>
            <div className={s.onetwo}>
              <h2 className={s.box_st}>Create account with</h2>
              <h2 className={s.box_st}>1 / 2</h2>
            </div>
            {!user ? (
              <div className={s.btns}>
                <button onClick={googleLogin} className={s.authbtn}>
                  <img src="/google.png" className={s.googleimg} /> Sign up with
                  Google
                </button>

                <button
                  className={`${s.authbtn} ${s.fb}`}
                  onClick={googleLogin}
                >
                  <img src="/facebook.png" className={s.googleimg} /> Sign up
                  with Facebook
                </button>
              </div>
            ) : (
              <div className={s.btns}>
                <button className={s.authbtn} onClick={() => setupPayment()}>
                  Proceed to checkout
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
}

export default Freetrial;
