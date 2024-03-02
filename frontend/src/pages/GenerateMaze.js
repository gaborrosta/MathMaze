import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Row, Col, Alert, Form, Button } from "react-bootstrap";
import MazeGrid from "../components/MazeGrid";
import { BASE_URL } from "../utils/constants";
import axios from "axios";

export default function GenerateMaze() {
  const { t } = useTranslation();

  useEffect(() => { document.title = t("maze-generate-title") + " | " + t("app-name"); });

  const [isRequestInProgress, setIsRequestInProgress] = useState(false);

  const isAdditionOrSubtraction = value => value === "ADDITION" || value === "SUBTRACTION" || value === "BOTH_ADDITION_AND_SUBTRACTION";
  const isMultiplicationOrDivision = value => value === "MULTIPLICATION" || value === "DIVISION" || value === "BOTH_MULTIPLICATION_AND_DIVISION";

  const [maze, setMaze] = useState("");

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleShowAdvancedClick = () => {
    setShowAdvanced(!showAdvanced);
  };

  const [formData, setFormData] = useState({
    operation: "ADDITION",
    numbersRangeStart: 1,
    numbersRangeEnd: 10,
    minLength: undefined,
    maxLength: undefined,
    width: 11,
    height: 11,
    numberType: "even",
  });

  const [error, setError] = useState("");

  const [widthError, setWidthError] = useState("");
  const [heightError, setHeightError] = useState("");
  const [operationError, setOperationError] = useState("");
  const [rangeError, setRangeError] = useState("");
  const [numberTypeError, setNumberTypeError] = useState("");
  const [minLengthError, setMinLengthError] = useState("");
  const [maxLengthError, setMaxLengthError] = useState("");

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const handleChange = (event) => {
    var name = event.target.name;
    var value = event.target.value;

    if (name === "range") {
      value = value.split("-").map(Number);
      setFormData({
        ...formData,
        numbersRangeStart: value[0],
        numbersRangeEnd: value[1],
      });

      // Check if the value meets the conditions based on the operation
      const validRanges = isAdditionOrSubtraction(formData.operation) ? ["1-10", "1-20", "1-100"] : ["1-10", "1-20", "11-20"];
      if (!validRanges.includes(event.target.value)) {
        setRangeError("maze-range-error");
      } else {
        setRangeError("");
      }
    } else if (name === "minLength" || name === "maxLength") {
      value = Number(value);
      setFormData({
        ...formData,
        [name]: value,
      });

      // Check if the value meets the conditions
      if (name === "minLength") {
        if (value < Math.min(formData.width, formData.height) || value > formData.maxLength) {
          setMinLengthError("maze-min-length-error");
        } else {
          setMinLengthError("");
        }
      } else if (name === "maxLength") {
        if (value < formData.minLength || value > formData.width * formData.height) {
          setMaxLengthError("maze-max-length-error");
        } else {
          setMaxLengthError("");
        }
      }
    } else if (name === "operation") {
      var oldValue = formData.operation;

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

      // Check if the value is one of the specified values
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

      // Check if the value is between 11 and 49 and odd
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

      // Check if the value is between 11 and 49 and odd
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

      // Check if the value is "even" or "odd"
      if (value !== "even" && value !== "odd") {
        setNumberTypeError("maze-number-type-error");
      } else {
        setNumberTypeError("");
      }
    }
  };

  useEffect(() => {
    if (widthError || heightError || operationError || rangeError || numberTypeError || minLengthError || maxLengthError) {
      setIsSubmitDisabled(true);
    } else {
      setIsSubmitDisabled(false);
    }
  }, [widthError, heightError, operationError, rangeError, numberTypeError, minLengthError, maxLengthError, formData]);

  const handleGenerateMaze = (e) => {
    e.preventDefault();

    const data = {
      width: formData.width,
      height: formData.height,
      operation: formData.operation,
      numbersRangeStart: formData.numbersRangeStart,
      numbersRangeEnd: formData.numbersRangeEnd,
      minLength: formData.minLength,
      maxLength: formData.maxLength,
      numberType: formData.numberType,
    };

    setIsRequestInProgress(true);

    //Send data
    axios.post(`${BASE_URL}/maze/generate`, data, {
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      setError("");
      setMaze(response.data);
      //TODO ~ Add extra form so the maze can be saved...
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
        default:
          setError("error-unknown");
      }
    })
    .finally(() => {
      setIsRequestInProgress(false);
    });
  };

  return (
    <>
      <center>
        <h1>{t("maze-generate-title")}</h1>
      </center>
      <p>{t("maze-generate-info")}</p>
      <Row>
        <Col xs={12} md={4}>
          <div className="border p-3 m-2">
            <Alert variant="warning">{t("maze-generate-info-not-logged-in")}</Alert>
            {error && <Alert variant="danger">{t(error)}</Alert>}
            <Form onSubmit={handleGenerateMaze}>
              <Form.Group controlId="width">
                <Form.Label>{t("maze-width")}</Form.Label>
                <Form.Control name="width" as="select" value={formData.width} onChange={handleChange}>
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
                <Form.Control name="height" as="select" value={formData.height} onChange={handleChange}>
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
                <Form.Control name="operation" as="select" value={formData.operation} onChange={handleChange}>
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
                <Form.Control name="range" as="select" value={`${formData.numbersRangeStart}-${formData.numbersRangeEnd}`} onChange={handleChange}>
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
              <br />
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
                    />
                    <Form.Check 
                      type="radio" 
                      id="oddNumbers" 
                      name="numberType" 
                      label={t("maze-generate-path-type-odd")}
                      value="odd"
                      checked={formData.numberType === "odd"} 
                      onChange={handleChange} 
                    />
                    <Form.Text id="numberTypeHelp" className="text-muted">
                      {t("maze-generate-path-type-help")}
                    </Form.Text>
                    {numberTypeError && <><br /><Form.Text className="text-danger">{t(numberTypeError)}</Form.Text></>}
                  </Form.Group>
                  <br />
                  <Form.Group controlId="minLength">
                    <Form.Label>{t("maze-generate-path-min-length")}</Form.Label>
                    <Form.Control name="minLength" type="number" value={formData.minLength} onChange={handleChange} />
                    <Form.Text id="minLengthHelp" className="text-muted">
                      {t("maze-generate-path-min-length-help")}
                    </Form.Text>
                    {minLengthError && <><br /><Form.Text className="text-danger">{t(minLengthError)}</Form.Text></>}
                  </Form.Group>
                  <br />
                  <Form.Group controlId="maxLength">
                    <Form.Label>{t("maze-generate-path-max-length")}</Form.Label>
                    <Form.Control name="maxLength" type="number" value={formData.maxLength} onChange={handleChange} />
                    <Form.Text id="maxLengthHelp" className="text-muted">
                      {t("maze-generate-path-max-length-help")}
                    </Form.Text>
                    {maxLengthError && <><br /><Form.Text className="text-danger">{t(maxLengthError)}</Form.Text></>}
                  </Form.Group>
                  <br />
                </>
              )}
              <hr />
              <br />
              <Button className="mb-3" variant="primary" type="submit" disabled={isSubmitDisabled || isRequestInProgress}>
                {maze ? t("maze-generate-path-regenerate") : t("maze-generate-path-generate")}
              </Button>
            </Form>
          </div>
        </Col>
        <Col xs={12} md={8}>
          <div className="border p-3 m-2">
          {maze ? <MazeGrid data={maze} /> : <Alert variant="info">{t("maze-generate-not-yet-generated-info")}</Alert>}
          </div>
        </Col>
      </Row>
    </>
  );
}
