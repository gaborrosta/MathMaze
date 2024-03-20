import React, { useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { BACKEND_URL } from "../utils/constants";
import axios from "axios";
import { TokenContext } from "../utils/TokenContext";

export default function SolveMaze() {
  const { t } = useTranslation();

  useEffect(() => { document.title = t("maze-solve-title") + " | " + t("app-name"); });

  const { token, setToken } = useContext(TokenContext);

  return (
    <>
      <center>
        <h1>{t("maze-solve-title")}</h1>
      </center>
    </>
  );
}
