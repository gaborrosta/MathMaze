import React from "react";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <>
      <center>
        <h1>{t("privacy-policy-title")}</h1>
      </center>
      <p>TODO...</p>
    </>
  );
}
