import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Form, Button, Alert } from "react-bootstrap";
import { BACKEND_URL } from "../utils/constants";
import axios from "axios";

export default function ResetPassword() {
  const { t } = useTranslation();

  useEffect(() => { document.title = t("reset-password-title") + " | " + t("app-name"); });

  const [isRequestInProgress, setIsRequestInProgress] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [emailError, setEmailError] = useState("");

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  
    if (e.target.name === "email") {
      const emailRegex = /^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/;
      if (!emailRegex.test(e.target.value)) {
        setEmailError("email-error");
      } else {
        setEmailError("");
      }
    }
  };

  useEffect(() => {
    if (emailError || !formData.email) {
      setIsSubmitDisabled(true);
    } else {
      setIsSubmitDisabled(false);
    }
  }, [emailError, formData]);

  const handleResetPassword = (e) => {
    e.preventDefault();

    const data = {
      email: formData.email,
    };

    setIsRequestInProgress(true);

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
      setError("error-unknown");
    })
    .finally(() => {
      setIsRequestInProgress(false);
    });
  };

  return (
    <>
      <center>
        <h1>{t("reset-password-title")}</h1>
      </center>
      <p>
        {t("reset-password-text")}
      </p>
      {error && <Alert variant="danger">{t(error)}</Alert>}
      {success && <Alert variant="success">{t(success)}</Alert>}
      <Form onSubmit={handleResetPassword}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>{t("email")}</Form.Label>
          <Form.Control required type="email" placeholder={t("email-placeholder")} name="email" value={formData.email} onChange={handleChange} aria-describedby="emailHelp emailError" />
          {emailError && <Form.Text className="text-danger">{t(emailError)}</Form.Text>}
        </Form.Group>
        <Button className="mb-3" variant="primary" type="submit" disabled={isSubmitDisabled || isRequestInProgress}>
          {t("reset-password-submit")}
        </Button>
      </Form>
    </>
  );
}
