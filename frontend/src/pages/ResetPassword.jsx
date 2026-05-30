import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Form, Alert } from "react-bootstrap";
import axios from "axios";
import { BACKEND_URL, EMAIL_REGEX } from "../utils/constants";
import BaseForm from "../utils/BaseForm";

/**
 * ResetPassword renders the reset password page.
 *
 * @returns {React.Element} The ResetPassword component.
 */
export default function ResetPassword() {
  //Localisation
  const { t } = useTranslation();


  //Set the page title
  useEffect(() => { document.title = t("reset-password-title") + " | " + t("app-name"); });


  //Initial data and validation schema
  const initialData = { email: "" };
  const validationSchema = {
    email: {
      required: true,
      regex: EMAIL_REGEX,
      regexError: "email-error",
    }
  };


  //Handle the reset password request
  const handleResetPassword = (formData, setError, setSuccess, setFormData, done) => {
    const data = {
      email: formData.email,
    };

    //Send data
    axios.post(`${BACKEND_URL}/users/password-request`, data, {
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(_ => {
      setError("");
      setSuccess("success-password-reset");
      setFormData({ email: "" });
    })
    .catch(_ => {
      setSuccess("");
      setError("error-unknown");
    })
    .finally(() => {
      done();
    });
  };


  //Create the form
  const form = (formData, handleChange, fieldErrors, error, success, submitButton) => {
    return (
      <>
        {error && <Alert variant="danger">{t(error)}</Alert>}
        {success && <Alert variant="success">{t(success)}</Alert>}
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>{t("email")} <span className="text-danger">*</span></Form.Label>
          <Form.Control required type="email" placeholder={t("email-placeholder")} name="email" value={formData.email} onChange={handleChange} aria-describedby="emailHelp fieldErrors.email" />
          {fieldErrors.email && <Form.Text className="text-danger">{t(fieldErrors.email)}</Form.Text>}
        </Form.Group>
        {submitButton}
      </>
    );
  }


  //Render the page
  return (
    <>
      <center>
        <h1>{t("reset-password-title")}</h1>
      </center>
      <p>
        {t("reset-password-text")}
      </p>
      <BaseForm
        onSubmit={handleResetPassword}
        initialData={initialData}
        validationSchema={validationSchema}
        form={form}
        buttonText="reset-password-submit"
      />
    </>
  );
}
