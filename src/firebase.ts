// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// Configurações do seu app Firebase (projeto churchgpt-e629d)
const firebaseConfig = {
  apiKey: "AIzaSyC06jYlz3XH6C6h51-qSt7LZm4ahb7AR04",
  authDomain: "churchgpt-e629d.firebaseapp.com",
  projectId: "churchgpt-e629d",
  storageBucket: "churchgpt-e629d.appspot.com",
  messagingSenderId: "697470128115",
  appId: "1:697470128115:web:f9f8bbf4b7d11d35450c86",
};

// Inicializa o Firebase App
const app = initializeApp(firebaseConfig);

// Inicializa os serviços com tipagem explícita
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);

// Exporta os serviços
export { db, auth };