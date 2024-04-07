import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Container } from "react-bootstrap";
import Menu from "../components/Menu";
import ContactForm from "../components/ContactForm";

export default function Index() {
  const { t } = useTranslation();

  useEffect(() => { document.title = t("app-name-with-slogan"); });

  return (
    <>
      <div>
        <Menu />
        <Container className="mb-3">
          <center>
            <h1>{t("welcome")}</h1>
          </center>
          {/* TODO... */}
          <b>{t("webpage-under-construction")}</b><br /><br />
          <ContactForm />
        </Container>
      </div>
    </>
  );
}
