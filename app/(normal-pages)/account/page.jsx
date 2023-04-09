"use client";
import react from "react";
import s from "./settings.module.scss";
import { useAuthState } from "react-firebase-hooks/auth";
import app from "../../../components/FirebaseApp"
import { getAuth } from "firebase/auth";
// swr
import useSWR from "swr";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { useState, useEffect } from "react";



export default function Settings() {

  const [cancellationError, setCancellationError] = useState("");
  const [modal, setModal] = useState(false);
  const auth = getAuth();
  const [user, loading, error] = useAuthState(auth);

  const { data, swrerror, swrisLoading } = useSWR(
    "/api/firestoreUserData",
    (url) => {
      return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid }),
      }).then((res) => res.json());
    }
  );

  const subscriptionid = data?.subscriptionid
  console.log(data);

  if (swrisLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Not logged in</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  async function cancelStripeSubscription() {

    console.log(`subscription id: ${subscriptionid}`)
    
    try {
        const response = await fetch('/api/cancelsubscription', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscriptionid: subscriptionid,
          }),
        });
        const cancelSubscriptionResponse = await response.json();
        console.log(cancelSubscriptionResponse)
        console.log("subscription cancelled")
        // Display to the user that the subscription has been canceled.
      } catch (error) {
        console.log("subscription not cancelled")
        setCancellationError("Something went wrong. Try again or contact support.")
        // Handle errors here
      }
      setModal(false)
  }
   

  return (
    <>
      <Breadcrumb
        pageName="Your Account"
        description="Manage your account settings and set your preferences"
      />
      {/* margin on the bottom */}
      <div class='flex items-center justify-center flex-col gap-4 mb-10'>
        <div className={s.container} style={{flexDirection: 'row', gap: '2rem', justifyContent: 'flex-start', alignItems:'center'}}>
          <img
            src={user.photoURL}
            alt="profile picture"
            className="rounded-full"
          />
          <h2 className="text-2xl font-bold">{user.displayName}</h2>
        </div>
        <div className={s.container}>
          <h1>Your Info</h1>
          <h3>{user.displayName}</h3>
          <h3>{user.email}</h3>
          <h3>{user.phoneNumber}</h3>
        </div>
        <div className={s.container}>
          <h1>Your Subscriptions</h1>
          {data?.subscriptionstatus == "none" ? (
            <>
              <h3>You are not subscribed to any plans</h3>
              <Link href="/pricing">Subscribe now</Link>
            </>
          ) : (
            <>
              <h3>
                Subscription status: {data?.subscription_status}
              </h3>
              <h3></h3>
              <button onClick={() => {setModal(true)}}>Cancel Subscription</button>
              {cancellationError && ( <div>{cancellationError}</div> )}
            </>
          )}

{modal && (
            <>
              <div class="fixed inset-0 z-9 bg-black bg-opacity-50"></div>
                <div className="fixed z-10 inset-0 overflow-y-auto">
                  <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div
                      className="fixed inset-0 transition-opacity"
                      aria-hidden="true"
                    >
                      <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>
                    <span

                      className="hidden sm:inline-block sm:align-middle sm:h-screen"
                      aria-hidden="true"
                    >
                      &#8203;
                    </span>
                    <div
                      className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="modal-headline"
                    >
                      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3

                              className="text-lg leading-6 font-medium text-gray-900"
                              id="modal-headline"
                            >
                              Cancel Subscription
                            </h3>
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">
                                Are you sure you want to cancel your subscription?
                                You will lose access to all premium features.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                          onClick={cancelStripeSubscription}
                          type="button"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Cancel Subscription
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                </>
              )}

        </div>
      </div>
    </>
  );
}
