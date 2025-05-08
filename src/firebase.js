// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Importa o Firestore
import { getAuth } from "firebase/auth";       // Importa o Firebase Auth

// Configurações do seu app Firebase (projeto churchgpt-e629d)
const firebaseConfig = {
  apiKey: "AIzaSyC06jYlz3XH6C6h51-qSt7LZm4ahb7AR04",
  authDomain: "churchgpt-e629d.firebaseapp.com",
  projectId: "churchgpt-e629d",
  storageBucket: "churchgpt-e629d.firebasestorage.app", // Verifique se este é o storageBucket correto no console do seu projeto
  messagingSenderId: "697470128115",
  appId: "1:697470128115:web:f9f8bbf4b7d11d35450c86"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa os serviços do Firebase que você vai usar
const db = getFirestore(app);       // Inicializa o Firestore
const auth = getAuth(app);         // Inicializa o Firebase Authentication

// Exporta as instâncias para serem usadas em outros lugares do seu app
export { db, auth };
