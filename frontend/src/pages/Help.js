import React, { useEffect } from "react";
import { useTranslation, Trans } from "react-i18next";
import { Link } from "react-router-dom";

const Help = () => {
  const { t } = useTranslation();

  useEffect(() => { document.title = t("help-title") + " | " + t("app-name"); });

  return (
    <>
      <center>
        <h1>{t("help-title")}</h1>
      </center>
      {/* TODO... */}
      <b>{t("webpage-under-construction")}</b><br /><br />
      <Trans i18nKey="help-privacy-terms-link">You can read our <Link to="/privacy-policy">Privacy Policy</Link> and our <Link to="/terms-and-conditions">Terms and Conditions</Link>.</Trans>
    </>
  );
}

export default Help;
