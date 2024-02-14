import React from "react";
import { useTranslation } from "react-i18next";

export default function Index() {
  const { t } = useTranslation();

  return (
    <>
      <center>
        <h1>{t("welcome")}</h1>
      </center>
    </>
  );
}
