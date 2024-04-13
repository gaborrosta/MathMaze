import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { NICKNAME_REGEX } from "../utils/constants";
import StatelessForm from "../utils/StatelessForm";

/**
 * NicknameForm renders part of a form with an input for the user to enter their nickname.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.initialNickname - The initial value for the nickname input.
 * @param {boolean} props.isSubmitDisabled - A boolean indicating whether the submit button should be disabled.
 * @param {Function} props.setIsSubmitDisabled - A function to set the isSubmitDisabled state.
 * @param {Function} props.handleSubmit - The function to call when the form is submitted. It receives the nickname as a parameter.
 *
 * @returns {React.Element} The NicknameForm component.
 */
export default function NicknameForm({ initialNickname, isSubmitDisabled, setIsSubmitDisabled, handleSubmit }) {
  //Check the parameters
  checkParameters(initialNickname, isSubmitDisabled, setIsSubmitDisabled, handleSubmit);


  //Localisation
  const { t } = useTranslation();


  //Initial data, validation schema and fieldErrors
  const [nicknameData, setNicknameData] = useState({ nickname: initialNickname || "" });
  const validationSchema = {
    nickname: {
      required: true,
      regex: NICKNAME_REGEX,
      regexError: "error-invalid-nickname",
    },
  };
  const [fieldErrors, setFieldErrors] = useState({});


  //Create the form
  const form = (formData, handleChange, fieldErrors) => {
    return (
      <Form.Group controlId="nickname">
        <Form.Label>{t("maze-check-recognised-nickname")} <span className="text-danger">*</span></Form.Label>
        <Form.Control name="nickname" type="text" value={formData.nickname} onChange={handleChange} aria-describedby="nicknameHelp fieldErrors.nickname" />
        <Form.Text id="nicknameHelp" className="text-muted">
          {t("maze-check-recognised-nickname-help")}
        </Form.Text>
        {fieldErrors.nickname && <><br /><Form.Text className="text-danger">{t(fieldErrors.nickname)}</Form.Text></>}
      </Form.Group>
    );
  };


  //Render the component
  return (
    <>
      <StatelessForm
        formData={nicknameData}
        validationSchema={validationSchema}
        fieldErrors={fieldErrors}
        setFieldErrors={setFieldErrors}
        setIsThereAnyError={setIsSubmitDisabled}
        onStateChanged={setNicknameData}
        form={form}
      />
      <br />
      <Button className="mb-3" variant="primary" disabled={isSubmitDisabled} onClick={() => handleSubmit(nicknameData.nickname)}>
        {t("maze-check-recognised-check")}
      </Button>
    </>
  );
}


/**
 * Checks the parameters passed to the NicknameForm component.
 */
function checkParameters(initialNickname, isSubmitDisabled, setIsSubmitDisabled, handleSubmit) {
  if (initialNickname === undefined) {
    throw new Error("initialNickname is required.");
  }
  if (typeof initialNickname !== "string") {
    throw new Error("initialNickname must be a string.");
  }

  if (isSubmitDisabled === undefined) {
    throw new Error("isSubmitDisabled is required.");
  }
  if (typeof isSubmitDisabled !== "boolean") {
    throw new Error("isSubmitDisabled must be a boolean.");
  }

  if (setIsSubmitDisabled === undefined) {
    throw new Error("setIsSubmitDisabled is required.");
  }
  if (typeof setIsSubmitDisabled !== "function") {
    throw new Error("setIsSubmitDisabled must be a function.");
  }
  if (setIsSubmitDisabled.length !== 1) {
    throw new Error("setIsSubmitDisabled must have 1 parameter.");
  }

  if (handleSubmit === undefined) {
    throw new Error("handleSubmit is required.");
  }
  if (typeof handleSubmit !== "function") {
    throw new Error("handleSubmit must be a function.");
  }
  if (handleSubmit.length !== 1) {
    throw new Error("handleSubmit must have 1 parameter.");
  }
}
