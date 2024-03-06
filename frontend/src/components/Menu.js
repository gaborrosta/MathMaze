import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { authObserver } from "../utils/auth";

export default function Menu() {
  const { i18n, t } = useTranslation();

  const [token, setToken] = useState(sessionStorage.getItem("token"));
  const [sessionExpired, setSessionExpired] = useState(false);

  const timeoutId = useRef(null);

  useEffect(() => {
    let privateToken = sessionStorage.getItem("token");

    authObserver.subscribe("token", data => {
      privateToken = data;
      sessionStorage.setItem("token", data);
      setToken(data);

      //Clear the existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId.current);
      }

      //Start a new timeout
      if (privateToken) {
        timeoutId.current = setTimeout(() => {
          axios.get(`${BASE_URL}/users/check?token=${privateToken}`)
          .catch(_ => {
            privateToken = "";
            setToken("");
            authObserver.publish("token", "");
            setSessionExpired(true);
          });
        }, 65 * 60 * 1000); //65 minutes (token expires in 1 hour)
      }
    });

    return () => {
      authObserver.unsubscribe("token");

      if (timeoutId) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.removeItem("token");
    setToken("");
    navigate("/");
  };

  return (
    <>
      <Navbar expand="lg" className="yellow">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <img src="/logo.png" alt={t("logo")} width="30" height="30" className="d-inline-block align-top" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/help">{t("help-title")}</Nav.Link>
              <Nav.Link as={Link} to="/generate-maze">{t("maze-generate-title")}</Nav.Link>
            </Nav>
            <Nav className="ms-auto">
              {token ?
                <>
                  <Nav.Link as={Link} to="/account">{t("account-title")}</Nav.Link>
                  <Nav.Link onClick={logout}>{t("logout")}</Nav.Link>
                </>
              :
                <>
                  <Nav.Link as={Link} to="/signup">{t("signup-title")}</Nav.Link>
                  <Nav.Link as={Link} to="/login">{t("login-title")}</Nav.Link>
                </>
              }
              <Form variant="outlined" size="small">
                <Form.Select aria-label={t("language-change")} onChange={e => i18n.changeLanguage(e.target.value)} value={i18n.resolvedLanguage} >
                  <option value="en">🇬🇧</option>
                  <option value="hu">🇭🇺</option>
                </Form.Select>
              </Form>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Modal show={sessionExpired} onHide={() => setSessionExpired(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t("session-expired")}</Modal.Title>
        </Modal.Header>
      </Modal>
    </>
  );
}
