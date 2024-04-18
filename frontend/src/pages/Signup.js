import React, { useEffect, useState, useContext } from "react";
import { useTranslation, Trans } from "react-i18next";
import { useNavigate, Link } from "react-router-dom"
import { Form, Button, InputGroup, Alert } from "react-bootstrap";
import axios from "axios";
import { BACKEND_URL, EMAIL_REGEX, PASSWORD_REGEX, USERNAME_REGEX } from "../utils/constants";
import TokenContext from "../utils/TokenContext";
import BaseForm from "../utils/BaseForm";

/**
 * Signup renders the signup page.
 *
 * @returns {React.Element} The Signup component.
 */
export default function Signup() {
  //Localisation
  const { t } = useTranslation();


  //Set the page title
  useEffect(() => { document.title = t("signup-title") + " | " + t("app-name"); });


  //Initial data and validation schema
  const initialData = {
    username: "",
    email: "",
    password: "",
  };
  const validationSchema = {
    username: {
      required: true,
      regex: USERNAME_REGEX,
      regexError: "signup-username-error",
    },
    email: {
      required: true,
      regex: EMAIL_REGEX,
      regexError: "signup-email-error",
    },
    password: {
      required: true,
      regex: PASSWORD_REGEX,
      regexError: "signup-password-error",
    },
  };


  //Show password state
  const [showPassword, setShowPassword] = useState(false);


  //Token
  const { setToken } = useContext(TokenContext);

  //Navigation
  const navigate = useNavigate();


  //Handle the signup request
  const handleSignup = (formData, setError, setSuccess, setFormData, done) => {
    const data = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    };

    //Send data
    axios.post(`${BACKEND_URL}/users/register`, data, {
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      setError("");
      setSuccess("success-signup");
      setFormData({ username: "", email: "", password: "" });

      setToken(response.data);
      setTimeout(() => {
        navigate("/account");
      }, 5000);
    })
    .catch(error => {
      setShowPassword(false);

      setSuccess("");
      setFormData({ ...formData, password: ""});

      if (!error.response) {
        setError("error-unknown");
        return;
      }

      switch (error.response.data) {
        case "UsernameInvalidFormatException":
          setError("error-username-invalid-format");
          break;
        case "EmailInvalidFormatException":
          setError("error-email-invalid-format");
          break;
        case "PasswordInvalidFormatException":
          setError("error-password-invalid-format");
          break;
        case "UsernameNotUniqueException":
          setError("error-username-not-unique");
          break;
        case "EmailNotUniqueException":
          setError("error-email-not-unique");
          break;
        default:
          setError("error-unknown-form");
          break;
      }
    })
    .finally(() => {
      done();
    });
  };


  //Create the form
  const form = (formData, handleChange, fieldErrors, error, success, submitButton) => {
    return (
      <>
        {success ? <Alert variant="success">{t(success)}</Alert> : <>
          {error && <Alert variant="danger">{t(error)}</Alert>}
          <Form.Group className="mb-3" controlId="username">
            <Form.Label>{t("signup-username")} <span className="text-danger">*</span></Form.Label>
            <Form.Control required type="text" placeholder={t("signup-username-placeholder")} name="username" value={formData.username} onChange={handleChange} aria-describedby="usernameHelp fieldErrors.username" />
            <Form.Text id="usernameHelp" className="text-muted">
              {t("signup-username-help")}
            </Form.Text>
            {fieldErrors.username && <><br /><Form.Text className="text-danger">{t(fieldErrors.username)}</Form.Text></>}
          </Form.Group>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>{t("email")} <span className="text-danger">*</span></Form.Label>
            <Form.Control required type="email" placeholder={t("email-placeholder")} name="email" value={formData.email} onChange={handleChange} aria-describedby="emailHelp fieldErrors.email" />
            <Form.Text id="emailHelp" className="text-muted">
              {t("signup-email-help")}
            </Form.Text>
            {fieldErrors.email && <><br /><Form.Text className="text-danger">{t(fieldErrors.email)}</Form.Text></>}
          </Form.Group>
          <Form.Group className="mb-3" controlId="password">
            <Form.Label>{t("password")} <span className="text-danger">*</span></Form.Label>
            <InputGroup>
              <Form.Control required type={showPassword ? "text" : "password"} placeholder={t("signup-password-placeholder")} name="password" value={formData.password} onChange={handleChange} aria-describedby="passwordHelp fieldErrors.password" />
              <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>{showPassword ? t("password-hide") : t("password-show")}</Button>
            </InputGroup>
            <Form.Text id="passwordHelp" className="text-muted">
              {t("signup-password-help")}
            </Form.Text>
            {fieldErrors.password && <><br /><Form.Text className="text-danger">{t(fieldErrors.password)}</Form.Text></>}
          </Form.Group>
          <p>
            <Trans i18nKey="signup-privacy-terms-statement">By signing up, I state that I have read and accept the <Link to="/privacy-policy">Privacy Policy</Link> and the <Link to="/terms-and-conditions">Terms and Conditions</Link>.</Trans>
          </p>
          {submitButton}
        </>}
      </>
    );
  };


  //Render the page
  return (
    <>
      <center>
        <h1>{t("signup-title")}</h1>
      </center>
      <BaseForm
        onSubmit={handleSignup}
        initialData={initialData}
        validationSchema={validationSchema}
        form={form}
        buttonText="signup-title"
      />
    </>
  );
}
