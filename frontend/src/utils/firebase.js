import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
//https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyA-uz5toyFO4Rbq5AyNHIt6wHGkCeVkUNw",
  authDomain: "mathmaze-rg.firebaseapp.com",
  projectId: "mathmaze-rg",
  storageBucket: "mathmaze-rg.appspot.com",
  messagingSenderId: "821454897320",
  appId: "1:821454897320:web:eea9a5e9271136be2e029d",
  measurementId: "G-FLC4ZVTK8X"
};

//Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export { app, analytics };
