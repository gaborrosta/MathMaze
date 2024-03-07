import React from "react";
import { Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";

export default function LoadingSpinner() {
  const { t } = useTranslation();

  return (
    <center className="mt-5">
      <Spinner animation="border" />
      <p>{t("loading")}</p>
    </center>
  );
}
