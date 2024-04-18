import React, { useEffect, useState, useContext } from "react";
import { useTranslation, Trans } from "react-i18next";
import { useNavigate, Link, useLocation } from "react-router-dom"
import { Form, Button, InputGroup, Alert } from "react-bootstrap";
import axios from "axios";
import { BACKEND_URL, EMAIL_REGEX, ANYTHING_REGEX } from "../utils/constants";
import TokenContext from "../utils/TokenContext";
import BaseForm from "../utils/BaseForm";

/**
 * Login renders the login page.
 *
 * @returns {React.Element} The Login component.
 */
export default function Login() {
  //Localisation
  const { t } = useTranslation();


  //Set the page title
  useEffect(() => { document.title = t("login-title") + " | " + t("app-name"); });


  //Initial data and validation schema
  const initialData = {
    email: "",
    password: "",
  };
  const validationSchema = {
    email: {
      required: true,
      regex: EMAIL_REGEX,
      regexError: "email-error",
    },
    password: {
      required: true,
      regex: ANYTHING_REGEX,
      regexError: "-",
    },
  };


  //Show password states
  const [showPassword, setShowPassword] = useState(false);


  //Token
  const { setToken } = useContext(TokenContext);

  //Navigation
  const navigate = useNavigate();
  const location = useLocation();
  const nextPage = location.search ? location.search.split("=")[1] : "";


  //Handle the login request
  const handleLogin = (formData, setError, setSuccess, setFormData, done) => {
    const data = {
      email: formData.email,
      password: formData.password,
    };

    //Send data
    axios.post(`${BACKEND_URL}/users/login`, data, {
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      setError("");
      setFormData({ email: "", password: "" });

      setToken(response.data);
      navigate(nextPage || "/account");
    })
    .catch(error => {
      setShowPassword(false);

      setSuccess("");
      setFormData({ ...formData, password: "" });

      if (!error.response) {
        setError("error-unknown");
        return;
      }

      if (error.response.data === "InvalidCredentialsException") {
        setError("error-invalid-credentials");
      } else {
        setError("error-unknown-form");
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
        {error && <Alert variant="danger">{t(error)}</Alert>}
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>{t("email")} <span className="text-danger">*</span></Form.Label>
          <Form.Control required type="email" placeholder={t("email-placeholder")} name="email" value={formData.email} onChange={handleChange} aria-describedby="emailHelp fieldErrors.email" />
          {fieldErrors.email && <Form.Text className="text-danger">{t(fieldErrors.email)}</Form.Text>}
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>{t("password")} <span className="text-danger">*</span></Form.Label>
          <InputGroup>
            <Form.Control required type={showPassword ? "text" : "password"} placeholder={t("login-password-placeholder")} name="password" value={formData.password} onChange={handleChange} aria-describedby="passwordHelp fieldErrors.password" />
            <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>{showPassword ? t("password-hide") : t("password-show")}</Button>
          </InputGroup>
          {fieldErrors.password && <Form.Text className="text-danger">{t(fieldErrors.password)}</Form.Text>}
        </Form.Group>
        {submitButton}
      </>
    );
  };


  //Render the page
  return (
    <>
      <center>
        <h1>{t("login-title")}</h1>
      </center>
      {nextPage && <Alert variant="warning">{t("must-be-logged-in")}</Alert>}
      <BaseForm
        onSubmit={handleLogin}
        initialData={initialData}
        validationSchema={validationSchema}
        form={form}
        buttonText="login-title"
      />
      <p>
        <Trans i18nKey="login-forgot-password">Did you forgot your password? You can create a new one <Link to="/reset-password">here</Link>.</Trans>
      </p>
      <p>
        {t("login-no-account")} <Link to="/signup">{t("login-create-account")}</Link>
      </p>
      <p>
        <Trans i18nKey="login-privacy-terms-help-link">You can read our <Link to="/privacy-policy">Privacy Policy</Link>, our <Link to="/terms-and-conditions">Terms and Conditions</Link>, and <Link to="/help">more</Link>.</Trans>
      </p>
    </>
  );
}
