import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/database";
import "firebase/auth";

!firebase.apps.length
  ? firebase.initializeApp({
    apiKey: "AIzaSyCgujPLet4ec-sY_hOS68fL4NH7KH3sPag",
    authDomain: "chat-app-dive-assignment.firebaseapp.com",
    projectId: "chat-app-dive-assignment",
    storageBucket: "chat-app-dive-assignment.appspot.com",
    messagingSenderId: "812747408263",
    appId: "1:812747408263:web:69368e4af48a4769c28922",
    databaseURL: "https://chat-app-dive-assignment-default-rtdb.firebaseio.com/"
  })
  : firebase.app();

const auth = firebase.auth();
const firestore = firebase.firestore();

export { firebase, auth, firestore };
