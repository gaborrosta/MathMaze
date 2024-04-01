import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  useEffect(() => { document.title = t("privacy-policy-title") + " | " + t("app-name"); });

  return (
    <>
      <center>
        <h1>{t("privacy-policy-title")}</h1>
      </center>
      {/* TODO... */}
      <b>{t("webpage-under-construction")}</b><br /><br />
    </>
  );
}

export default PrivacyPolicy;
