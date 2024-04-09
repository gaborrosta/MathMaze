import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Alert } from "react-bootstrap";

/**
 * NoPage displays the 404 page.
 * 
 * @returns {React.Element} The NoPage component.
 */
const NoPage = () => {
  //Localisation
  const { t } = useTranslation();


  //Set the page title
  useEffect(() => { document.title = "404 | " + t("app-name"); });


  //Render the page
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
