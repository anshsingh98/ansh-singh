// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD84ddin73vdijIKnztZkAyi0H5zwsuJEs",
  authDomain: "react-e3182.firebaseapp.com",
  databaseURL: "https://react-e3182-default-rtdb.firebaseio.com",
  projectId: "react-e3182",
  storageBucket: "react-e3182.firebasestorage.app",
  messagingSenderId: "663547048507",
  appId: "1:663547048507:web:776e13710fbcdd3d7be21e",
  measurementId: "G-1ZJBX63Y7F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
