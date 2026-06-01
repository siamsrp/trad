import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBZ-6hrM12YyjeMLBpJLqY4sPz9vshTmaQ",
  authDomain: "rubicon-liberty.firebaseapp.com",
  projectId: "rubicon-liberty",
  storageBucket: "rubicon-liberty.firebasestorage.app",
  messagingSenderId: "48381695882",
  appId: "1:48381695882:web:71cb66b8db2c2374fada73",
  measurementId: "G-VS5S17N4T6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile
};
export type { User };
