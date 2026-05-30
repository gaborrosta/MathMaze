import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Form, Row } from "react-bootstrap";
import { NICKNAME_REGEX, INTEGER_REGEX, EMPTY_STRING_REGEX } from "../utils/constants";
import StatelessForm from "../utils/StatelessForm";

/**
 * SolutionIDForm renders part of a form with an input for a solution.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {number} index - The index of the form in the parent component.
 * @param {Function} onStateChange - The function to call when the state changes. It receives the index and the new state as parameters.
 * @param {Function} onErrorChange - The function to call when there is an error. It receives a boolean as a parameter.
 *
 * @returns {React.Element} The SolutionIDForm component.
 */
export default function SolutionIDForm({ index, onStateChange, onErrorChange }) {
  //Check the parameters
  checkParameters(index, onStateChange, onErrorChange)


  //Localisation
  const { t } = useTranslation();


  //Initial data, validation schema and fieldErrors
  const [formData, setFormData] = useState({
    solutionId: "",
  });
  const validationSchemaForSolutionId = {
    solutionId: {
      required: false,
      regex: new RegExp(INTEGER_REGEX.source + "|" + EMPTY_STRING_REGEX.source),
      regexError: "maze-generate-solution-id-invalid",
    },
  };
  const validationSchemaForMazeId = {
    mazeId: {
      required: false,
      regex: new RegExp(INTEGER_REGEX.source + "|" + EMPTY_STRING_REGEX.source),
      regexError: "maze-generate-maze-id-invalid",
    },
    nickname: {
      required: false,
      regex: new RegExp(NICKNAME_REGEX.source + "|" + EMPTY_STRING_REGEX.source),
      regexError: "maze-generate-nickname-invalid",
    },
  }
  const [schema, setSchema] = useState(validationSchemaForSolutionId);
  const [fieldErrors, setFieldErrors] = useState({});
  const customValidator = (formData) => {
    if (formData.hasOwnProperty("mazeId") && formData.hasOwnProperty("nickname")){
      if (formData.mazeId !== "" && formData.nickname === "") {
        return { nickname: "field-required2" };
      }

      if (formData.mazeId === "" && formData.nickname !== "") {
        return { mazeId: "field-required2" };
      }

      if (formData.mazeId === "" && formData.nickname === "") {
        return { mazeId: "", nickname: "" };
      }
    }

    return {};
  }


  //Actual option
  const [selectedOption, setSelectedOption] = useState("solutionId");

  //Handle select changes
  const handleSelectChange = (event) => {
    const value = event.target.value;
    setSelectedOption(value);

    if (value === "solutionId") {
      let newFormData = { solutionId: "" };
      setFormData(newFormData);
      onStateChange(index, newFormData);
      setSchema(validationSchemaForSolutionId);
    } else {
      let newFormData = { mazeId: "", nickname: "" };
      setFormData(newFormData);
      onStateChange(index, newFormData);
      setSchema(validationSchemaForMazeId);
    }

    setFieldErrors({});
    onErrorChange(false);
  };


  //Handle form data changes
  const handleDataChange = (newFormData) => {
    setFormData(newFormData);
    onStateChange(index, newFormData);
  }


  //Create the form
  const form = (formData, handleChange, fieldErrors) => {
    return (
      <Row className="pb-1 border">
        <Form.Group controlId="selectOption">
          <Form.Label>{t("maze-generate-select-option")}</Form.Label>
          <Form.Control as="select" value={selectedOption} onChange={handleSelectChange} aria-describedby="selectOptionHelp">
            <option value="solutionId">{t("maze-generate-select-option-solution-id")}</option>
            <option value="mazeId">{t("maze-generate-select-option-maze-id-nickname")}</option>
          </Form.Control>
          <Form.Text id="selectOptionHelp" className="text-muted">
            {t("maze-generate-select-option-help")}
          </Form.Text>
        </Form.Group>

        {selectedOption === "solutionId" &&
          <Form.Group controlId="solutionId">
            <Form.Label>{t("maze-generate-solution-id")}</Form.Label>
            <Form.Control name="solutionId" type="text" value={formData.solutionId} onChange={handleChange} aria-describedby="solutionIdHelp fieldErrors.solutionId" />
            <Form.Text id="solutionIdHelp" className="text-muted">
              {t("maze-generate-solution-id-help")}
            </Form.Text>
            {fieldErrors.solutionId && <><br /><Form.Text className="text-danger">{t(fieldErrors.solutionId)}</Form.Text></>}
          </Form.Group>
        }

        {selectedOption === "mazeId" && <>
          <Form.Group controlId="mazeId">
            <Form.Label>{t("maze-generate-maze-id")}</Form.Label>
            <Form.Control name="mazeId" type="text" value={formData.mazeId} onChange={handleChange} aria-describedby="mazeIdHelp fieldErrors.mazeId" />
            <Form.Text id="mazeIdHelp" className="text-muted">
              {t("maze-generate-maze-id-help")}
            </Form.Text>
            {fieldErrors.mazeId && <><br /><Form.Text className="text-danger">{t(fieldErrors.mazeId)}</Form.Text></>}
          </Form.Group>
          <Form.Group controlId="nickname">
            <Form.Label>{t("maze-generate-nickname")}</Form.Label>
            <Form.Control name="nickname" type="text" value={formData.nickname} onChange={handleChange} aria-describedby="nicknameHelp fieldErrors.nickname" />
            <Form.Text id="nicknameHelp" className="text-muted">
              {t("maze-generate-nickname-help")}
            </Form.Text>
            {fieldErrors.nickname && <><br /><Form.Text className="text-danger">{t(fieldErrors.nickname)}</Form.Text></>}
          </Form.Group>
        </>}
      </Row>
    );
  };


  //Render the component
  return (
    <StatelessForm
      formData={formData}
      validationSchema={schema}
      fieldErrors={fieldErrors}
      setFieldErrors={setFieldErrors}
      setIsThereAnyError={onErrorChange}
      onStateChanged={handleDataChange}
      form={form}
      customValidator={customValidator}
    />
  );
}


/**
 * Checks the parameters passed to the SolutionIDForm component.
 */
function checkParameters(index, onStateChange, onErrorChange) {
  if (index === undefined) {
    throw new Error("index is required.")
  }
  if (typeof index !== "number") {
    throw new Error("index must be a number.")
  }

  if (onStateChange === undefined) {
    throw new Error("onStateChange is required.")
  }
  if (typeof onStateChange !== "function") {
    throw new Error("onStateChange must be a function.")
  }
  if (onStateChange.length !== 2) {
    throw new Error("onStateChange must have 2 parameters.")
  }

  if (onErrorChange === undefined) {
    throw new Error("onErrorChange is required.")
  }
  if (typeof onErrorChange !== "function") {
    throw new Error("onErrorChange must be a function.")
  }
  if (onErrorChange.length !== 1) {
    throw new Error("onErrorChange must have 1 parameter.")
  }
}
