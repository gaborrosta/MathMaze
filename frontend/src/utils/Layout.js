import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Container, Modal } from "react-bootstrap";
import Menu from "../components/Menu";
import { BACKEND_URL } from "../utils/constants";
import axios from "axios";
import TokenContext from "./TokenContext";

const SessionExpired = {
  NO: -1,
  ACCOUNT: 0,
  OTHER_PAGE: 1,
}

const Layout = () => {
  const { t } = useTranslation();

  const [token, setToken] = useState(sessionStorage.getItem("token") || "");
  const prevTokenRef = useRef();
  const logoutRef = useRef(false);
  const [sessionExpired, setSessionExpired] = useState(SessionExpired.NO);

  const navigate = useNavigate();
  const navigateRef = useRef(navigate);

  const location = useLocation();
  const pathnameRef = useRef(location.pathname);

  useEffect(() => {
    pathnameRef.current = location.pathname;
    navigateRef.current = navigate;
  }, [location.pathname, navigate]);

  const timeoutId = useRef(null);

  const logout = () => {
    logoutRef.current = true;
    setToken("");
    navigate("/");
  };

  const expired = () => {
    setToken("");

    if (pathnameRef.current === "/account") {
      navigateRef.current("/login?next=/account");
      setSessionExpired(SessionExpired.ACCOUNT);
    } else {
      setSessionExpired(SessionExpired.OTHER_PAGE);
    }
  }

  useEffect(() => {
    //Previous token value
    const prevToken = prevTokenRef.current;
    prevTokenRef.current = token;

    //Clear the existing timeout
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
        axios.get(`${BACKEND_URL}/users/check?token=${token}`)
        .catch(_ => {
          expired();
        });
      }, 62 * 60 * 1000); //62 minutes (token expires in 1 hour)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [token]);

  return (
    <TokenContext.Provider value={{ token, setToken, logout }}>
      {/* eslint-disable-next-line jsx-a11y/no-distracting-elements */}
      <marquee behavior="scroll" direction="left"><b>{t("website-under-construction")}</b></marquee>
      <Menu />
      <Container>
        <Outlet />
      </Container>
      <Modal show={sessionExpired !== SessionExpired.NO} onHide={() => setSessionExpired(SessionExpired.NO)}>
        <Modal.Header closeButton>
          <Modal.Title>{sessionExpired === SessionExpired.ACCOUNT ? t("session-expired-log-in") : t("session-expired")}</Modal.Title>
        </Modal.Header>
      </Modal>
    </TokenContext.Provider>
  )
};

export default Layout;
