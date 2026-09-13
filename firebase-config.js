import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
