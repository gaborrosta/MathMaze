import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import TokenContext from "./TokenContext";

/**
 * AuthChecker checks if a user is authenticated.
 * If the user is authenticated, it renders the provided Component. Otherwise, it redirects them to the login page.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {React.ComponentType} props.Component - The component to render if the user is authenticated.
 * @param {string} props.url - The URL to redirect after login.
 *
 * @returns {React.Element} The provided Component if the user is authenticated, otherwise a Navigate component.
 */
export default function AuthChecker({ Component, url }) {
  //Check the parameters
  checkParameters(Component, url);


  //Get the token from the context
  const { token } = useContext(TokenContext);


  //If there is no token, redirect to the login page
  if (!token) {
    return <Navigate to={"/login/?next=/" + url} replace />;
  } else {
    return <Component />;
  }
}


/**
 * Checks the parameters passed to the AuthChecker component.
 */
function checkParameters(Component, url) {
  if (Component === undefined) {
    throw new Error("Component is required");
  }
  if (typeof Component !== "function") {
    throw new Error("Component must be a function");
  }

  if (url === undefined) {
    throw new Error("url is required");
  }
  if (typeof url !== "string") {
    throw new Error("url must be a string");
  }
}
