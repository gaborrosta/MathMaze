import React, { useEffect, useState, useContext, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams  } from "react-router-dom";
import { Form, Button, Alert, Row, Col } from "react-bootstrap";
import axios from "axios";
import { BACKEND_URL, INTEGER_REGEX } from "../utils/constants";
import TokenContext from "../utils/TokenContext";
import StatelessForm from "../utils/StatelessForm";
import BaseForm from "../utils/BaseForm";
import LoadingSpinner from "../components/LoadingSpinner";
import PDFButtons from "../components/PDFButtons";
import MazeOnlineSolve from "../components/MazeOnlineSolve";
import TokenRefresher from "../utils/TokenRefresher";
import CheckResults from "../components/CheckResults";

/**
 * SolveMaze renders the online solver page with buttons to download the maze.
 *
 * @returns {React.Element} The SolveMaze component.
 */
export default function SolveMaze() {
  //Localisation
  const { t } = useTranslation();


  //Set the page title
  useEffect(() => { document.title = t("maze-solve-title") + " | " + t("app-name"); });


  //Token
  const { token, setToken } = useContext(TokenContext);


  //Params for the maze ID
  const [params] = useSearchParams();


  //Loading state
  const [loading, setLoading] = useState(true);

  //Function to set loading to false after 1 second
  const loadingDone = () => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }


  //Initial data, validation schema and everything for MAZE ID
  const [formDataForMazeId, setFormDataForMazeId] = useState({ mazeId: "" });
  const validationSchemaForMazeId = {
    mazeId: {
      required: true,
      regex: INTEGER_REGEX,
      regexError: "error-invalid-maze-id",
    },
  };
  const [mazeIdError, setMazeIdError] = useState("");
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});


  //Initial data and validation schema for MAZE ID and PASSCODE
  const [formDataForBoth, setFormDataForBoth] = useState({
    mazeId: "",
    passcode: "",
  });
  const validationSchemaForBoth = {
    mazeId: {
      required: true,
      regex: INTEGER_REGEX,
      regexError: "error-invalid-maze-id",
    },
    passcode: {
      required: true,
      regex: new RegExp(/^[0-9]{8,20}$/),
      regexError: "error-invalid-passcode",
    },
  };


  //Validated maze ID and passcode
  const [checkedMazeId, setCheckedMazeId] = useState("");
  const [checkedPasscode, setCheckedPasscode] = useState("");


  //Returned maze
  const [maze, setMazeData] = useState({});


  //Handle the check request for the maze ID
  const loadMazeWrapperForForm = (event) => {
    event.preventDefault();
    loadMaze(formDataForMazeId, setMazeIdError, null, null, () => {});
  }

  //Handle the check request
  const loadMaze = useCallback((formData, setError, setSuccess, setFormData, done) => {
    //Loading
    setLoading(true);

    //Create url
    let url = `${BACKEND_URL}/maze/open?mazeId=${formData.mazeId}&token=${token}`;
    if (formData.passcode) {
      url += `&passcode=${formData.passcode}`;
    }

    axios.get(url)
    .then(response => {
      loadingDone();

      setToken(response.data.token);
      setMazeData(response.data.maze);
      setCheckedMazeId(formData.mazeId);
      setFormDataForBoth({ mazeId: formData.mazeId, passcode: formData.passcode ? formData.passcode : "" });

      //Passcode?
      if (formData.passcode) {
        if (response.data.maze.passcode === false) {
          setError("error-invalid-passcode-solve");
          return;
        }
        setCheckedPasscode(formData.passcode);
      }

      setError("");
    })
    .catch(error => {
      loadingDone();

      if (!error.response) {
        setError("error-unknown");
        return;
      }

      switch (error.response.data) {
        case "InvalidMazeIdException":
          setError("error-invalid-maze-id-or-private");
          break;
        default:
          setError("error-unknown-form");
          break;
      }
    })
    .finally(() => {
      done();
    });
  }, [token, setToken]);


  //Create the form for maze ID
  const formForMazeId = (formData, handleChange, fieldErrors) => {
    return (
      <>
        {mazeIdError && <Alert variant="danger">{t(mazeIdError)}</Alert>}
        <Form.Group controlId="mazeId" className="mb-3">
          <Form.Label>{t("maze-check-id-label")} <span className="text-danger">*</span></Form.Label>
          <Form.Control name="mazeId" type="text" value={formData.mazeId} onChange={handleChange} aria-describedby="mazeIdHelp fieldErrors.mazeId" />
          <Form.Text id="mazeIdHelp" className="text-muted">
            {t("maze-solve-id-help")}
          </Form.Text>
          {fieldErrors.mazeId && <><br /><Form.Text className="text-danger">{t(fieldErrors.mazeId)}</Form.Text></>}
        </Form.Group>
      </>
    );
  };


  //Create the form for passcode
  const formForPasscode = (formData, handleChange, fieldErrors, error, success, submitButton) => {
    return (
      <>
        {error && <Alert variant="danger">{t(error)}</Alert>}
        <Form.Group controlId="passcode" className="mb-3">
          <Form.Label>{t("maze-passcode")} <span className="text-danger">*</span></Form.Label>
          <Form.Control name="passcode" type="text" value={formData.passcode} onChange={handleChange} aria-describedby="passcodeHelp fieldErrors.passcode" />
          <Form.Text id="passcodeHelp" className="text-muted">
            {t("maze-solve-passcode-help")}
          </Form.Text>
        {fieldErrors.passcode && <><br /><Form.Text className="text-danger">{t(fieldErrors.passcode)}</Form.Text></>}
        </Form.Group>
        {submitButton}
      </>
    );
  };


  //Check the maze ID
  useEffect(() => {
    const id = params.get("id");

    if (!id) {
      setLoading(false);
    } else {
      setFormDataForMazeId({ mazeId: id });
      loadMaze({ mazeId: id }, setMazeIdError, null, null, () => {});
    }
  }, [params, loadMaze]);


  //Show online solver?
  const [showOnline, setShowOnline] = useState(false);

  //Nickname
  const [nickname, setNickname] = useState("");

  //Sent maze and path
  const [sentMaze, setSentMaze] = useState(null);
  const [sentPath, setSentPath] = useState(null);

  //Error for the check
  const [checkError, setCheckError] = useState("");

  //Checked maze data
  const [checkedData, SetCheckedData] = useState(null);


  //Check the maze
  const checkMaze = async (data) => {
    //Loading
    setLoading(true);

    //Add token
    data.token = token;

    //Save nickname, maze, path
    setNickname(data.nickname);
    setSentMaze(data.data);
    setSentPath(data.path);

    //Send data
    axios.post(`${BACKEND_URL}/maze/check`, data, {
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      loadingDone();
      setCheckError("");

      setToken(response.data.token);
      SetCheckedData(response.data.checkedMaze);
    })
    .catch(error => {
      loadingDone();

      if (!error.response) {
        setCheckError("error-unknown");
        return;
      }

      switch (error.response.data) {
        case "NicknameInvalidFormatException":
          setCheckError("error-nickname-invalid-format");
          break;
        case "NicknameNotUniqueException":
          setCheckError("error-nickname-not-unique");
          break;
        case "InvalidMazeIdException":
          setCheckError("error-invalid-maze-id");
          break;
        case "InvalidPathException":
          setCheckError("error-invalid-path");
          break;
        case "InvalidMazeDimensionException":
          setCheckError("error-invalid-maze-dimension");
          break;
        case "NotNumberInMazeException":
          setCheckError("error-not-number-in-maze");
          break;
        default:
          setCheckError("error-unknown-form");
          break;
      }
    });
  }


  //Render the page
  return (
    <>
      <center>
        <h1>{t("maze-solve-title")}</h1>
      </center>
      <p>{t("maze-solve-info")}</p>

      {loading && <LoadingSpinner />}

      <div style={{ display: loading ? "none" : "block" }}>
        {!checkedMazeId &&
          <Form onSubmit={loadMazeWrapperForForm}>
            <StatelessForm
              formData={formDataForMazeId}
              validationSchema={validationSchemaForMazeId}
              fieldErrors={fieldErrors}
              setFieldErrors={setFieldErrors}
              setIsThereAnyError={setIsSubmitDisabled}
              onStateChanged={setFormDataForMazeId}
              form={formForMazeId}
            />
            <br />
            <Button className="mb-3" variant="primary" type="submit" disabled={isSubmitDisabled}>
              {t("maze-solve-submit-id")}
            </Button>
          </Form>
        }

        {(Object.keys(maze).length !== 0 && maze.passcode === false && !checkedPasscode) &&
          <BaseForm
            onSubmit={loadMaze}
            initialData={formDataForBoth}
            validationSchema={validationSchemaForBoth}
            form={formForPasscode}
            buttonText="maze-solve-submit-passcode"
          />
        }

        {(Object.keys(maze).length !== 0 && !maze.hasOwnProperty("passcode")) && <>
          <Alert variant="info">
            <div>
              <Row className="mb-1">
                <Col xs={12} md={3}>
                  {t("maze-check-id-label")}: {maze.id}
                </Col>
                <Col xs={12} md={3}>
                  {t("maze-size", { height: maze.height, width: maze.width })}
                </Col>
                <Col xs={12} md={3}>
                  {t("maze-length-of-the-path", { length: maze.pathLength })}
                </Col>
                <Col xs={12} md={3}>
                  {t("maze-generate-path-type")}: {maze.pathTypeEven ? t("maze-generate-path-type-even") : t("maze-generate-path-type-odd")}
                </Col>
              </Row>
              <Row>
                <Col>
                  <p>{t("maze-description")}: {maze.description ? maze.description : "-"}</p>
                </Col>
              </Row>
              <Row>
                <Col>
                  <p>{t("maze-generated-by", { username: maze.user })}</p>
                </Col>
              </Row>
            </div>
          </Alert>

          <Row className="mb-3">
            <Col className="mx-auto text-center" xs={12} md={6}>
              <PDFButtons actualData={maze} />

              {!showOnline && <>
                <p>{t("or")}</p>

                <Button onClick={() => setShowOnline(true)}>
                  {t("maze-solve-online")}
                </Button>
              </>}
            </Col>
          </Row>

          {(showOnline && !checkedData) && <>
            <MazeOnlineSolve data={maze} initialNickname={nickname} initialMaze={sentMaze} initialPath={sentPath} handleSubmit={checkMaze} submitError={checkError} />
            <TokenRefresher token={token} setToken={setToken} />
          </>}

          {checkedData && <CheckResults data={checkedData} />}
        </>}
      </div>
    </>
  );
}
