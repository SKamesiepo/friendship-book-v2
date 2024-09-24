// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration (use the one you provided)
const firebaseConfig = {
  apiKey: "AIzaSyB4_v4fyS2mU7wQQj3i18dvdJXB3WDzn1M",
  authDomain: "friendshipbook-d828b.firebaseapp.com",
  projectId: "friendshipbook-d828b",
  storageBucket: "friendshipbook-d828b.appspot.com",
  messagingSenderId: "685218233726",
  appId: "1:685218233726:web:ea52a3d4231c9d27e5c72f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
