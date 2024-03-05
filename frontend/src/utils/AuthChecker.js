import React from "react";
import { Navigate } from "react-router-dom";

export default function AuthChecker({ Component, url }) {
  const token = sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to={"/login/?next=/" + url} replace />;
  } else {
    return <Component />;
  }
}
