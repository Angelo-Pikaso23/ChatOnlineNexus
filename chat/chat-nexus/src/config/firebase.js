import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCCK0YrFd9Jolmqn4WOjNH6fONl4pVbQSQ",
  authDomain: "nexus-porfolio.firebaseapp.com",
  projectId: "nexus-porfolio",
  storageBucket: "nexus-porfolio.firebasestorage.com",
  messagingSenderId: "133196318050",
  appId: "1:133196318050:web:a35088680edc062d16583b",
  measurementId: "G-2CHJ7SX7RB"
};


const app = initializeApp(firebaseConfig);

// 👇 EXPORTACIONES CORRECTAS
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);