import React from "react";
import { Outlet } from "react-router-dom";
import Menu from "../components/Menu";
import Container from 'react-bootstrap/Container';

const Layout = () => {
  return (
    <>
      <Menu />
      <Container>
        <Outlet />
      </Container>
    </>
  )
};

export default Layout;
