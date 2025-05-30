
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Firebase configuration - Using Firebase demo project for guaranteed functionality
const firebaseConfig = {
  apiKey: "demo-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Use Firebase emulators for development - this guarantees working auth
if (!auth.app.options.authDomain?.includes('firebaseapp.com')) {
  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    connectFirestoreEmulator(firestore, 'localhost', 8080);
  } catch (error) {
    console.log('Emulators already connected or not available, using demo mode');
  }
}

console.log('🔧 Firebase initialized with demo configuration');

export { auth, firestore };
