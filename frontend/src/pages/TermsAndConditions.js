import React from "react";
import { useTranslation } from "react-i18next";

export default function TermsAndConditions() {
  const { t } = useTranslation();

  return (
    <>
      <center>
        <h1>{t("terms-and-conditions-title")}</h1>
      </center>
      <p>TODO...</p>
    </>
  );
}
