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
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
// import app from '../component/FirebaseApp'
// import app from "../../components/FirebaseApp";
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

///////////////////////////////////////////////////////////////
//CONSIDER USING FIREBASE REDIRECT ON MOBILE INSTEAD OF POPUP//
///////////////////////////////////////////////////////////////
const stripe_public_key = process.env.STRIPE_REAL_PUBLISHABLE_KEY;
const stripePromise = loadStripe(stripe_public_key);

function Freetrial() {
  ////firebase - firestore////
  const db = getFirestore(app);
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
  const basic_price_id = process.env.BASIC_PRICE_ID
  const [clientSecret, setClientSecret] = useState('');

  const options = {
    clientSecret: clientSecret,
    appearance: { theme: "stripe" },
  };

  async function createCustomer(username, emailaddress, userid) {
    const response = await fetch("/api/createstripecustomer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailaddress,
        name: username,
        user_id: userid,
      }),
    });
    const customer_object = await response.json();
    return customer_object.id;
  }

  async function subscribeBasic(customer_id) {
    const response = await fetch("/api/createstripesub", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId: basic_price_id,
        customerId: customer_id,
      }),
    });
    const responseData = await response.json();
    setClientSecret(responseData.clientSecret);
  }

  async function setupPayment() {
    setPaymentLoading(true);
    const customer_id = await createCustomer(
      user.displayName,
      user.email,
      user.uid
    );
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      stripe_customer_id: customer_id,
    });
    await subscribeBasic(customer_id);
    setPaymentLoading(false);
  }

  async function googleLogin() {
    try {
      setupPayment();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // we need to call the userLogin api
      const res = await axios.post("/api/userLogin", {
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
            {user ? (
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
