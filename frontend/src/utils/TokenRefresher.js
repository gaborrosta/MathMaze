import { useEffect, useRef } from "react";
import axios from "axios";
import { BACKEND_URL } from "../utils/constants";

export default function TokenRefresher({ token, setToken, refreshMinutes = 30 }) {
  const timeoutId = useRef(null);

  useEffect(() => {
    //Clear the existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId.current);
    }

    //Start a new timeout if there is a token
    if (token) {
      timeoutId.current = setTimeout(() => {
        axios.get(`${BACKEND_URL}/users/check?token=${token}`)
        .then(response => {
          setToken(response.data);
        })
      }, refreshMinutes * 60 * 1000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [token, refreshMinutes, setToken]);

  return null;
}
