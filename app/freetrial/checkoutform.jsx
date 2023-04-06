import React, { useEffect, useState } from "react";
import {PaymentElement, useStripe, useElements} from "@stripe/react-stripe-js";
import s from "./freetrial.module.scss";

 
function CheckoutForm(props) {
 const stripe = useStripe();
 const elements = useElements();
 const [message, setMessage] = useState(null);
 const [isLoading, setIsLoading] = useState(false);
 
 useEffect(() => {
   if (!stripe) {
     return;
   }
   const clientSecret = props.client_secret;
   if (!clientSecret) {
     return;
   }
 
   stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
     switch (paymentIntent.status) {
       case "succeeded":
         setMessage("Payment succeeded!");
         break;
       case "processing":
         setMessage("Your payment is processing.");
         break;
       case "requires_payment_method":
         setMessage("Your payment was not successful, please try again.");
         break;
       default:
         setMessage("Something went wrong.");
         break;
     }
   });
 }, [stripe]);
 
 const handleSubmit = async (e) => {
   e.preventDefault();
   if (!stripe || !elements) {
     return;
   }
   setIsLoading(true);
 
   const { error } = await stripe.confirmPayment({
     elements,
     confirmParams: {
       return_url: "http://localhost:3000",
     },
   });
   if (error.type === "card_error" || error.type === "validation_error") {
     setMessage(error.message);
   } else {
     setMessage("An unexpected error occured.");
   }
   setIsLoading(false);
 };
 
 return (

  <div className={s.paget}>
    <div className={s.pleft}>
      <div className={s.leftbox}>
        <h1 className={s.bigtext}>Start Free 14-Day Trial</h1>
        <div className={s.bar}>
          <div className={s.cbartwo}/>
        </div>
        <div className={s.onetwo}>
          <h2 className={s.box_st}>Last step</h2>
          <h2 className={s.box_st}>2 / 2</h2>
        </div>

        <div className={s.stripe} >
            <form onSubmit={handleSubmit}>
              <PaymentElement />
              <button disabled={isLoading || !stripe || !elements} id="submit" className={s.stripe_button} >Start My Free Trial</button>
              {/* {message && <div className={s.errormessage}>{message}</div>} */}
            </form>
        </div>

      </div>

    </div>
    <div className={s.pright}></div>
  </div>

 );
}

export default CheckoutForm