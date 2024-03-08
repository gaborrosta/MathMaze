import React from "react";
import { Outlet } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Menu from "../components/Menu";

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
