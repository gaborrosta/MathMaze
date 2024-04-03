import { useEffect, useRef } from "react";
import axios from "axios";
import { BACKEND_URL } from "../utils/constants";

/**
 * TokenRefresher refreshes the authentication token after a certain amount of time.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.token - The current authentication token.
 * @param {Function} props.setToken - The function to update the authentication token.
 * @param {number} [props.refreshMinutes] - The number of minutes after which the token should be refreshed. Default: 30 minutes.
 */
export default function TokenRefresher({ token, setToken, refreshMinutes = 30 }) {
  //Store the timeout ID in a ref
  const timeoutId = useRef(null);


  //Refresh the token after a certain amount of time
  useEffect(() => {
    //Clear the existing timeout when the component updates or unmounts
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    //Start a new timeout to refresh the token if there is a token
    if (token) {
      timeoutId.current = setTimeout(() => {
        //Refresh the token
        axios.get(`${BACKEND_URL}/users/check?token=${token}`)
          .then(response => {
            setToken(response.data);
          });
      }, refreshMinutes * 60 * 1000);
    }

    //Clear the timeout when the component unmounts
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [token, refreshMinutes, setToken]);


  //Render nothing
  return null;
}
