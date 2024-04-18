import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams  } from "react-router-dom"
import Loading from "react-fullscreen-loading";
import { Form, Button, InputGroup, Alert } from "react-bootstrap";
import axios from "axios";
import { BACKEND_URL, PASSWORD_REGEX } from "../utils/constants";
import BaseForm from "../utils/BaseForm";

/**
 * SetNewPassword renders the set new password page.
 *
 * @returns {React.Element} The SetNewPassword component.
 */
export default function SetNewPassword() {
  //Localisation
  const { t } = useTranslation();


  //Set the page title
  useEffect(() => { document.title = t("set-new-password-title") + " | " + t("app-name"); });


  //Params for the token
  const [params] = useSearchParams();

  //Error and loading states
  const [tokenError, setTokenError] = useState("");
  const [loading, setLoading] = useState(true);

  //Function to set loading to false after 1 second
  const loadingDone = () => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }


  //Check the token
  useEffect(() => {
    const token = params.get("token");

    //If no token, set error and stop loading
    if (!token) {
      setTokenError("set-new-password-error-no-token");
      loadingDone();
    } else {
      setTokenError("");

      //Check the token
      axios.get(`${BACKEND_URL}/users/password-validate?token=${token}`)
      .then(_ => {
        loadingDone();
      })
      .catch(error => {
        if (!error.response || (error.response && error.response.data !== "TokenInvalidOrExpiredException")) {
          setTokenError("error-unknown");
        } else {
          setTokenError("set-new-password-error-token-invalid-or-expired");
        }

        loadingDone();
      });
    }
  }, [params]);


  //Initial data and validation schema
  const initialData = {
    password: "",
  };
  const validationSchema = {
    password: {
      required: true,
      regex: PASSWORD_REGEX,
      regexError: "signup-password-error",
    },
  };


  //Show password state
  const [showPassword, setShowPassword] = useState(false);


  //Handle the set new password request
  const handleSetNewPassword = (formData, setError, setSuccess, setFormData, done) => {
    const data = {
      token: params.get("token"),
      password: formData.password,
    };

    //Send data
    axios.post(`${BACKEND_URL}/users/password-reset`, data, {
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(_ => {
      setError("");
      setSuccess("success-set-new-password");
      setFormData({ password: "" });
    })
    .catch(error => {
      setShowPassword(false);

      setSuccess("");
      setFormData({ password: "" });

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
      done();
    });
  }


  //Create the form
  const form = (formData, handleChange, fieldErrors, error, success, submitButton) => {
    return (
      <>
        {success ? <Alert variant="success">{t(success)}</Alert> : <>
          {error && <Alert variant="danger">{t(error)}</Alert>}
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
          {submitButton}
        </>}
      </>
    );
  };


  //Render the page
  return (
    <>
      {loading ? <Loading loading background="#fedf19" loaderColor="#7d141d" /> : <>
        <center>
          <h1>{t("set-new-password-title")}</h1>
        </center>
        <p>
          {t("set-new-password-text")}
        </p>
        {tokenError ? <Alert variant="danger">{t(tokenError)}</Alert> :
          <BaseForm
            onSubmit={handleSetNewPassword}
            initialData={initialData}
            validationSchema={validationSchema}
            form={form}
            buttonText="set-new-password-title"
          />
        }
      </>}
    </>
  );
}
