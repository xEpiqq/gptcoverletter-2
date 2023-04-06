"use client";

import react from "react";
import s from "./settings.module.scss";
import { useAuthState } from "react-firebase-hooks/auth";
import app from "../component/FirebaseApp";
import { getAuth } from "firebase/auth";
// swr
import useSWR from "swr";

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

  if (!data) {
    return <div>Not logged in</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={s.page}>
      <div className={s.gradient_background}></div>
      <h1>Account Settings</h1>
      <div className={s.content}>
        <div className={s.content_left}>
          <div className={s.info_container}>
            <div className={s.user_info}>
              <img alt="user" src={user.photoURL} />
              <h3>{data.name}</h3>
            </div>
          </div>
          <div className={s.info_container}>
            <h3>Account Details</h3>
            <p>Email: {data.email}</p>
            <button>Delete Account</button>
          </div>
          <div className={s.info_container}>
            <h3>{data.subscriptionstatus}</h3>
            <p>Ends in 3 days</p>
            <p>Full access to gptcoverletter.com</p>
            <button>Cancel Subscription</button>
          </div>
        </div>
        <div className={s.content_right}></div>
      </div>
    </div>
  );
}
