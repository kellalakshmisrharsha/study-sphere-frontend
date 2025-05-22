// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDqRSpMQjBpD0eMHJEIuJBwPwd1mltktaE",
  authDomain: "study-sphere-3739b.firebaseapp.com",
  projectId: "study-sphere-3739b",
  storageBucket: "study-sphere-3739b.appspot.app",
  messagingSenderId: "441672302392",
  appId: "1:441672302392:web:d09325d6ba7afc8bb64bcd",
  measurementId: "G-1CL78HDGM8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();


export default app;