import { createContext } from "react";

export const TokenContext = createContext({
  token: "",
  setToken: () => {},
  logout: () => {},
});
