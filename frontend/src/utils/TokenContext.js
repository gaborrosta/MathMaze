import { createContext } from "react";

/**
 * TokenContext helps managing authentication token.
 * It provides a context object with the following properties:
 * - token: A string representing the current authentication token.
 * - setToken: A function for setting the current authentication token.
 * - logout: A function for logging out the user, which should clear the current authentication token.
 */
const TokenContext = createContext({
  token: "",
  setToken: () => {},
  logout: () => {},
});

export default TokenContext;
