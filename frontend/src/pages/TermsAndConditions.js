import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

const TermsAndConditions = () => {
  const { t } = useTranslation();

  useEffect(() => { document.title = t("terms-and-conditions-title") + " | " + t("app-name"); });

  return (
    <>
      <center>
        <h1>{t("terms-and-conditions-title")}</h1>
      </center>
      <p>TODO...</p>
    </>
  );
}

export default TermsAndConditions;