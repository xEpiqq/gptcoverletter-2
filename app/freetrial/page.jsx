"use client";
import React from "react";
import s from "./freetrial.module.scss";
import { useState, useEffect } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, } from "firebase/auth";
import { getFirestore, collection, addDoc, setDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
// import app from '../component/FirebaseApp'
// import app from "../../components/FirebaseApp";
import app from "../../components/FirebaseApp"
import { useRouter } from "next/navigation";
import {Elements, PaymentElement, useElements, useStripe} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import CheckoutForm from './checkoutform'
import useSWR from 'swr'
import { useDocument } from 'react-firebase-hooks/firestore';

///////////////////////////////////////////////////////////////
//CONSIDER USING FIREBASE REDIRECT ON MOBILE INSTEAD OF POPUP//
///////////////////////////////////////////////////////////////

const stripePromise = loadStripe('pk_test_51Mn4sZHpzbXtemiL0XN5qLTlaBxkoriYCe4gwg8Vq7TQxYs2CLpIC5HZahV7Xyf0EfKlq7JhzcG6GP2TTwjbsi8t00nALOso66');

function Freetrial() {
  ////firebase - firestore////
  const db = getFirestore(app);
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // fetch user data from firestore

  const { data, error, isLoading } = useSWR('/api/firestoreUserData', (url) => {
    return fetch(url, { method: 'POST', headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify({ uid: user.uid })}).then((res) => res.json())
  })

  if (user && data) {
    if (data.subscriptionstatus == "active") {
      router.push('/dashboard')
    } else {
      console.log("user is not logged in / subscribed")
    }
  }

  ///////////stripe///////////
  const basic_price_id = "price_1MpKHWHpzbXtemiLvV57mUHU"
  const [clientSecret, setClientSecret] = useState('');

  const options = {
    clientSecret: clientSecret,
    appearance: { theme: 'stripe' }
  };

  async function createCustomer(username, emailaddress, userid) {
    const response = await fetch('/api/createstripecustomer', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ email: emailaddress, name: username, user_id: userid })});
    const customer_object = await response.json();
    return customer_object.id
  }

  async function subscribeBasic(customer_id) {
    const response = await fetch('/api/createstripesub', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ priceId: basic_price_id, customerId: customer_id })});
    const responseData = await response.json();
    setClientSecret(responseData.clientSecret)

  }

  ////////////////////////////

  async function createFirestoreUser(user_id, displayname, email) {
    const userRef = doc(db, "users", user_id);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      console.log("User document already exists");
      return;
    } else {
      await setDoc(userRef, {
        name: displayname,
        email: email,
        stripe_customer_id: "null"
      });
      console.log("User document created");
    }
  }

  async function googleLogin() {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    createFirestoreUser(user.uid, user.displayName, user.email);
    setPaymentLoading(true);
    const customer_id = await createCustomer(user.displayName, user.email, user.uid);
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      stripe_customer_id: customer_id
    });
    await subscribeBasic(customer_id);
    setPaymentLoading(false);
    } catch (error) {
    console.log("error signing in");
    }
  }

  if (paymentLoading) {
    return (
      <div className={s.rollerpage}>
        <div class={s.ldsring}><div></div><div></div><div></div><div></div></div>
        <h1>Loading trial form.</h1>
      </div>
    )
  }

  if (clientSecret) {
    return (
      <Elements options={options} stripe={stripePromise}>
        <CheckoutForm client_secret={clientSecret}/>
      </Elements>
    )
  }

  if (user) { 
  return (
    <div className={s.page}>
        <img src="/freetrial_logo.png" className={s.logo} draggable={false} onClick={() => router.push('/')}/>
        <div className={s.box}>
          <h1 className={s.box_lt}>Start Your 14-Day</h1>
          <h1 className={s.box_lt}>Free Trial Now!</h1>
          <h2 className={s.box_st}>No risk, no contracts, and no long-term commitment. Cancel anytime, hassle-free.</h2>

          <div className={s.bar}>
            <div className={s.cbar}/>
          </div>
        <div className={s.onetwo}>
          <h2 className={s.box_st}>Create account with</h2>
          <h2 className={s.box_st}>1 / 2</h2>
        </div>


        <div className={s.btns}>
          <button className={s.authbtn} onClick={googleLogin}> 
          <img src="/google.png" className={s.googleimg}/> Sign up with Google
          </button>

          <button className={`${s.authbtn} ${s.fb}`} onClick={googleLogin}> 
          <img src="/facebook.png" className={s.googleimg}/> Sign up with Facebook
          </button>
        </div>


        </div>
    </div>
  );
  }
}

export default Freetrial;
