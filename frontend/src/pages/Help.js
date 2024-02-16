import React from "react";
import { useTranslation } from "react-i18next";

export default function Help() {
  const { t } = useTranslation();

  return (
    <>
      <center>
        <h1>{t("help-title")}</h1>
      </center>
      <p>TODO...</p>
    </>
  );
}
