// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';


// firebase of client new project check now
const firebaseConfig = {
    apiKey: "AIzaSyC8x_AvaE_ed6a69V9Ap4OWB4Cr6KzRHkg",
    authDomain: "mkcontracts-portal.firebaseapp.com",
    projectId: "mkcontracts-portal",
    storageBucket: "mkcontracts-portal.firebasestorage.app",
    messagingSenderId: "810403067933",
    appId: "1:810403067933:web:3b77fc9fe83e83da29eef4",
    measurementId: "G-X6MGNHQC96"
};



const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
