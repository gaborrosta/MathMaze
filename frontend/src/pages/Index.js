import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Container, Row, Col } from "react-bootstrap";
import Menu from "../components/Menu";
import Slideshow from "../components/Slideshow";
import ContactForm from "../components/ContactForm";

/**
 * Index renders the index page.
 *
 * @returns {React.Element} The Index component.
 */
export default function Index() {
  //Localisation
  const { t } = useTranslation();


  //Set the page title
  useEffect(() => { document.title = t("app-name-with-slogan"); });


  //Slideshow data
  const slideshow = [
    { title: "welcome-slides-1-title", description: "welcome-slides-1-text", alt: "welcome-slides-1-alt", image: "welcome-slides-1-image" },
    { title: "welcome-slides-2-title", description: "welcome-slides-2-text", alt: "welcome-slides-2-alt", image: "welcome-slides-2-image" },
    { title: "welcome-slides-3-title", description: "welcome-slides-3-text", alt: "welcome-slides-3-alt", image: "welcome-slides-3-image" },
  ];


  //Render the page
  return (
    <>
      <div className="layout-container">
        <Menu />
        <Container className="fill-height-with-max">
          <Row className="fill-height">
            <Col xs={12} md={6} className="d-flex justify-content-center align-items-center yellow-full p-3">
              <img src="/logo-with-slogan.png" alt={t("alt-logo")} className="img-fluid" />
            </Col>
            <Col xs={12} md={6} className="d-flex justify-content-center text-center flex-column red p-3">
              <h1><b>{t("welcome")}</b></h1>
              <p className="lead">{t("welcome-text-1")}</p>
              <p className="lead">{t("welcome-text-2")}</p>
            </Col>
          </Row>
        </Container>
      </div>
      <Container className="mb-3">
        <Row className="mb-5">
          <center>
            <h2 className="mb-5 mt-5">{t("welcome-how-title")}</h2>
          </center>
          <Col xs={12} md={4}>
            <h3>{t("welcome-how-1-title")}</h3>
            <p>{t("welcome-how-1-text")}</p>
          </Col>
          <Col xs={12} md={4}>
            <h3>{t("welcome-how-2-title")}</h3>
            <p>{t("welcome-how-2-text")}</p>
          </Col>
          <Col xs={12} md={4}>
            <h3>{t("welcome-how-3-title")}</h3>
            <p>{t("welcome-how-3-text")}</p>
          </Col>
        </Row>
        <Slideshow data={slideshow} />
        <ContactForm />
        <div className="text-center mt-3">
          <hr />
          <p>
            Maze icon by <a href="https://thenounproject.com/icon/maze-129940/" target="_blank" rel="noreferrer">Sergey Demushkin</a> from the Noun Project, CC BY 3.0
          </p>
          <p>
            Copyright (c) 2024 Gábor Rosta<br />
            All rights reserved.<br />
            <a href="https://github.com/gaborrosta/MathMaze" target="_blank" rel="noreferrer">GitHub project</a>
          </p>
        </div>
      </Container>
    </>
  );
}
