"use client";

import react from "react";
import s from "./settings.module.scss";
import { useAuthState } from "react-firebase-hooks/auth";
import app from "../../../components/FirebaseApp";
import { getAuth } from "firebase/auth";
// swr
import useSWR from "swr";
import Breadcrumb from "@/components/Common/Breadcrumb";

export default function Settings() {
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
                Full subscription. you have full, unlimited access to all features!
              </h3>
              <h3>$9.99/Month</h3>
              <button onClick={() => {}}>Cancel Subscription</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
