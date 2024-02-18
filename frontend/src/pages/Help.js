import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

const Help = () => {
  const { t } = useTranslation();

  useEffect(() => { document.title = t("help-title") + " | " + t("app-name"); });

  return (
    <>
      <center>
        <h1>{t("help-title")}</h1>
      </center>
      <p>TODO...</p>
    </>
  );
}

export default Help;
