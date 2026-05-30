import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-bootstrap";
import axios from "axios";
import { BACKEND_URL } from "../utils/constants";
import TokenContext from "../utils/TokenContext";
import TokenRefresher from "../utils/TokenRefresher";
import LoadingSpinner from "../components/LoadingSpinner";
import CheckUploadMaze from "../components/CheckUploadMaze";
import CheckRecognisedMaze from "../components/CheckRecognisedMaze";
import CheckResults from "../components/CheckResults";

/**
 * CheckMaze renders the maze checker page to upload a scanned maze.
 *
 * @returns {React.Element} The CheckMaze component.
 */
export default function CheckMaze() {
  //Localisation
  const { t } = useTranslation();


  //Set the page title
  useEffect(() => { document.title = t("maze-check-title") + " | " + t("app-name"); });


  //Token
  const { token, setToken } = useContext(TokenContext);


  //Actual step
  const [step, setStep] = useState(0);

  //Recognised maze data
  const [recognisedData, setRecognisedData] = useState({});

  //Checked maze data
  const [checkData, setCheckData] = useState({});

  //Maze ID
  const [mazeId, setMazeId] = useState("");

  //Nickname
  const [nickname, setNickname] = useState("");


  //Loading and error handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  //Upload the image
  const uploadImage = async (data) => {
    //Loading
    setLoading(true);

    //Add token
    data.append("token", token);

    //Save maze ID
    setMazeId(data.get("mazeId"));

    //Send data
    axios.post(`${BACKEND_URL}/maze/recognise`, data, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
    .then(response => {
      setLoading(false);
      setError("");

      //Move to the next step
      setToken(response.data.token);
      setRecognisedData(response.data.recognisedMaze);
      setStep(1);
    })
    .catch(error => {
      setLoading(false);

      if (!error.response) {
        setError("error-unknown");
        return;
      } else if (error.response.status === 413) {
        setError("error-file-too-large");
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
          setError("error-could-not-recognise-maze");
          break;
        default:
          setError("error-unknown-form");
          break;
      }
    });
  };

  //Check the maze
  const checkMaze = async (data) => {
    //Loading
    setLoading(true);

    //Add token
    data.token = token;

    //Save nickname
    setNickname(data.nickname);

    //Save data
    setRecognisedData(prevData => ({
      ...prevData,
      data: data.data,
      path: data.path,
    }));

    //Send data
    axios.post(`${BACKEND_URL}/maze/check`, data, {
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      setLoading(false);
      setError("");

      //Move to the next step
      setToken(response.data.token);
      setCheckData(response.data.checkedMaze);
      setStep(2);
    })
    .catch(error => {
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
        case "NotNumberInMazeException":
          setError("error-not-number-in-maze");
          break;
        default:
          setError("error-unknown-form");
          break;
      }
    });
  }


  //Render the page
  return (
    <>
      <center>
        <h1>{t("maze-check-title")}</h1>
      </center>

      <p>{t("maze-check-info")}</p>

      {loading ? <LoadingSpinner /> : <>
        {error && <Alert variant="danger">{t(error)}</Alert>}

        {step === 0 && <CheckUploadMaze initialId={mazeId} handleSubmit={uploadImage} />}
        {step === 1 && <>
          <CheckRecognisedMaze data={recognisedData} initialNickname={nickname} handleSubmit={checkMaze} />
          <TokenRefresher token={token} setToken={setToken} />
        </>}
        {step === 2 && <CheckResults data={checkData} />}
      </>}
    </>
  );
};
