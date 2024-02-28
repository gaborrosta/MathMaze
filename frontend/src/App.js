import React, { useEffect } from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Loading from "react-fullscreen-loading";
import { useTranslation } from "react-i18next";
import Layout from "./utils/Layout";
import Index from "./pages/Index";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import Help from "./pages/Help";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import SetNewPassword from "./pages/SetNewPassword";
import Maze from "./pages/Maze";
import NoPage from "./pages/NoPage";

export default function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.resolvedLanguage;
  }, [i18n.resolvedLanguage]);

  return (
    <React.StrictMode>
      <React.Suspense fallback={<Loading loading background="#fedf19" loaderColor="#7d141d" />}></React.Suspense>
      <RouterProvider router={createBrowserRouter([
          {
            path: "/",
            element: <Layout />,
            children: [
              {
                index: true,
                Component: Index,
              },
              {
                path: "privacy-policy",
                Component: PrivacyPolicy,
              },
              {
                path: "terms-and-conditions",
                Component: TermsAndConditions,
              },
              {
                path: "help",
                Component: Help,
              },
              {
                path: "signup",
                Component: Signup,
              },
              {
                path: "login",
                Component: Login,
              },
              {
                path: "reset-password",
                Component: ResetPassword,
              },
              {
                path: "set-new-password",
                Component: SetNewPassword,
              },
              {
                path: "maze",
                Component: Maze,
              },
              {
                path: "*",
                Component: NoPage,
              },
            ],
          },
        ])} />
    </React.StrictMode>
  );
}
