import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Row, Col, Alert, Form, Button } from "react-bootstrap";
import { ArrowUp } from "react-bootstrap-icons";
import MazeGrid from "../components/MazeGrid";
import MazeModal from "../components/MazeModal";
import SolutionIDForm from "../components/SolutionIDForm";
import { BACKEND_URL } from "../utils/constants";
import axios from "axios";
import { TokenContext } from "../utils/TokenContext";
import ScrollToTop from "react-scroll-to-top";

export default function GenerateMaze() {
  const { t } = useTranslation();

  useEffect(() => { document.title = t("maze-generate-title") + " | " + t("app-name"); });

  const { token, setToken } = useContext(TokenContext);

  const [isRequestInProgress, setIsRequestInProgress] = useState(false);

  const isAdditionOrSubtraction = value => value === "ADDITION" || value === "SUBTRACTION" || value === "BOTH_ADDITION_AND_SUBTRACTION";
  const isMultiplicationOrDivision = value => value === "MULTIPLICATION" || value === "DIVISION" || value === "BOTH_MULTIPLICATION_AND_DIVISION";

  const [maze, setMaze] = useState("");
  const [locations, setLocations] = useState(null);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPreviousMazesOptions, setShowPreviousMazesOptions] = useState(false);

  const handleShowAdvancedClick = () => {
    setShowAdvanced(!showAdvanced);
  };

  const handleShowPreviousMazesOptionsClick = () => {
    setShowPreviousMazesOptions(!showPreviousMazesOptions);
  };

  const [formData, setFormData] = useState({
    operation: "ADDITION",
    numbersRangeStart: 1,
    numbersRangeEnd: 10,
    minLength: "",
    maxLength: "",
    width: 11,
    height: 11,
    numberType: "even",
    discardedMazes: [],
    solution1: {},
    solution2: {},
    solution3: {},
  });

  const [error, setError] = useState("");

  const [widthError, setWidthError] = useState("");
  const [heightError, setHeightError] = useState("");
  const [operationError, setOperationError] = useState("");
  const [rangeError, setRangeError] = useState("");
  const [numberTypeError, setNumberTypeError] = useState("");
  const [minLengthError, setMinLengthError] = useState("");
  const [maxLengthError, setMaxLengthError] = useState("");
  const [solution1Error, setSolution1Error] = useState("");
  const [solution2Error, setSolution2Error] = useState("");
  const [solution3Error, setSolution3Error] = useState("");

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const handleChange = (event) => {
    let name = event.target.name;
    let value = event.target.value;

    if (name === "range") {
      value = value.split("-").map(Number);
      setFormData({
        ...formData,
        numbersRangeStart: value[0],
        numbersRangeEnd: value[1],
      });

      //Check if the value meets the conditions based on the operation
      const validRanges = isAdditionOrSubtraction(formData.operation) ? ["1-10", "1-20", "1-100"] : ["1-10", "1-20", "11-20"];
      if (!validRanges.includes(event.target.value)) {
        setRangeError("maze-range-error");
      } else {
        setRangeError("");
      }
    } else if (name === "minLength" || name === "maxLength") {
      setFormData({
        ...formData,
        [name]: value,
      });

      let number = Number(value);
      let min = formData.minLength ? Number(formData.minLength) : 0;
      let max = formData.maxLength ? Number(formData.maxLength) : formData.width * formData.height;

      //Check if the value meets the conditions
      if (value) {
        if (name === "minLength") {
          if (number < Math.min(formData.width, formData.height) || number > max) {
            setMinLengthError("maze-min-length-error");
          } else {
            setMinLengthError("");
          }
        } else {
          if (number < min || number > formData.width * formData.height) {
            setMaxLengthError("maze-max-length-error");
          } else {
            setMaxLengthError("");
          }
        }
      } else {
        if (name === "minLength") {
          setMinLengthError("");
        } else {
          setMaxLengthError("");
        }
      }
    } else if (name === "operation") {
      let oldValue = formData.operation;

      if ((isAdditionOrSubtraction(oldValue) && isMultiplicationOrDivision(value)) || 
          (isMultiplicationOrDivision(oldValue) && isAdditionOrSubtraction(value))) {
          setFormData({
          ...formData,
          operation: value,
          numbersRangeStart: 1,
          numbersRangeEnd: 10,
        });
      } else {
        setFormData({
          ...formData,
          operation: value,
        });
      }

      //Check if the value is one of the specified values
      if (!isAdditionOrSubtraction(value) && !isMultiplicationOrDivision(value)) {
        setOperationError("maze-operation-error");
      } else {
        setOperationError(null);
      }
    } else if (name === "width") {
      setFormData({
        ...formData,
        width: value,
      });

      //Check if the value is between 11 and 49 and odd
      if (value < 11 || value > 49 || value % 2 === 0) {
        setWidthError("maze-generate-width-error");
      } else {
        setWidthError("");
      }
    } else if (name === "height") {
      setFormData({
        ...formData,
        height: value,
      });

      //Check if the value is between 11 and 49 and odd
      if (value < 11 || value > 49 || value % 2 === 0) {
        setHeightError("maze-generate-height-error");
      } else {
        setHeightError("");
      }
    } else if (name === "numberType") {
      setFormData({
        ...formData,
        numberType: value,
      });

      //Check if the value is "even" or "odd"
      if (value !== "even" && value !== "odd") {
        setNumberTypeError("maze-number-type-error");
      } else {
        setNumberTypeError("");
      }
    }
  };

  useEffect(() => {
    if (widthError || heightError || operationError || rangeError || numberTypeError || minLengthError || maxLengthError
      || solution1Error || solution2Error || solution3Error) {
      setIsSubmitDisabled(true);
    } else {
      setIsSubmitDisabled(false);
    }
  }, [widthError, heightError, operationError, rangeError, numberTypeError, minLengthError, maxLengthError,
    solution1Error, solution2Error, solution3Error, formData]);

  const handleGenerateMaze = (e) => {
    e.preventDefault();

    //Discard the maze
    if (maze) {
      formData.discardedMazes = [...formData.discardedMazes, maze.id];
    }

    let data = {
      width: formData.width,
      height: formData.height,
      operation: formData.operation,
      numbersRangeStart: formData.numbersRangeStart,
      numbersRangeEnd: formData.numbersRangeEnd,
      pathTypeEven: formData.numberType === "even",
      discardedMazes: formData.discardedMazes,
      solution1: formData.solution1,
      solution2: formData.solution2,
      solution3: formData.solution3,
      token: token,
    };

    if (formData.minLength) {
      data.minLength = Number(formData.minLength);
    }

    if (formData.maxLength) {
      data.maxLength = Number(formData.maxLength);
    }

    setIsRequestInProgress(true);

    //Send data
    axios.post(`${BACKEND_URL}/maze/generate`, data, {
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      setError("");
      setToken(response.data.token);
      setMaze(response.data.maze);
    })
    .catch(error => {
      setMaze("");

      if (!error.response) {
        setError("error-unknown");
        return;
      }

      switch (error.response.data) {
        case "InvalidMazeDimensionException":
          setError("error-invalid-maze-dimension");
          break;
        case "InvalidPathRangeException":
          setError("error-invalid-path-range");
          break;
        case "InvalidNumbersRangeException":
          setError("error-invalid-numbers-range");
          break;
        case "InvalidSolutionDataException":
          setError("error-invalid-solution-data");
          break;
        case "NotFoundSolutionDataException":
          setError("error-not-found-solution-data");
          break;
        case "NotCompatibleSolutionDataException":
          setError("error-not-compatible-solution-data");
          break;
        case "MultipleSolutionDataException":
          setError("error-multiple-solution-data");
          break;
        default:
          setError("error-unknown-form");
          break;
      }
    })
    .finally(() => {
      setTimeout(() => {
        setIsRequestInProgress(false);
      }, 1000);
    });
  };

  const [modalVisible, setModalVisible] = useState(false);

  const [saveError, setSaveError] = useState("");

  const saveMaze = () => {
    const data = {
      mazeId: maze.id,
      token: token,
    };

    setIsRequestInProgress(true);

    //Send data
    axios.post(`${BACKEND_URL}/maze/save`, data, {
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      setSaveError("");
      setToken(response.data.token);
      setLocations(response.data.locations);
      setMaze(response.data.maze);
      setModalVisible(true);
    })
    .catch(_ => {
      setSaveError("error-unknown");
    })
    .finally(() => {
      setTimeout(() => {
        setIsRequestInProgress(false);
      }, 1000);
    });
  };

  const updateSolutionIDForm = (index, data) => {
    let newFormData = { ...formData };
    newFormData[`solution${index}`] = data;
    setFormData(newFormData);
  }

  return (
    <>
      <center>
        <h1>{t("maze-generate-title")}</h1>
      </center>
      <p>{t("maze-generate-info")}</p>
      <Row>
        <Col xs={12} md={4}>
          <div className="border p-3 m-2">
            {!token && <Alert variant="warning">{t("maze-generate-info-not-logged-in")}</Alert>}
            {error && <Alert variant="danger">{t(error)}</Alert>}
            <Form onSubmit={handleGenerateMaze}>
              <Button variant="primary" type="submit" disabled={isSubmitDisabled || isRequestInProgress}>
                {maze ? t("maze-generate-path-regenerate") : t("maze-generate-path-generate")}
              </Button>
              <br />
              <hr />
              <Form.Group controlId="width">
                <Form.Label>{t("maze-width")}</Form.Label>
                <Form.Control name="width" as="select" value={formData.width} onChange={handleChange} aria-describedby="widthHelp widthError">
                  {[...Array(20).keys()].map(i => <option key={i}>{i * 2 + 11}</option>)}
                </Form.Control>
                <Form.Text id="widthHelp" className="text-muted">
                  {t("maze-generate-width-help")}
                </Form.Text>
                {widthError && <><br /><Form.Text className="text-danger">{t(widthError)}</Form.Text></>}
              </Form.Group>
              <br />
              <Form.Group controlId="height">
                <Form.Label>{t("maze-height")}</Form.Label>
                <Form.Control name="height" as="select" value={formData.height} onChange={handleChange} aria-describedby="heightHelp heightError">
                  {[...Array(20).keys()].map(i => <option key={i}>{i * 2 + 11}</option>)}
                </Form.Control>
                <Form.Text id="heightHelp" className="text-muted">
                  {t("maze-generate-height-help")}
                </Form.Text>
                {heightError && <><br /><Form.Text className="text-danger">{t(heightError)}</Form.Text></>}
              </Form.Group>
              <br />
              <Form.Group controlId="operation">
                <Form.Label>{t("maze-operation-type")}</Form.Label>
                <Form.Control name="operation" as="select" value={formData.operation} onChange={handleChange} aria-describedby="operationHelp operationError">
                  <option value="ADDITION">{t("operation-addition")}</option>
                  <option value="SUBTRACTION">{t("operation-subtraction")}</option>
                  <option value="BOTH_ADDITION_AND_SUBTRACTION">{t("operation-addition-subtraction")}</option>
                  <option value="MULTIPLICATION">{t("operation-multiplication")}</option>
                  <option value="DIVISION">{t("operation-division")}</option>
                  <option value="BOTH_MULTIPLICATION_AND_DIVISION">{t("operation-multiplication-division")}</option>
                </Form.Control>
                <Form.Text id="operationHelp" className="text-muted">
                  {t("maze-generate-operation-type-help")}
                </Form.Text>
                {operationError && <><br /><Form.Text className="text-danger">{t(operationError)}</Form.Text></>}
              </Form.Group>
              <br />
              <Form.Group controlId="range">
                <Form.Label>{t("maze-generate-range")}</Form.Label>
                <Form.Control name="range" as="select" value={`${formData.numbersRangeStart}-${formData.numbersRangeEnd}`} onChange={handleChange} aria-describedby="rangeHelp rangeError">
                  {isMultiplicationOrDivision(formData.operation) ? 
                      ["1-10", "1-20", "11-20"].map(range => <option key={range}>{range}</option>) :
                      ["1-10", "1-20", "1-100"].map(range => <option key={range}>{range}</option>)
                  }
                </Form.Control>
                <Form.Text id="rangeHelp" className="text-muted">
                  {t("maze-generate-range-help")}
                </Form.Text>
                {rangeError && <><br /><Form.Text className="text-danger">{t(rangeError)}</Form.Text></>}
              </Form.Group>
              <hr />
              <Button variant="link" onClick={handleShowPreviousMazesOptionsClick}>
                <span className={`mr-2 pr-2 arrow ${showPreviousMazesOptions ? "rotate" : ""}`}>
                  &#9654;
                </span>
                {t("maze-generate-previous-mazes-options")}
              </Button>
              {showPreviousMazesOptions && (
                <>
                  <p>{t("maze-generate-generated-from-help")}</p>
                  <SolutionIDForm onErrorChange={setSolution1Error} onStateChange={updateSolutionIDForm} index={1}/>
                  <br />
                  <SolutionIDForm onErrorChange={setSolution2Error} onStateChange={updateSolutionIDForm} index={2}/>
                  <br />
                  <SolutionIDForm onErrorChange={setSolution3Error} onStateChange={updateSolutionIDForm} index={3}/>
                </>
              )}
              <hr />
              <Button variant="link" onClick={handleShowAdvancedClick}>
                <span className={`mr-2 pr-2 arrow ${showAdvanced ? "rotate" : ""}`}>
                  &#9654;
                </span>
                {t("maze-generate-advanced-options")}
              </Button>
              {showAdvanced && (
                <>
                  <Form.Group>
                    <Form.Label>{t("maze-generate-path-type")}</Form.Label>
                    <Form.Check
                      type="radio"
                      id="evenNumbers"
                      name="numberType"
                      label={t("maze-generate-path-type-even")}
                      value="even"
                      checked={formData.numberType === "even"}
                      onChange={handleChange}
                      aria-describedby="numberTypeHelp numberTypeError"
                    />
                    <Form.Check
                      type="radio"
                      id="oddNumbers"
                      name="numberType"
                      label={t("maze-generate-path-type-odd")}
                      value="odd"
                      checked={formData.numberType === "odd"}
                      onChange={handleChange}
                      aria-describedby="numberTypeHelp numberTypeError"
                    />
                    <Form.Text id="numberTypeHelp" className="text-muted">
                      {t("maze-generate-path-type-help")}
                    </Form.Text>
                    {numberTypeError && <><br /><Form.Text className="text-danger">{t(numberTypeError)}</Form.Text></>}
                  </Form.Group>
                  <br />
                  <Form.Group controlId="minLength">
                    <Form.Label>{t("maze-generate-path-min-length")}</Form.Label>
                    <Form.Control name="minLength" type="number" value={formData.minLength} onChange={handleChange} aria-describedby="minLengthHelp minLengthError" />
                    <Form.Text id="minLengthHelp" className="text-muted">
                      {t("maze-generate-path-min-length-help")}
                    </Form.Text>
                    {minLengthError && <><br /><Form.Text className="text-danger">{t(minLengthError)}</Form.Text></>}
                  </Form.Group>
                  <br />
                  <Form.Group controlId="maxLength">
                    <Form.Label>{t("maze-generate-path-max-length")}</Form.Label>
                    <Form.Control name="maxLength" type="number" value={formData.maxLength} onChange={handleChange} aria-describedby="maxLengthHelp maxLengthError" />
                    <Form.Text id="maxLengthHelp" className="text-muted">
                      {t("maze-generate-path-max-length-help")}
                    </Form.Text>
                    {maxLengthError && <><br /><Form.Text className="text-danger">{t(maxLengthError)}</Form.Text></>}
                  </Form.Group>
                </>
              )}
            </Form>
          </div>
        </Col>
        <Col xs={12} md={8}>
          <div className="border p-3 m-2">
          {maze ? <MazeGrid data={maze} disabled={isRequestInProgress} save={saveMaze} saveError={saveError} setSaveError={setSaveError} /> : <Alert variant="info">{t("maze-generate-not-yet-generated-info")}</Alert>}
          </div>
        </Col>
      </Row>
      <MazeModal data={maze} visible={modalVisible} setVisible={setModalVisible} locations={locations} />
      <ScrollToTop smooth component={<ArrowUp />} className="yellow" />
    </>
  );
}
