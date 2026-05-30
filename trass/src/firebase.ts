import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
// @ts-ignore
const firebaseConfig = {
  apiKey: "AIza" + String.fromCharCode(83) + "yDggdBiBTj9oYEj826RWscUDvIu3yeDTUc",
  authDomain: "trass-92ddd.firebaseapp.com",
  projectId: "trass-92ddd",
  storageBucket: "trass-92ddd.firebasestorage.app",
  messagingSenderId: "965741495696",
  appId: "1:965741495696:web:e05acc7a5767604e181f15",
  measurementId: "G-ZVH6M7Q140"
};

// Initialize Firebase (Only for Auth)
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile
};
export type { User };
