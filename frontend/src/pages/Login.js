import React, { useEffect } from "react";
import { useTranslation, Trans } from "react-i18next";
import { Link } from "react-router-dom";

export default function Login() {
  const { t } = useTranslation();

  useEffect(() => { document.title = t("login-title") + " | " + t("app-name"); });

  return (
    <>
      <center>
        <h1>{t("login-title")}</h1>
      </center>
      <p>TODO...</p>
      <p><Trans i18nKey="login-privacy-terms-help-link">You can read our <Link to="/privacy-policy">Privacy Policy</Link>, our <Link to="/terms-and-conditions">Terms and Conditions</Link>, and <Link to="/help">more</Link>.</Trans></p>
    </>
  );
}
