import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// IMPORTANT : REMPLACEZ LES VALEURS CI-DESSOUS PAR CELLES DE VOTRE PROJET FIREBASE
// Allez sur https://console.firebase.google.com/
// Créez un projet -> Ajoutez une app Web -> Copiez la config
// ------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyCnPr12HUcbqELfzcQis5gAEsSW1OsTwsk",
  authDomain: "oris-formation-gestion.firebaseapp.com",
  projectId: "oris-formation-gestion",
  storageBucket: "oris-formation-gestion.firebasestorage.app",
  messagingSenderId: "295133601563",
  appId: "1:295133601563:web:067511f7e31cf47c62fdbe"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Initialisation de Firestore (Base de données)
export const db = getFirestore(app);
