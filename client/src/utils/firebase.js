
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-2e5c3.firebaseapp.com",
  projectId: "interviewiq-2e5c3",
  storageBucket: "interviewiq-2e5c3.firebasestorage.app",
  messagingSenderId: "469818483975",
  appId: "1:469818483975:web:66e9b4fd466ef7ac21d1a2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
export{auth,provider}