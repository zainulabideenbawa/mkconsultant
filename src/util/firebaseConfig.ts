// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyC4v9DBCSbHCwO3KZFhLEdIVNkk0PmpyG4",
    authDomain: "mkconsultant-eee22.firebaseapp.com",
    projectId: "mkconsultant-eee22",
    storageBucket: "mkconsultant-eee22.appspot.com",
    messagingSenderId: "87461473142",
    appId: "1:87461473142:web:a8fcaf55b676962f5de857",
    measurementId: "G-QXRY7TD3V9"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
