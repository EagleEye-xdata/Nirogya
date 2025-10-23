import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDAW8l1Qo7vWqjvk9lYZFSyxzEWPw1P1lQ",
  authDomain: "nirogya-4f652.firebaseapp.com",
  projectId: "nirogya-4f652",
  storageBucket: "nirogya-4f652.firebasestorage.app",
  messagingSenderId: "213284548295",
  appId: "1:213284548295:web:f157b4726853c98fa958e2",
  measurementId: "G-4Q6B1J34HY",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
