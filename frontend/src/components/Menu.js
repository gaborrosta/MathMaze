import React from 'react';
import { useTranslation } from "react-i18next";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';

export default function Menu() {
  const { i18n } = useTranslation();

  return (
    <Navbar expand="lg" className="yellow">
      <Container>
        <Navbar.Brand href="/">
          <img src="/logo.png" alt="Logo" width="30" height="30" className="d-inline-block align-top" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Form variant="outlined" size="small">
              <Form.Select aria-label="Language change" onChange={e => i18n.changeLanguage(e.target.value)} value={i18n.resolvedLanguage} >
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
