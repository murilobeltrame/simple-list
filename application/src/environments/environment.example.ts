// CREATE A environment.ts FILE BASED ON THIS EXAMPLE
// REPLACE "..." WITH YOUR ACTUAL FIREBASE CONFIG VALUES

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
  measurementId: "..."
};

export const environment = {
  firebase: firebaseConfig
};

// NOTE: Do not commit your actual environment.ts file with real Firebase config values to version control.
