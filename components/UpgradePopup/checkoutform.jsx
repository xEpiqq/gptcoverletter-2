import React, { useEffect, useState } from "react";
import { PaymentElement, useStripe, useElements, createPaymentMethod, confirmCardPayment } from "@stripe/react-stripe-js";
import {CardElement, CardCvcElement, CardNumberElement, CardExpiryElement, getElement} from '@stripe/react-stripe-js';
import '../../styles/index.css'
import Image from 'next/image';
import { useRouter } from 'next/navigation';


function CheckoutForm(props) {

  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
      label: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000',
        textTransform: 'uppercase',
      },
    hidePostalCode: true,
    },
  };


  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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


  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setIsLoading(true);

    try {
        const result = await stripe.confirmCardPayment( props.client_secret, {
        payment_method: { card: elements.getElement(CardNumberElement), }, 
      }) 
      router.refresh();
      if (result.error) {
        setMessage(result.error.message);
      }
      else {
        setMessage("Payment succeeded!");
      }
      props.closePopup();
    } catch (error) {
        setMessage(error.message);
      }

      setIsLoading(false);    
  }

    



  return (
    <>
    <div className="w-full h-full absolute z-10 bg-blackblack opacity-20"/>
    <div className="flex bg-white w-full max-w-120 h-auto fixed z-10 flex-col text-white rounded-md">
    <form onSubmit={handleSubmit}>

      <div className="w-full h-32 bg-white rounded-tl-md rounded-tr-md border-b-2 border-b-paymentborder p-8"><h1 className="font-bold text-3xl">Purchase Pro</h1></div>
        <div className="bg-paymentmid w-full h-80 flex flex-col p-8 border-b-paymentborder border-b-2">
          <h2>Add a payment method to start the Pro plan and create your first cover letter, unlock for $10 a month.</h2>
          <h3 className="text-paymenttext font-medium text-sm opacity-50 mt-5">Card Number</h3>
          <div className="bg-white text-paymenttext border-paymentboxborder border rounded-md flex flex-row mt-2 p-3 w-full">
          <Image src='/cardicon.png' alt="Image of credit card" width={20} height={15} draggable={false} className="w-8 opacity-70 pointer-events-none"/>
          <CardNumberElement options={CARD_ELEMENT_OPTIONS} className='ml-4 w-full' />
          </div>

          <div className="flex flex-row gap-4">
              <div className="w-full">
              <h3 className="text-paymenttext font-medium text-sm opacity-50 mt-5">Expires</h3>
              <div className="bg-white text-paymenttext border-paymentboxborder border rounded-md flex flex-row mt-2 p-3 w-50">
              <CardExpiryElement options={CARD_ELEMENT_OPTIONS} className='ml-4 w-full' />
              </div>
              </div>
              <div className="w-full">
              <h3 className="text-paymenttext font-medium text-sm opacity-50 mt-5">CVC</h3>
              <div className="bg-white text-paymenttext border-paymentboxborder border rounded-md flex flex-row mt-2 p-3 w-full">
              <CardCvcElement options={CARD_ELEMENT_OPTIONS} className='ml-4 w-full'/>
              </div>
              </div>
          </div>
          {/* {message && <div className="">{message}</div>} */}
        </div>


        <div className="bg-transparent w-full h-22 flex flex-row items-center p-4 justify-between">
        <button onClick={props.closePopup} className="border-paymentboxborder border rounded-md w-30 px-4 h-11 text-paymenttext font-semibold text-sm" >Cancel</button>
        <button disabled={isLoading || !stripe || !elements} id="submit" className="bg-blackblack rounded-md w-30 px-4 h-11 font-semibold text-sm text-white dark:text-white" style={{color: "white"}} > Subscribe </button>
        </div>
        </form>

    </div>
    </>
  );
  }

export default CheckoutForm;