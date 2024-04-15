import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Container, Modal } from "react-bootstrap";
import { ArrowUp } from "react-bootstrap-icons";
import ScrollToTop from "react-scroll-to-top";
import axios from "axios";
import Menu from "../components/Menu";
import { BACKEND_URL } from "./constants";
import TokenContext from "./TokenContext";

//Session expiration states
const SessionExpired = {
  NO: -1,
  ACCOUNT: 0,
  OTHER_PAGE: 1,
}


/**
 * Layout wraps the main application layout.
 * It handles token management and session expiration.
 */
const Layout = () => {
  const { t } = useTranslation();


  //Token and session management
  const [token, setToken] = useState(sessionStorage.getItem("token") || "");
  const prevTokenRef = useRef();
  const logoutRef = useRef(false);
  const [sessionExpired, setSessionExpired] = useState(SessionExpired.NO);


  //Navigation and location
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  const location = useLocation();
  const pathnameRef = useRef(location.pathname);

  //Update refs on location or navigation change
  useEffect(() => {
    pathnameRef.current = location.pathname;
    navigateRef.current = navigate;
  }, [location.pathname, navigate]);


  //Store the timeout ID in a ref
  const timeoutId = useRef(null);


  //Logout function
  const logout = () => {
    logoutRef.current = true;
    setToken("");
    navigate("/");
  };


  //Session expiration function
  const expired = () => {
    setToken("");

    //If the user is on the account page, redirect to the login page
    if (pathnameRef.current === "/account") {
      navigateRef.current("/login?next=/account");
      setSessionExpired(SessionExpired.ACCOUNT);
    } else {
      setSessionExpired(SessionExpired.OTHER_PAGE);
    }
  }


  //Check the token after a certain amount of time
  useEffect(() => {
    //Previous token value
    const prevToken = prevTokenRef.current;
    prevTokenRef.current = token;

    //Clear the existing timeout when the component updates or unmounts
    if (timeoutId) {
      clearTimeout(timeoutId.current);
      if (!token && prevToken && !logoutRef.current) {
        expired();
      }
    }

    //Clear the logout flag
    logoutRef.current = false;

    //Save the token in sessionStorage
    sessionStorage.setItem("token", token);

    //Start a new timeout if there is a token
    if (token) {
      timeoutId.current = setTimeout(() => {
        //Check the token
        axios.get(`${BACKEND_URL}/users/check?token=${token}`)
        .catch(_ => {
          expired();
        });
      }, 62 * 60 * 1000); //62 minutes (token expires in 1 hour)
    }

    //Clear the timeout when the component unmounts
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [token]);


  //Render the layout
  return (
    <TokenContext.Provider value={{ token, setToken, logout }}>
      {location.pathname === "/" ? <Outlet /> : <>
        <Menu />
        <Container>
          <Outlet />
        </Container>
      </>}
      <ScrollToTop smooth component={<ArrowUp />} className="yellow" />
      <Modal show={sessionExpired !== SessionExpired.NO} onHide={() => setSessionExpired(SessionExpired.NO)}>
        <Modal.Header closeButton>
          <Modal.Title>{sessionExpired === SessionExpired.ACCOUNT ? t("session-expired-log-in") : t("session-expired")}</Modal.Title>
        </Modal.Header>
      </Modal>
    </TokenContext.Provider>
  )
};

export default Layout;
