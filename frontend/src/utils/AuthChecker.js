import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { TokenContext } from "./TokenContext";

export default function AuthChecker({ Component, url }) {
  const { token } = useContext(TokenContext);

  if (!token) {
    return <Navigate to={"/login/?next=/" + url} replace />;
  } else {
    return <Component />;
  }
}
