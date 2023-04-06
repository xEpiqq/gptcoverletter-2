import react from "react";
import { useState, useEffect } from "react";

import { useAuthState } from "react-firebase-hooks/auth";

import s from "./UserDropdown.module.scss";
//router from next/navigation
import { useRouter } from "next/navigation";

import { signOut, getAuth } from "firebase/auth";

export default function UserDropdown() {
  const router = useRouter();
  const auth = getAuth();
  const [user, loadingUser, error] = useAuthState(auth);

  return (
    <div className={s.dropdown}>
      {user && (
        <img className={s.dropdown} alt="user profile" src={user.photoURL} />
      )}
      <ul className={s.dropdown_menu}>
        <li
          className={s.dropdown_item}
          onClick={() => router.push("/dashboard")}
        >
          Dashboard
        </li>
        <li
          className={s.dropdown_item}
          onClick={() => router.push("/account")}
        >
          Account
        </li>
        <li className={s.dropdown_item} onClick={() => signOut(auth)}>
          Logout
        </li>
      </ul>
    </div>
  );
}
