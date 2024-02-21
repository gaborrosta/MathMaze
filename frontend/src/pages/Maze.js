import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function Maze() {
  const { t } = useTranslation();

  useEffect(() => { document.title = t("maze-title") + " | " + t("app-name"); });

  return (
    <>
      <center>
        <h1>{t("maze-title")}</h1>
      </center>
      <p>TODO...</p>
    </>
  );
}
