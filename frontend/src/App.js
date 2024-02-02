import React from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./utils/Layout";
import Index from "./pages/Index";

export default function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={createBrowserRouter([
          {
            path: "/",
            element: <Layout />,
            children: [
              {
                index: true,
                Component: Index,
              },
            ],
          },
        ])} />
    </React.StrictMode>
  );
}
