import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Form, Button } from "react-bootstrap";
import StatelessForm from "./StatelessForm";

/**
 * BaseForm renders a form with validation and error handling.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Function} props.onSubmit - The function to call when the form is submitted. It receives the following parameters:
 *   - formData: The current form data. Example: `{ name: "John Doe", email: "john.doe@example.com" }`
 *   - setError: A function to set the error message for the whole form.
 *   - setSuccess: A function to set the success message for the whole form.
 *   - setFormData: A function to set the form data.
 *   - done: A function to set the request in progress state to false (so the form can be submitted again).
 * @param {Object} props.initialData - An object containing the initial form data. The keys should match the keys in validationSchema. Example: `{ name: "", email: "" }`
 * @param {Object} props.validationSchema - An object containing the validation schema for the form. The keys should match the keys in formData. Each value should be an object with the following properties:
 *   - required: A boolean indicating whether the field is required.
 *   - regex: A regular expression to validate the field. Example: `new RegExp(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/)` or `new RegExp(/.* /)` for any value (remove the space). Can use regexes from constants.
 *   - regexError: The key of the error message to display if the field does not match the regex. Example: `"email-error"`
 *   - fileTypes: An array of file types to accept if the field is for files. Only one file handled. Example: `["image/png", "image/jpeg"]`
 *   - fileError: The key of the error message to display if the file does not have the right type. Example: `"file-error"`
 * @param {Function} props.form - The function to render the form fields. It receives the following parameters:
 *   - formData: The current form data. If the field is a file, then the file and the URL are stored here. Example: `{ name: "John Doe", email: "john.doe@example.com" }`
 *   - handleChange: A function to handle changes to the form fields, it should be called on the `onChange` event of the form fields.
 *   - fieldErrors: An object containing any field errors. Example: `{ name: "", email: "email-error" }`
 *   - error: The key of the current error message for the whole form.
 *   - success: The key of the current success message for the whole form.
 *   - submitButton: The submit button for the form.
 * @param {string} props.buttonText - The key of the text to display on the submit button. Example: `"reset-password-submit"`
 * @param {Function} props.customValidator - An optional function to perform additional validation on the form. It receives the current form data and should return an object containing a key if there is an error. If the value in the object is an empty string, then the custom error is removed from that field.
 * @param {Function} props.extraCheckForSubmitButton - An optional function to perform additional checks on the form data before enabling the submit button. It receives the current form data and should return a boolean indicating whether the submit button should be disabled.
 *
 * @returns {React.Element} The BaseForm component.
 */
export default function BaseForm({ onSubmit, initialData, validationSchema, form, buttonText, customValidator, extraCheckForSubmitButton }) {
  //Check the parameters
  checkParameters(onSubmit, initialData, validationSchema, form, buttonText, customValidator, extraCheckForSubmitButton);


  //Localisation
  const { t } = useTranslation();


  //Is the request in progress?
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);

  //Form data and field errors
  const [formData, setFormData] = useState(initialData);
  const [fieldErrors, setFieldErrors] = useState({});

  //Error and success messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  //Is the submit button disabled?
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);


  //Handle form submission
  const handleSubmit = async (event) => {
    //Prevent the default form submission
    event.preventDefault();

    //Set the request in progress
    setIsRequestInProgress(true);

    //Call the onSubmit function
    onSubmit(formData, setError, setSuccess, setFormData, () => { setIsRequestInProgress(false)});
  };


  //Render the form
  return (
    <Form onSubmit={handleSubmit}>
      <StatelessForm
        formData={formData}
        validationSchema={validationSchema}
        fieldErrors={fieldErrors}
        setFieldErrors={setFieldErrors}
        setIsThereAnyError={setIsSubmitDisabled}
        onStateChanged={setFormData}
        form={(_formData, _handleChange, _fieldErrors) => (
          form(
            _formData,
            _handleChange,
            _fieldErrors,
            error,
            success,
            <Button
              className="mb-3"
              variant="primary"
              type="submit"
              disabled={
                isSubmitDisabled ||
                isRequestInProgress ||
                (extraCheckForSubmitButton !== undefined && extraCheckForSubmitButton(_formData))
              }
            >
              {t(buttonText)}
            </Button>
          )
        )}
        customValidator={customValidator}
      />
    </Form>
  );
};


/**
 * Checks the parameters passed to the BaseForm component.
 */
function checkParameters(onSubmit, initialData, validationSchema, form, buttonText, customValidator, extraCheckForSubmitButton) {
  if (onSubmit === undefined) {
    throw new Error("onSubmit is required.");
  }
  if (typeof onSubmit !== "function") {
    throw new Error("onSubmit must be a function.");
  }
  if (onSubmit.length !== 5) {
    throw new Error("onSubmit must have 5 parameters.");
  }

  if (initialData === undefined) {
    throw new Error("initialData is required.");
  }
  if (typeof initialData !== "object") {
    throw new Error("initialData must be an object.");
  }

  if (validationSchema === undefined) {
    throw new Error("validationSchema is required.");
  }
  if (typeof validationSchema !== "object") {
    throw new Error("validationSchema must be an object.");
  }

  const initialDataKeys = Object.keys(initialData);
  const validationSchemaKeys = Object.keys(validationSchema);

  if (initialDataKeys.filter(x => !validationSchemaKeys.includes(x)).length !== 0) {
    throw new Error("initialData and validationSchema must have the same keys.");
  }

  for (let key of validationSchemaKeys) {
    const fieldSchema = validationSchema[key];
    if (typeof fieldSchema !== "object") {
      throw new Error(`Every value in validationSchema must be an object. "${key}" is not an object.`);
    }

    if ((fieldSchema.regex === undefined || !(fieldSchema.regex instanceof RegExp) || fieldSchema.regexError === undefined) &&
        (fieldSchema.fileTypes === undefined || !Array.isArray(fieldSchema.fileTypes) || fieldSchema.fileError === undefined)) {
      throw new Error(`Every value in validationSchema must either have a regex with regexError or fileTypes with fileError. "${key}" does not meet this requirement.`);
    }
  }

  if (form === undefined) {
    throw new Error("form is required.");
  }
  if (typeof form !== "function") {
    throw new Error("form must be a function.");
  }
  if (form.length !== 6) {
    throw new Error("form must have 6 parameters.");
  }

  if (buttonText === undefined) {
    throw new Error("buttonText is required.");
  }
  if (typeof buttonText !== "string") {
    throw new Error("buttonText must be a string.");
  }

  if (customValidator !== undefined) {
    if (typeof customValidator !== "function") {
      throw new Error("customValidator must be a function.");
    }
    if (customValidator.length !== 1) {
      throw new Error("customValidator must have 1 parameter.");
    }
  }

  if (extraCheckForSubmitButton !== undefined) {
    if (typeof extraCheckForSubmitButton !== "function") {
      throw new Error("extraCheckForSubmitButton must be a function.");
    }
    if (extraCheckForSubmitButton.length !== 1) {
      throw new Error("extraCheckForSubmitButton must have 1 parameter.");
    }
  }
}
