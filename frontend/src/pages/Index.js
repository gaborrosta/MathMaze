import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function Index() {
  const { t } = useTranslation();

  useEffect(() => { document.title = t("app-name-with-slogan"); });

  return (
    <>
      <center>
        <h1>{t("welcome")}</h1>
      </center>
    </>
  );
}
