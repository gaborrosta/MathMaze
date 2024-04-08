import React from "react";
import { useTranslation } from "react-i18next";
import { Form, Alert } from "react-bootstrap";
import BaseForm from "../utils/BaseForm";
import axios from "axios";
import { BACKEND_URL, EMAIL_REGEX, EMPTY_REGEX } from "../utils/constants";

/**
 * ContactForm renders the contact form.
 * 
 * @returns {React.Element} The ContactForm component.
 */
export default function ContactForm() {
  //Localisation
  const { t } = useTranslation();


  //Initial data and validation schema
  const initialData = {
    name: "",
    email: "",
    subject: "",
    message: "",
  };
  const validationSchema = {
    name: {
      required: true,
      regex: EMPTY_REGEX,
      regexError: "-",
    },
    email: {
      required: true,
      regex: EMAIL_REGEX,
      regexError: "email-error",
    },
    subject: {
      required: true,
      regex: EMPTY_REGEX,
      regexError: "-",
    },
    message: {
      required: true,
      regex: EMPTY_REGEX,
      regexError: "-",
    },
  };


  //Handle the contact form request
  const handleContactForm = (formData, setError, setSuccess, setFormData, done) => {
    const data = {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
    };

    //Send data
    axios.post(`${BACKEND_URL}/contact`, data, {
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(_ => {
      setError("");
      setSuccess("success-contact");
      setFormData({ name: "", email: "", subject: "", message: "" });
    })
    .catch(error => {
      setSuccess("");

      if (!error.response) {
        setError("error-unknown");
        return;
      }

      switch (error.response.data) {
        case "ContactNameEmptyException":
          setError("error-contact-name-empty")
          break;
        case "EmailInvalidFormatException":
          setError("error-email-invalid-format");
          break;
        case "ContactSubjectEmptyException":
          setError("error-contact-subject-empty")
          break;
        case "ContactMessageEmptyException":
          setError("error-contact-message-empty")
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
        {error && <Alert variant="danger">{t(error)}</Alert>}
        {success && <Alert variant="success">{t(success)}</Alert>}
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>{t("contact-name")} <span className="text-danger">*</span></Form.Label>
          <Form.Control required type="text" placeholder={t("contact-name-placeholder")} name="name" value={formData.name} onChange={handleChange} aria-describedby="fieldErrors.name" />
          {fieldErrors.name && <Form.Text className="text-danger">{t(fieldErrors.name)}</Form.Text>}
        </Form.Group>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>{t("email")} <span className="text-danger">*</span></Form.Label>
          <Form.Control required type="email" placeholder={t("email-placeholder")} name="email" value={formData.email} onChange={handleChange} aria-describedby="fieldErrors.email" />
          {fieldErrors.email && <Form.Text className="text-danger">{t(fieldErrors.email)}</Form.Text>}
        </Form.Group>
        <Form.Group className="mb-3" controlId="subject">
          <Form.Label>{t("contact-subject")} <span className="text-danger">*</span></Form.Label>
          <Form.Control required type="text" placeholder={t("contact-subject-placeholder")} name="subject" value={formData.subject} onChange={handleChange} aria-describedby="fieldErrors.subject" />
          {fieldErrors.subject && <Form.Text className="text-danger">{t(fieldErrors.subject)}</Form.Text>}
        </Form.Group>
        <Form.Group className="mb-3" controlId="message">
          <Form.Label>{t("contact-message")} <span className="text-danger">*</span></Form.Label>
          <Form.Control required as="textarea" rows={5} placeholder={t("contact-message-placeholder")} name="message" value={formData.message} onChange={handleChange} aria-describedby="fieldErrors.message" />
          {fieldErrors.message && <Form.Text className="text-danger">{t(fieldErrors.message)}</Form.Text>}
        </Form.Group>
        {submitButton}
      </>
    );
  }


  //Render the contact form
  return (
    <>
      <center>
        <h3>{t("contact-title")}</h3>
        <p>{t("contact-description")}</p>
      </center>
      <BaseForm
        onSubmit={handleContactForm}
        initialData={initialData}
        validationSchema={validationSchema}
        form={form}
        buttonText="contact-submit"
      />
    </>
  );
}
