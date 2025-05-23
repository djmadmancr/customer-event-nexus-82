
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
// Using a valid API key for development purposes
const firebaseConfig = {
  apiKey: "AIzaSyBYNNQUgTcPV-N9v-YzF_7FeLEu_M1dXyg",
  authDomain: "crm-system-c5976.firebaseapp.com",
  projectId: "crm-system-c5976",
  storageBucket: "crm-system-c5976.appspot.com",
  messagingSenderId: "546481998731",
  appId: "1:546481998731:web:24567b8b15c0cc1f3e3e45"
};

// Initialize Firebase - with singleton pattern to prevent duplicate initialization
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  // Catch the duplicate app initialization error
  const errorMessage = error.message;
  if (errorMessage.includes('Firebase App named "[DEFAULT]" already exists')) {
    app = initializeApp(undefined, "[DEFAULT]");
  } else {
    throw error;
  }
}

const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };
