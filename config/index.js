import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  browserSessionPersistence,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";

let testConfig = {
  apiKey: "AIzaSyCvv4YF7T81111111111-1111111111111",
  authDomain: "rgonline-11111.firebaseapp.com", // "app.bloss.am",
  databaseURL:
    "https://rgonline-11111-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rgonline-11111",
  storageBucket: "rgonline-11111.appspot.com",
  messagingSenderId: "111111116104",
  appId: "1:111111116104:web:5b7318cd1b9e1111111111",
  measurementId: "G-XDN62S8NVN",
};

// Initialize Firebase
let app = initializeApp(testConfig);
export default app;
export let auth = getAuth(app);
// setPersistence(auth, browserSessionPersistence);
