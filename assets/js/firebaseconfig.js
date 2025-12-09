import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD0qGSOm6mIEeuoVOwK6UvIwvck-c6DHZ4",
    authDomain: "museo-895ed.firebaseapp.com",
    projectId: "museo-895ed",
    storageBucket: "museo-895ed.firebasestorage.app",
    messagingSenderId: "674482401758",
    appId: "1:674482401758:web:106738e05d4b10301ded4f",
    measurementId: "G-DR202C4TBB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);