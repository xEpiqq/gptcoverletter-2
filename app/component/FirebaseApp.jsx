import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDdGzzgHKCMZl8NvIBq9LtfRT_kCFrB9eM",
  authDomain: "gptcoverletter.firebaseapp.com",
  projectId: "gptcoverletter",
  storageBucket: "gptcoverletter.appspot.com",
  messagingSenderId: "567270304575",
  appId: "1:567270304575:web:61c11cb0446367aec1418a",
  measurementId: "G-3RTKQQE02X"
};

const app = initializeApp(firebaseConfig);

export default app;