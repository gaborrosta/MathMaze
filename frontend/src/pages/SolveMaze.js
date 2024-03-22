import React, { useEffect, useState, useContext } from "react";
import { useSearchParams  } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Form, Button, Alert } from "react-bootstrap";
import { BACKEND_URL } from "../utils/constants";
import axios from "axios";
import { TokenContext } from "../utils/TokenContext";
import LoadingSpinner from "../components/LoadingSpinner";

export default function SolveMaze() {
  const { t } = useTranslation();

  useEffect(() => { document.title = t("maze-solve-title") + " | " + t("app-name"); });

  const { token, setToken } = useContext(TokenContext);

  const [params] = useSearchParams();

  const [loading, setLoading] = useState(true);

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const [mazeId, setMazeId] = useState("");
  const [mazeIdError, setMazeIdError] = useState("");
  const [mazeIdFormError, setMazeIdFormError] = useState("");

  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [passcodeFormError, setPasscodeFormError] = useState("");

  const [checkedMazeId, setCheckedMazeId] = useState("");
  const [checkedPasscode, setCheckedPasscode] = useState("");

  const [mazeData, setMazeData] = useState({});

  const loadingDone = () => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }

  const checkMaze = (mazeId, passcode) => {
    setLoading(true);
    setMazeIdError("");
    setMazeIdFormError("");
    setPasscodeError("");
    setPasscodeFormError("");

    let url = `${BACKEND_URL}/maze/open?mazeId=${mazeId}&token=${token}`;
    if (passcode) {
      url += `&passcode=${passcode}`;
    }

    axios.get(url)
    .then(response => {
      loadingDone();
      setToken(response.data.token);
      setMazeData(response.data.maze);
      setCheckedMazeId(mazeId);

      if (passcode) {
        if (response.data.maze.passcode === false) {
          setPasscodeFormError("error-invalid-passcode-solve");
          return;
        }
        setCheckedPasscode(passcode);
      }
    })
    .catch(error => {
      loadingDone();

      if (!error.response) {
        setMazeIdFormError("error-unknown");
        return;
      }

      switch (error.response.data) {
        case "InvalidMazeIdException":
          setMazeIdFormError("error-invalid-maze-id-or-private");
          break;
        default:
          setMazeIdFormError("error-unknown-form");
          break;
      }
    });
  }

  useEffect(() => {
    const id = params.get("id");
    if (!id) {
      setLoading(false);
    } else {
      setMazeId(id);
      setMazeIdError("");
      checkMaze(id);
    }
  }, [params]);

  const handleMazeIdChange = (e) => {
    setMazeId(e.target.value);
    if (!e.target.value) {
      setMazeIdError(t("error-invalid-maze-id"));
    } else {
      setMazeIdError("");
    }
  };

  useEffect(() => {
    if ((!checkedMazeId && (!mazeId || mazeIdError)) || (checkedMazeId && (!passcode || passcodeError))) {
      setIsSubmitDisabled(true);
    } else {
      setIsSubmitDisabled(false);
    }
  }, [mazeId, mazeIdError, passcode, passcodeError]);

  return (
    <>
      <center>
        <h1>{t("maze-solve-title")}</h1>
      </center>
      <p>{t("maze-solve-info")}</p>

      {loading ? <LoadingSpinner /> : <>
        {(!params.get("id") && !checkedMazeId || mazeIdFormError) && <>
          {mazeIdFormError && <Alert variant="danger">{t(mazeIdFormError)}</Alert>}
          <Form.Group controlId="mazeId">
            <Form.Label>{t("maze-check-id-label")}</Form.Label>
            <Form.Control name="mazeId" type="number" value={mazeId} onChange={handleMazeIdChange} aria-describedby="mazeIdHelp mazeIdError" />
            <Form.Text id="mazeIdHelp" className="text-muted">
              {t("maze-solve-id-help")}
            </Form.Text>
            {mazeIdError && <><br /><Form.Text className="text-danger">{t(mazeIdError)}</Form.Text></>}
          </Form.Group>
          <br />
          <Button disabled={isSubmitDisabled} onClick={() => checkMaze(mazeId)} className="mb-3">{t("maze-solve-submit-id")}</Button>
        </>}

        {(Object.keys(mazeData).length !== 0 && mazeData.passcode === false && !checkedPasscode) && <>
          {passcodeFormError && <Alert variant="danger">{t(passcodeFormError)}</Alert>}
          <Form.Group controlId="passcode">
            <Form.Label>{t("maze-passcode")}</Form.Label>
            <Form.Control name="passcode" type="text" value={passcode} onChange={(e) => setPasscode(e.target.value)} aria-describedby="passcodeHelp" />
            <Form.Text id="passcodeHelp" className="text-muted">
              {t("maze-solve-passcode-help")}
            </Form.Text>
          </Form.Group>
          <br />
          <Button disabled={isSubmitDisabled} onClick={() => checkMaze(checkedMazeId, passcode)} className="mb-3">{t("maze-solve-submit-passcode")}</Button>
        </>}

        {Object.keys(mazeData).length !== 0 && !mazeData.hasOwnProperty("passcode") && <>
          hi
        </>}
      </>}
    </>
  );
}
