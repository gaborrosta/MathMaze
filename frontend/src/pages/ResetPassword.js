import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Form, Button } from "react-bootstrap";

export default function ResetPassword() {
  const { t } = useTranslation();

  useEffect(() => { document.title = t("reset-password-title") + " | " + t("app-name"); });

  const [formData, setFormData] = useState({
    email: "",
  });

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
    console.log(formData);
    //TODO...
  };

  return (
    <>
      <center>
        <h1>{t("reset-password-title")}</h1>
      </center>
      <p>
        {t("reset-password-text")}
      </p>
      <Form onSubmit={handleResetPassword}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label htmlFor="email">{t("email")}</Form.Label>
          <Form.Control required type="email" placeholder={t("email-placeholder")} name="email" value={formData.email} onChange={handleChange} />
          {emailError && <Form.Text className="text-danger">{t(emailError)}</Form.Text>}
        </Form.Group>
        <Button className="mb-3" variant="primary" type="submit" disabled={isSubmitDisabled}>
          {t("reset-password-submit")}
        </Button>
      </Form>
    </>
  );
}
