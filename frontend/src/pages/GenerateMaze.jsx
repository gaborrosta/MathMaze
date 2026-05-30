import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Row, Col, Alert, Form, Button } from "react-bootstrap";
import axios from "axios";
import { BACKEND_URL, ANYTHING_REGEX, INTEGER_REGEX } from "../utils/constants";
import TokenContext from "../utils/TokenContext";
import BaseForm from "../utils/BaseForm";
import SolutionIDForm from "../components/SolutionIDForm";
import MazeGrid from "../components/MazeGrid";
import MazeModal from "../components/MazeModal";

/**
 * GenerateMaze renders the generator page.
 *
 * @returns {React.Element} The GenerateMaze component.
 */
export default function GenerateMaze() {
  //Localisation
  const { t } = useTranslation();


  //Set the page title
  useEffect(() => { document.title = t("maze-generate-title") + " | " + t("app-name"); });


  //Token
  const { token, setToken } = useContext(TokenContext);


  //Helpers for operation
  const isAdditionOrSubtraction = value => value === "ADDITION" || value === "SUBTRACTION" || value === "BOTH_ADDITION_AND_SUBTRACTION";
  const isMultiplicationOrDivision = value => value === "MULTIPLICATION" || value === "DIVISION" || value === "BOTH_MULTIPLICATION_AND_DIVISION";


  //Initial data, validation schema and customValidator
  const initialData = {
    width: 11,
    height: 11,
    operation: "ADDITION",
    range: "1-10",
    numberType: "even",
    minLength: "",
    maxLength: "",
  };
  const validationSchema = {
    width: {
      required: true,
      regex: ANYTHING_REGEX,
      regexError: "-",
    },
    height: {
      required: true,
      regex: ANYTHING_REGEX,
      regexError: "-",
    },
    operation: {
      required: true,
      regex: ANYTHING_REGEX,
      regexError: "-",
    },
    range: {
      required: true,
      regex: ANYTHING_REGEX,
      regexError: "-",
    },
    numberType: {
      required: true,
      regex: new RegExp(/^(even|odd)$/),
      regexError: "maze-number-type-error",
    },
    minLength: {
      required: false,
      regex: INTEGER_REGEX,
      regexError: "maze-generate-min-length-error-not-number",
    },
    maxLength: {
      required: false,
      regex: INTEGER_REGEX,
      regexError: "maze-generate-max-length-error-not-number",
    },
  };
  const customValidator = (formData) => {
    let results = {};

    if (formData.width < 11 || formData.width > 49 || formData.width % 2 === 0) {
      results.width = "maze-generate-width-error";
    } else {
      results.width = "";
    }

    if (formData.height < 11 || formData.height > 49 || formData.height % 2 === 0) {
      results.height = "maze-generate-height-error";
    } else {
      results.height = "";
    }

    if (!isAdditionOrSubtraction(formData.operation) && !isMultiplicationOrDivision(formData.operation)) {
      results.operation = "maze-operation-error";
    } else {
      results.operation = "";
    }

    const validRanges = isAdditionOrSubtraction(formData.operation) ? ["1-10", "1-20", "1-100"] : ["1-10", "1-20", "11-20"];
    if (!validRanges.includes(formData.range)) {
      results.range = "maze-range-error";
    } else {
      results.range = "";
    }

    if (formData.minLength && !isNaN(formData.minLength)){
      const number = Number(formData.minLength);
      const max = (formData.maxLength && !isNaN(formData.maxLength)) ? Number(formData.maxLength) : formData.width * formData.height;
      if (number < Math.min(formData.width, formData.height) || number > max) {
        results.minLength = "maze-min-length-error";
      } else {
        results.minLength = "";
      }
    }
    else {
      results.minLength = "";
    }

    if (formData.maxLength && !isNaN(formData.maxLength)){
      const number = Number(formData.maxLength);
      const min = (formData.minLength && !isNaN(formData.minLength)) ? Number(formData.minLength) : 0;
      if (number < min || number > formData.width * formData.height) {
        results.maxLength = "maze-max-length-error";
      } else {
        results.maxLength = "";
      }
    } else {
      results.maxLength = "";
    }

    return results;
  }


  //Extra form data (not handled by this form)
  const [extraFormData, setExtraFormData] = useState({
    discardedMazes: [],
    solution1: {},
    solution2: {},
    solution3: {},
  })

  //Errors for solutions
  const [solution1Error, setSolution1Error] = useState("");
  const [solution2Error, setSolution2Error] = useState("");
  const [solution3Error, setSolution3Error] = useState("");

  //Handles updates for solutions
  const updateSolutionIDForm = (index, data) => {
    let newExtraFormData = { ...extraFormData };
    newExtraFormData[`solution${index}`] = data;
    setExtraFormData(newExtraFormData);
  }


  //Generated maze
  const [maze, setMaze] = useState("");


  //Is a request in progress?
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);


  //Handle the generation request
  const handleGenerateMaze = (formData, setError, setSuccess, setFormData, done) => {
    //Discard the maze
    if (maze) {
      extraFormData.discardedMazes = [...extraFormData.discardedMazes, maze.id];
    }

    let data = {
      width: formData.width,
      height: formData.height,
      operation: formData.operation,
      numbersRangeStart: Number(formData.range.split("-")[0]),
      numbersRangeEnd: Number(formData.range.split("-")[1]),
      pathTypeEven: formData.numberType === "even",
      discardedMazes: extraFormData.discardedMazes,
      solution1: extraFormData.solution1,
      solution2: extraFormData.solution2,
      solution3: extraFormData.solution3,
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
        done();
        setIsRequestInProgress(false);
      }, 1000);
    });
  };


  //Advanced settings visible?
  const [showAdvanced, setShowAdvanced] = useState(false);

  //Change Advanced settings section's visibility
  const handleShowAdvancedClick = () => setShowAdvanced(!showAdvanced);

  //Previous mazes settings visible?
  const [showPreviousMazesOptions, setShowPreviousMazesOptions] = useState(false);

  //Change Previous mazes settings section's visibility
  const handleShowPreviousMazesOptionsClick = () => setShowPreviousMazesOptions(!showPreviousMazesOptions);


  //Create the form
  const form = (formData, handleChange, fieldErrors, error, success, submitButton) => {
    const handleOperationChange = (e) => {
      const value = e.target.value;

      if ((isAdditionOrSubtraction(formData.operation) && isMultiplicationOrDivision(value)) ||
          (isMultiplicationOrDivision(formData.operation) && isAdditionOrSubtraction(value))) {
        handleChange({ target: { name: "range", value: "1-10", more: [{ name: "operation", value: value }] } });
      } else {
        handleChange({ target: { name: "operation", value: value } });
      }
    };

    return (
      <>
        <Row>
          <Col xs={12} md={4}>
            <Form.Group controlId="width" className="mb-3">
              <Form.Label>{t("maze-width")} <span className="text-danger">*</span></Form.Label>
              <Form.Control name="width" as="select" value={formData.width} onChange={handleChange} aria-describedby="widthHelp fieldErrors.width">
                {[...Array(20).keys()].map(i => <option key={i}>{i * 2 + 11}</option>)}
              </Form.Control>
              <Form.Text id="widthHelp" className="text-muted">
                {t("maze-generate-width-help")}
              </Form.Text>
              {fieldErrors.width && <><br /><Form.Text className="text-danger">{t(fieldErrors.width)}</Form.Text></>}
            </Form.Group>
            <Form.Group controlId="height" className="mb-3">
              <Form.Label>{t("maze-height")} <span className="text-danger">*</span></Form.Label>
              <Form.Control name="height" as="select" value={formData.height} onChange={handleChange} aria-describedby="heightHelp fieldErrors.height">
                {[...Array(20).keys()].map(i => <option key={i}>{i * 2 + 11}</option>)}
              </Form.Control>
              <Form.Text id="heightHelp" className="text-muted">
                {t("maze-generate-height-help")}
              </Form.Text>
              {fieldErrors.height && <><br /><Form.Text className="text-danger">{t(fieldErrors.height)}</Form.Text></>}
            </Form.Group>
          </Col>
          <Col xs={12} md={4}>
            <Form.Group controlId="operation" className="mb-3">
              <Form.Label>{t("maze-operation-type")} <span className="text-danger">*</span></Form.Label>
              <Form.Control name="operation" as="select" value={formData.operation} onChange={handleOperationChange} aria-describedby="operationHelp fieldErrors.operation">
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
              {fieldErrors.operation && <><br /><Form.Text className="text-danger">{t(fieldErrors.operation)}</Form.Text></>}
            </Form.Group>
            <Form.Group controlId="range" className="mb-3">
              <Form.Label>{t("maze-generate-range")} <span className="text-danger">*</span></Form.Label>
              <Form.Control name="range" as="select" value={formData.range} onChange={handleChange} aria-describedby="rangeHelp fieldErrors.range">
                {isMultiplicationOrDivision(formData.operation) ?
                  ["1-10", "1-20", "11-20"].map(range => <option key={range}>{range}</option>)
                :
                  ["1-10", "1-20", "1-100"].map(range => <option key={range}>{range}</option>)
                }
              </Form.Control>
              <Form.Text id="rangeHelp" className="text-muted">
                {t("maze-generate-range-help")}
              </Form.Text>
              {fieldErrors.range && <><br /><Form.Text className="text-danger">{t(fieldErrors.range)}</Form.Text></>}
            </Form.Group>
          </Col>
          <Col xs={12} md={4} className="mb-3">
            {!token && <Alert variant="warning">{t("maze-generate-info-not-logged-in")}</Alert>}
            {error && <Alert variant="danger">{t(error)}</Alert>}
            {submitButton}
          </Col>
        </Row>
        <hr />
        <Row>
          <Col xs={12} md={6}>
            <Button variant="link" onClick={handleShowPreviousMazesOptionsClick} className="mb-3">
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
          </Col>
          <Col xs={12} className="until-md">
            <hr  />
          </Col>
          <Col xs={12} md={6}>
            <Button variant="link" onClick={handleShowAdvancedClick} className="mb-3">
              <span className={`mr-2 pr-2 arrow ${showAdvanced ? "rotate" : ""}`}>
                &#9654;
              </span>
              {t("maze-generate-advanced-options")}
            </Button>
            {showAdvanced && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>{t("maze-generate-path-type")} <span className="text-danger">*</span></Form.Label>
                  <Form.Check
                    type="radio"
                    id="evenNumbers"
                    name="numberType"
                    label={t("maze-generate-path-type-even")}
                    value="even"
                    checked={formData.numberType === "even"}
                    onChange={handleChange}
                    aria-describedby="numberTypeHelp fieldErrors.numberType"
                  />
                  <Form.Check
                    type="radio"
                    id="oddNumbers"
                    name="numberType"
                    label={t("maze-generate-path-type-odd")}
                    value="odd"
                    checked={formData.numberType === "odd"}
                    onChange={handleChange}
                    aria-describedby="numberTypeHelp fieldErrors.numberType"
                  />
                  <Form.Text id="numberTypeHelp" className="text-muted">
                    {t("maze-generate-path-type-help")}
                  </Form.Text>
                  {fieldErrors.numberType && <><br /><Form.Text className="text-danger">{t(fieldErrors.numberType)}</Form.Text></>}
                </Form.Group>
                <Form.Group controlId="minLength" className="mb-3">
                  <Form.Label>{t("maze-generate-path-min-length")}</Form.Label>
                  <Form.Control name="minLength" type="text" value={formData.minLength} onChange={handleChange} aria-describedby="minLengthHelp fieldErrors.minLength" />
                  <Form.Text id="minLengthHelp" className="text-muted">
                    {t("maze-generate-path-min-length-help")}
                  </Form.Text>
                  {fieldErrors.minLength && <><br /><Form.Text className="text-danger">{t(fieldErrors.minLength)}</Form.Text></>}
                </Form.Group>
                <Form.Group controlId="maxLength" className="mb-3">
                  <Form.Label>{t("maze-generate-path-max-length")}</Form.Label>
                  <Form.Control name="maxLength" type="text" value={formData.maxLength} onChange={handleChange} aria-describedby="maxLengthHelp fieldErrors.maxLength" />
                  <Form.Text id="maxLengthHelp" className="text-muted">
                    {t("maze-generate-path-max-length-help")}
                  </Form.Text>
                  {fieldErrors.maxLength && <><br /><Form.Text className="text-danger">{t(fieldErrors.maxLength)}</Form.Text></>}
                </Form.Group>
              </>
            )}
          </Col>
        </Row>
      </>
    );
  };


  //Save error
  const [saveError, setSaveError] = useState("");

  //Locations for editing the maze
  const [locations, setLocations] = useState(null);

  //Is the modal visible?
  const [modalVisible, setModalVisible] = useState(false);

  //Save maze
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


  //Render the page
  return (
    <>
      <center>
        <h1>{t("maze-generate-title")}</h1>
      </center>
      <p>{t("maze-generate-info")}</p>
      <Row className="m-2">
        <div className="border p-3">
          <BaseForm
            onSubmit={handleGenerateMaze}
            initialData={initialData}
            validationSchema={validationSchema}
            form={form}
            buttonText={maze ? t("maze-generate-path-regenerate") : t("maze-generate-path-generate")}
            customValidator={customValidator}
            extraCheckForSubmitButton={(_) => solution1Error || solution2Error || solution3Error || isRequestInProgress}
          />
        </div>
      </Row>
      <Row className="m-2">
        <div className="border p-3">
          {maze ?
            <MazeGrid data={maze} disabled={isRequestInProgress} save={saveMaze} saveError={saveError} setSaveError={setSaveError} />
          :
            <Alert variant="info">{t("maze-generate-not-yet-generated-info")}</Alert>
          }
        </div>
      </Row>
      <MazeModal data={maze} visible={modalVisible} setVisible={setModalVisible} locations={locations} />
    </>
  );
}
