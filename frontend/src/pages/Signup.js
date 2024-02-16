import React from "react";
import { useTranslation, Trans } from "react-i18next";
import { Link } from "react-router-dom";

export default function Signup() {
  const { t } = useTranslation();

  return (
    <>
      <center>
        <h1>{t("signup-title")}</h1>
      </center>
      <p>TODO...</p>
      <p><p><Trans i18nKey="signup-privacy-terms-statement">By signing up, I state that I have read and accept the <Link to="/privacy-policy">Privacy Policy</Link> and the <Link to="/terms-and-conditions">Terms and Conditions</Link>.</Trans></p></p>
    </>
  );
}
