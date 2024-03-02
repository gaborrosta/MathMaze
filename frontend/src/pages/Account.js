import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";

export default function Account() {
  const { t } = useTranslation();

  useEffect(() => { document.title = t("account-title") + " | " + t("app-name"); });

  const token = sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to={"/login/?next=/account"} replace />;
  }

  return (
    <>
      <center>
        <h1>{t("account-title")}</h1>
      </center>
    </>
  );
}
