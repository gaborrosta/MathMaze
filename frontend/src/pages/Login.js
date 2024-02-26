import React, { useEffect, useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { Link } from "react-router-dom";
import { Form, Button, InputGroup } from "react-bootstrap";
import { BASE_URL } from "../utils/constants";
import axios from "axios";

export default function Login() {
  const { t } = useTranslation();

  useEffect(() => { document.title = t("login-title") + " | " + t("app-name"); });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

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
    else if (e.target.name === "password") {
      if (!e.target.value) {
        setPasswordError("login-password-error");
      } else {
        setPasswordError("");
      }
    }
  };

  useEffect(() => {
    if (emailError || passwordError || !formData.email || !formData.password) {
      setIsSubmitDisabled(true);
    } else {
      setIsSubmitDisabled(false);
    }
  }, [emailError, passwordError, formData]);

  const handleLogin = (e) => {
    e.preventDefault();

    const user = {
      email: formData.email,
      password: formData.password,
    };

    //CSRF token
    axios.get(`${BASE_URL}/csrf`)
      .then(csrfResponse => {
        //Send data
        axios.post(`${BASE_URL}/login`, user, {
          headers: {
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": csrfResponse.data
          }
        })
        .then(response => {
          console.log("Success:", response.data);
        })
        .catch(error => {
          console.error("Error:", error);
        });
      })
      .catch(error => {
        console.error("Error fetching CSRF token:", error);
      });
  };

  return (
    <>
      <center>
        <h1>{t("login-title")}</h1>
      </center>
      <Form onSubmit={handleLogin}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label htmlFor="email">{t("email")}</Form.Label>
          <Form.Control required type="email" placeholder={t("email-placeholder")} name="email" value={formData.email} onChange={handleChange} />
          {emailError && <Form.Text className="text-danger">{t(emailError)}</Form.Text>}
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label htmlFor="password">{t("password")}</Form.Label>
          <InputGroup>
            <Form.Control required type={showPassword ? "text" : "password"} placeholder={t("login-password-placeholder")} name="password" value={formData.password} onChange={handleChange} />
            <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>{showPassword ? t("password-hide") : t("password-show")}</Button>
          </InputGroup>
          {passwordError && <Form.Text className="text-danger">{t(passwordError)}</Form.Text>}
        </Form.Group>
        <Button className="mb-3" variant="primary" type="submit" disabled={isSubmitDisabled}>
          {t("login-title")}
        </Button>
      </Form>
      <p>
        <Trans i18nKey="login-forgot-password">Did you forgot your password? You can create a new one <Link to="/reset-password">here</Link>.</Trans>
        <br />
        {t("login-no-account")} <Link to="/signup">{t("login-create-account")}</Link>
        <br />
        <Trans i18nKey="login-privacy-terms-help-link">You can read our <Link to="/privacy-policy">Privacy Policy</Link>, our <Link to="/terms-and-conditions">Terms and Conditions</Link>, and <Link to="/help">more</Link>.</Trans>
      </p>
    </>
  );
}
