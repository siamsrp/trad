import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateEmail,
  updatePassword
} from 'firebase/auth';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const firebaseConfig = {
  apiKey: "AIzaSyDggdBiBTj9oYEj826RWscUDvIu3yeDTUc",
  authDomain: "trass-92ddd.firebaseapp.com",
  projectId: "trass-92ddd",
  storageBucket: "trass-92ddd.firebasestorage.app",
  messagingSenderId: "965741495696",
  appId: "1:965741495696:web:e05acc7a5767604e181f15"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

async function main() {
  console.log("=== Rubicon Liberty - Admin Credentials Manager ===");

  // Read current configuration
  const appTsxPath = path.resolve('src/App.tsx');
  const adminPanelPath = path.resolve('src/components/AdminPanel.tsx');

  if (!fs.existsSync(appTsxPath) || !fs.existsSync(adminPanelPath)) {
    console.error("Error: Please run this script from the 'trass' directory.");
    process.exit(1);
  }

  let appTsxContent = fs.readFileSync(appTsxPath, 'utf8');
  let adminPanelContent = fs.readFileSync(adminPanelPath, 'utf8');

  const emailMatch = appTsxContent.match(/const ADMIN_EMAIL = '([^']+)';/);
  const currentEmail = emailMatch ? emailMatch[1] : 'siam579214@gmail.com';

  console.log(`Current Admin Email in code: ${currentEmail}\n`);

  const newEmail = (await askQuestion("Enter NEW Admin Email: ")).trim();
  const newPassword = (await askQuestion("Enter NEW Admin Password: ")).trim();

  if (!newEmail || !newPassword) {
    console.error("Error: New email and password cannot be empty.");
    rl.close();
    return;
  }

  const mode = await askQuestion("\nDo you want to:\n1. Create a NEW admin user in Firebase\n2. Update the EXISTING admin user (requires old password)\nSelect [1/2]: ");

  if (mode === '1') {
    try {
      console.log("\nAttempting to register new admin user in Firebase...");
      const credential = await createUserWithEmailAndPassword(auth, newEmail, newPassword);
      console.log(`Successfully registered new Admin user in Firebase: ${credential.user.email}`);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        console.log("User already exists in Firebase Auth. Attempting to log in to verify access...");
        try {
          await signInWithEmailAndPassword(auth, newEmail, newPassword);
          console.log("Logged in successfully. Credentials match and user is ready.");
        } catch (loginErr: any) {
          console.error("User exists but could not log in with that password. If you want to reset/change the password, please choose option 2.");
          rl.close();
          return;
        }
      } else {
        console.error("Error registering user in Firebase:", err.message);
        rl.close();
        return;
      }
    }
  } else if (mode === '2') {
    const oldPassword = await askQuestion("Enter CURRENT Admin Password: ");
    try {
      console.log("\nLogging in with current admin credentials...");
      const credential = await signInWithEmailAndPassword(auth, currentEmail, oldPassword);
      const user = credential.user;

      console.log("Updating email in Firebase Auth...");
      await updateEmail(user, newEmail);

      console.log("Updating password in Firebase Auth...");
      await updatePassword(user, newPassword);

      console.log("Successfully updated credentials in Firebase Auth!");
    } catch (err: any) {
      console.error("Error updating credentials in Firebase Auth:", err.message);
      rl.close();
      return;
    }
  } else {
    console.error("Invalid option selected.");
    rl.close();
    return;
  }

  // Update frontend files
  console.log("\nUpdating frontend code files...");

  // Update App.tsx
  const updatedAppTsxContent = appTsxContent.replace(
    /const ADMIN_EMAIL = '[^']+';/,
    `const ADMIN_EMAIL = '${newEmail}';`
  );
  fs.writeFileSync(appTsxPath, updatedAppTsxContent, 'utf8');
  console.log("- Updated src/App.tsx");

  // Update AdminPanel.tsx
  const updatedAdminPanelContent = adminPanelContent.replace(
    /\{ label: 'Admin Email', value: '[^']+' \}/,
    `{ label: 'Admin Email', value: '${newEmail}' }`
  );
  fs.writeFileSync(adminPanelPath, updatedAdminPanelContent, 'utf8');
  console.log("- Updated src/components/AdminPanel.tsx");

  console.log("\n=== Admin credentials updated successfully! ===");
  rl.close();
}

main().catch(console.error);
