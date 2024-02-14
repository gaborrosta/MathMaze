import React, { useEffect } from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Loading from "react-fullscreen-loading";
import { useTranslation } from "react-i18next";
import Layout from "./utils/Layout";
import Index from "./pages/Index";
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
                path: "*",
                Component: NoPage,
              },
            ],
          },
        ])} />
    </React.StrictMode>
  );
}
