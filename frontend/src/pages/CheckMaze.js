import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-bootstrap";
import LoadingSpinner from "../components/LoadingSpinner";
import CheckMazeUpload from "../components/CheckMazeUpload";
import CheckMazeRecognise from "../components/CheckMazeRecognise";
import CheckMazeResults from "../components/CheckMazeResults";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { TokenContext } from "../utils/TokenContext";

export default function CheckMaze() {
  const { t } = useTranslation();

  useEffect(() => { document.title = t("maze-check-title") + " | " + t("app-name"); });

  const { token, setToken } = useContext(TokenContext);

  const [step, setStep] = useState(0);
  const [recognisedData, setRecognisedData] = useState({});
  const [checkData, setCheckData] = useState({});

  const [mazeId, setMazeId] = useState("");
  const [nickname, setNickname] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit1 = async (data) => {
    setLoading(true);

    data.append("token", token);

    setMazeId(data.get("mazeId"));

    axios.post(`${BASE_URL}/maze/recognise`, data, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
    .then(response => {
      setError("");
      setToken(response.data.token);
      setLoading(false);
      setRecognisedData(response.data.recognisedMaze);
      setStep(1);
    })
    .catch(error => {
      console.log(error); //TODO...
      setLoading(false);

      if (!error.response) {
        setError("error-unknown");
        return;
      }

      switch (error.response.data) {
        case "InvalidMazeIdException":
          setError("error-invalid-maze-id");
          break;
        case "InvalidRotationException":
          setError("error-invalid-rotation");
          break;
        case "CouldNotRecogniseMazeException":
          setError("error-could-not-regonise-maze");
          break;
        default:
          setError("error-unknown-form");
          break;
      }
    });
  };

  const handleSubmit2 = async (data) => {
    setLoading(true);

    data["token"] = token;

    setNickname(data.nickname);
    setRecognisedData(prevData => ({
      ...prevData,
      data: data.data,
      path: data.path,
    }));

    axios.post(`${BASE_URL}/maze/check`, data, {
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      setError("");
      setToken(response.data.token);
      setLoading(false);
      setCheckData(response.data.checkedMaze);
      setStep(2);
    })
    .catch(error => {
      console.log(error); //TODO...
      setLoading(false);

      if (!error.response) {
        setError("error-unknown");
        return;
      }

      switch (error.response.data) {
        case "NicknameInvalidFormatException":
          setError("error-nickname-invalid-format");
          break;
        case "NicknameNotUniqueException":
          setError("error-nickname-not-unique");
          break;
        case "InvalidMazeIdException":
          setError("error-invalid-maze-id");
          break;
        case "InvalidPathException":
          setError("error-invalid-path");
          break;
        case "InvalidMazeDimensionException":
          setError("error-invalid-maze-dimension");
          break;
        default:
          setError("error-unknown-form");
          break;
      }
    });
  }

  return (
    <>
      <center>
        <h1>{t("maze-check-title")}</h1>
      </center>
      <p>{t("maze-check-info")}</p>

      {loading ? <LoadingSpinner /> : (
        <>
          {error && <Alert variant="danger">{t(error)}</Alert>}

          {step === 0 && <CheckMazeUpload handleSubmit={handleSubmit1} initialId={mazeId}/>}
          {step === 1 && <CheckMazeRecognise data={recognisedData} handleSubmit={handleSubmit2} initialNickname={nickname} />}
          {step === 2 && <CheckMazeResults data={checkData} />}
        </>
      )}
    </>
  );
};