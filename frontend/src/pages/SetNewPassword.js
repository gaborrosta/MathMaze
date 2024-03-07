import React, { useEffect, useState } from "react";
import { useSearchParams  } from "react-router-dom"
import Loading from "react-fullscreen-loading";
import { useTranslation } from "react-i18next";
import { Form, Button, InputGroup, Alert } from "react-bootstrap";
import { BASE_URL } from "../utils/constants";
import axios from "axios";

export default function SetPassword() {
  const { t } = useTranslation();

  useEffect(() => { document.title = t("set-new-password-title") + " | " + t("app-name"); });

  const [isRequestInProgress, setIsRequestInProgress] = useState(false);

  const [params] = useSearchParams();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [tokenError, setTokenError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const loadingDone = () => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setTokenError("set-new-password-error-no-token");
      loadingDone();
    } else {
      setTokenError("");

      axios.get(`${BASE_URL}/users/password-validate?token=${token}`)
      .then(_ => {
        loadingDone();
      })
      .catch(error => {
        if (!error.response) {
          setError("error-unknown");
          loadingDone();
          return;
        }

        if (error.response.data === "TokenInvalidOrExpiredException") {
          setTokenError("set-new-password-error-token-invalid-or-expired");
          loadingDone();
        } else {
          setTokenError("error-unknown");
          loadingDone();
        }
      });
    }
  }, [params]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  
    if (e.target.name === "password") {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
      if (e.target.value) {
        if (!passwordRegex.test(e.target.value)) {
          setPasswordError("signup-password-error");
        } else if (e.target.value === formData.confirmPassword) {
          setConfirmPasswordError("");
          setPasswordError("");
        } else {
          setConfirmPasswordError("signup-confirm-password-error");
          setPasswordError("");
        }
      } else {
        setPasswordError("");

        if (!formData.confirmPassword) {
          setConfirmPasswordError("");
        }
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
    if (passwordError || confirmPasswordError || !formData.password || !formData.confirmPassword) {
      setIsSubmitDisabled(true);
    } else {
      setIsSubmitDisabled(false);
    }
  }, [passwordError, confirmPasswordError, formData]);

  const handleSetNewPassword = (e) => {
    e.preventDefault();

    const data = {
      token: params.get("token"),
      password: formData.password,
    };

    setIsRequestInProgress(true);

    //Send data
    axios.post(`${BASE_URL}/users/password-reset`, data, {
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(_ => {
      setError("");
      setSuccess("success-set-new-password");
    })
    .catch(error => {
      setFormData({ password: "", confirmPassword: ""});

      if (!error.response) {
        setError("error-unknown");
        return;
      }

      switch (error.response.data) {
        case "PasswordInvalidFormatException":
          setError("error-password-invalid-format");
          break;
        default:
          setError("error-unknown-form");
          break;
      }
    })
    .finally(() => {
      setIsRequestInProgress(false);
    });
  }

  return (
    <>
      {loading ? <Loading loading background="#fedf19" loaderColor="#7d141d" /> : <>
        <center>
          <h1>{t("set-new-password-title")}</h1>
        </center>
        <p>
          {t("set-new-password-text")}
        </p>
        {tokenError ? <Alert variant="danger">{t(tokenError)}</Alert> : <>
          {error && <Alert variant="danger">{t(error)}</Alert>}
          {success && <Alert variant="success">{t(success)}</Alert>}
          <Form onSubmit={handleSetNewPassword}>
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
            <Button className="mb-3" variant="primary" type="submit" disabled={isSubmitDisabled || isRequestInProgress}>
              {t("set-new-password-title")}
            </Button>
          </Form>
        </>}
      </>}
    </>
  );
}
