import React, { useEffect, useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { Link } from "react-router-dom";
import { Form, Button, InputGroup } from "react-bootstrap";

export default function Signup() {
  const { t } = useTranslation();

  useEffect(() => { document.title = t("signup-title") + " | " + t("app-name"); });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });

  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  
    if (e.target.name === "username") {
      const usernameRegex = /^[a-zA-Z0-9]{5,20}$/;
      if (e.target.value && !usernameRegex.test(e.target.value)) {
        setUsernameError("signup-username-error");
      } else {
        setUsernameError("");
      }
    }
    else if (e.target.name === "email") {
      const emailRegex = /^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/;
      if (e.target.value && !emailRegex.test(e.target.value)) {
        setEmailError("signup-email-error");
      } else {
        setEmailError("");
      }
    }
    else if (e.target.name === "password") {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
      if (e.target.value && (!passwordRegex.test(e.target.value))) {
        setPasswordError("signup-password-error");
      } else {
        setPasswordError("");
      }
    }
    else if (e.target.name === "confirmPassword") {
      if (e.target.value !== formData.password) {
        setConfirmPasswordError("signup-confirm-password-error");
      } else {
        setConfirmPasswordError("");
      }
    }
  };

  useEffect(() => {
    if (usernameError || emailError || passwordError || confirmPasswordError ||
        !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setIsSubmitDisabled(true);
    } else {
      setIsSubmitDisabled(false);
    }
  }, [usernameError, emailError, passwordError, confirmPasswordError, formData]);

  const handleSignup = (e) => {
    e.preventDefault();
    console.log(formData);
    //TODO...
  };

  return (
    <>
      <center>
        <h1>{t("signup-title")}</h1>
      </center>
      <Form onSubmit={handleSignup}>
        <Form.Group className="mb-3" controlId="username">
          <Form.Label>{t("signup-username")}</Form.Label>
          <Form.Control required type="text" placeholder={t("signup-username-placeholder")} name="username" value={formData.username} onChange={handleChange} aria-describedby="usernameHelp usernameError" />
          <Form.Text id="usernameHelp" className="text-muted">
            {t("signup-username-help")}
          </Form.Text>
          {usernameError && <><br /><Form.Text id="usernameError" className="text-danger" aria-live="polite">{t(usernameError)}</Form.Text></>}
        </Form.Group>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>{t("email")}</Form.Label>
          <Form.Control required type="email" placeholder={t("email-placeholder")} name="email" value={formData.email} onChange={handleChange} aria-describedby="emailHelp emailError" />
          <Form.Text id="emailHelp" className="text-muted">
            {t("signup-email-help")}
          </Form.Text>
          {emailError && <><br /><Form.Text id="emailError" className="text-danger" aria-live="polite">{t(emailError)}</Form.Text></>}
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>{t("password")}</Form.Label>
          <InputGroup>
            <Form.Control required type={showPassword ? "text" : "password"} placeholder={t("signup-password-placeholder")} name="password" value={formData.password} onChange={handleChange} aria-describedby="passwordHelp passwordError" />
            <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>{showPassword ? t("password-hide") : t("password-show")}</Button>
          </InputGroup>
          <Form.Text id="passwordHelp" className="text-muted">
            {t("signup-password-help")}
          </Form.Text>
          {passwordError && <><br /><Form.Text id="passwordError" className="text-danger" aria-live="polite">{t(passwordError)}</Form.Text></>}
        </Form.Group>
        <Form.Group className="mb-3" controlId="confirmPassword">
          <Form.Label>{t("signup-confirm-password")}</Form.Label>
          <InputGroup>
            <Form.Control required type={showConfirmPassword ? "text" : "password"} placeholder={t("signup-confirm-password-placeholder")} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} aria-describedby="confirmPasswordHelp confirmPasswordError" />
            <Button variant="outline-secondary" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? t("password-hide") : t("password-show")}</Button>
          </InputGroup>
          {confirmPasswordError && <Form.Text id="confirmPasswordError" className="text-danger" aria-live="polite">{t(confirmPasswordError)}</Form.Text>}
        </Form.Group>
        <p>
          <Trans i18nKey="signup-privacy-terms-statement">By signing up, I state that I have read and accept the <Link to="/privacy-policy">Privacy Policy</Link> and the <Link to="/terms-and-conditions">Terms and Conditions</Link>.</Trans>
        </p>
        <Button className="mb-3" variant="primary" type="submit" disabled={isSubmitDisabled}>
          {t("signup-title")}
        </Button>
      </Form>
    </>
  );
}