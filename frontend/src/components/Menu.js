import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Form from "react-bootstrap/Form";
import { authObserver } from "../utils/auth";

export default function Menu() {
  const { i18n, t } = useTranslation();

  const [token, setToken] = useState(sessionStorage.getItem("token"));

  useEffect(() => {
    authObserver.subscribe("token", data => {
      console.log("token", data);
      sessionStorage.setItem("token", data);
      setToken(data);
    });
    return () => { authObserver.unsubscribe("token"); }
  }, []);


  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.removeItem("token");
    setToken("");
    navigate("/");
  };

  return (
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
  );
}
