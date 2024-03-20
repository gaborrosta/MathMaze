import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Container, Nav, Navbar, Form} from "react-bootstrap";
import { TokenContext } from "../utils/TokenContext";

export default function Menu() {
  const { i18n, t } = useTranslation();

  const { token, logout } = useContext(TokenContext);

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
              <Nav.Link as={Link} to="/solve-maze">{t("maze-solve-title")}</Nav.Link>
              <Nav.Link as={Link} to="/check-maze">{t("maze-check-title")}</Nav.Link>
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
    </>
  );
}
