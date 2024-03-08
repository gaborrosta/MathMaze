import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Alert } from "react-bootstrap";

const NoPage = () => {
  const { t } = useTranslation();

  useEffect(() => { document.title = "404 | " + t("app-name"); });

  return (
    <>
      <center>
        <h1>{t("404")}</h1>
      </center>
      <Alert variant="info">{t("404-info")}</Alert>
      <Link to="/">{t("404-go-back")}</Link>
    </>
  );
};

export default NoPage;
