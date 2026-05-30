import React from "react";
import { useTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";

/**
 * LoadingSpinner displays a loading spinner and a loading message.
 *
 * @returns {React.Element} The LoadingSpinner component.
 */
const LoadingSpinner = () => {
  //Localisation
  const { t } = useTranslation();


  //Render the component
  return (
    <center className="mt-5">
      <Spinner animation="border" data-testid="spinner" />
      <p>{t("loading")}</p>
    </center>
  );
};

export default LoadingSpinner;
