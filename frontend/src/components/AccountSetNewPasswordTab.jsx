import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Col, Form, Button, InputGroup, Alert } from "react-bootstrap";
import axios from "axios";
import { BACKEND_URL, PASSWORD_REGEX } from "../utils/constants";
import TokenContext from "../utils/TokenContext";
import BaseForm from "../utils/BaseForm";

/**
 * AccountSetNewPasswordTab displays the form to change password.
 *
 * @returns {React.Element} The AccountSetNewPasswordTab component.
 */
export default function AccountSetNewPasswordTab() {
  //Localisation
  const { t } = useTranslation();


  //Token
  const { token, setToken } = useContext(TokenContext);


  //Initial data and validation schema
  const initialData = {
    oldPassword: "",
    newPassword: "",
  };
  const validationSchema = {
    oldPassword: {
      required: true,
      regex: PASSWORD_REGEX,
      regexError: "account-old-password-error",
    },
    newPassword: {
      required: true,
      regex: PASSWORD_REGEX,
      regexError: "signup-password-error",
    },
  };


  //Show passwords states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);


  //Handle the set new password request
  const handleSetNewPassword = (formData, setError, setSuccess, setFormData, done) => {
    const data = {
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword,
      token: token,
    };

    //Send data
    axios.post(`${BACKEND_URL}/users/account-password-reset`, data, {
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      setError("");
      setSuccess("account-success-set-new-password");
      setFormData({ oldPassword: "", newPassword: "" });

      setToken(response.data);
    })
    .catch(error => {
      setSuccess("");
      setFormData({ oldPassword: "", newPassword: "" });

      if (!error.response) {
        setError("error-unknown");
        return;
      }

      switch (error.response.data) {
        case "UserNotFoundException":
          setError("session-expired-log-in");
          break;
        case "InvalidCredentialsException":
          setError("error-old-password-invalid");
          break;
        case "PasswordInvalidFormatException":
          setError("error-password-invalid-format");
          break;
        default:
          setError("error-unknown-form");
          break;
      }
    })
    .finally(() => {
      done();
    });
  }


  //Create the form
  const form = (formData, handleChange, fieldErrors, error, success, submitButton) => {
    return (
      <>
        {error && <Alert variant="danger">{t(error)}</Alert>}
        {success && <Alert variant="success">{t(success)}</Alert>}
        <Form.Group className="mb-3" controlId="oldPassword">
          <Form.Label>{t("account-old-password")} <span className="text-danger">*</span></Form.Label>
          <InputGroup>
            <Form.Control required type={showOldPassword ? "text" : "password"} placeholder={t("account-old-password-placeholder")} name="oldPassword" value={formData.oldPassword} onChange={handleChange} aria-describedby="fieldErrors.oldPassword" />
            <Button variant="outline-secondary" onClick={() => setShowOldPassword(!showOldPassword)}>{showOldPassword ? t("password-hide") : t("password-show")}</Button>
          </InputGroup>
          {fieldErrors.oldPassword && <Form.Text className="text-danger">{t(fieldErrors.oldPassword)}</Form.Text>}
        </Form.Group>
        <Form.Group className="mb-3" controlId="newPassword">
          <Form.Label>{t("account-new-password")} <span className="text-danger">*</span></Form.Label>
          <InputGroup>
            <Form.Control required type={showNewPassword ? "text" : "password"} placeholder={t("account-new-password-placeholder")} name="newPassword" value={formData.newPassword} onChange={handleChange} aria-describedby="newPasswordHelp fieldErrors.oldPassword" />
            <Button variant="outline-secondary" onClick={() => setShowNewPassword(!showNewPassword)}>{showNewPassword ? t("password-hide") : t("password-show")}</Button>
          </InputGroup>
          <Form.Text id="newPasswordHelp" className="text-muted">
            {t("signup-password-help")}
          </Form.Text>
          {fieldErrors.newPassword && <><br /><Form.Text className="text-danger">{t(fieldErrors.newPassword)}</Form.Text></>}
        </Form.Group>
        {submitButton}
      </>
    );
  };


  //Render the component
  return (
    <Col>
      <p>{t("account-password-change")}</p>
      <BaseForm
        onSubmit={handleSetNewPassword}
        initialData={initialData}
        validationSchema={validationSchema}
        form={form}
        buttonText="set-new-password-title"
      />
    </Col>
  );
}
