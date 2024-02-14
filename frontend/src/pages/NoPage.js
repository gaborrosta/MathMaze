import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const NoPage = () => {
  const { t } = useTranslation();

  useEffect(() => { document.title = "404 | " + t("app-name"); });

  return (
    <>
      <h1>{t("404")}</h1>
      <p><Link to="/">{t("homepage")}</Link></p>
    </>
  );
};

export default NoPage;
