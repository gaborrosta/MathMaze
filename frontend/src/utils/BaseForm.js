import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Form, Button } from "react-bootstrap";

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
 * @param {Object} props.validationSchema - An object containing the validation schema for the form. The keys should match the keys in initialData. Each value should be an object with the following properties:
 *   - required: A boolean indicating whether the field is required.
 *   - regex: A regular expression to validate the field. Example: `new RegExp(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/)` or `new RegExp(/.* /)` for any value (remove the space).
 *   - regexError: The key of the error message to display if the field does not match the regex. Example: `"email-error"`
 *   - customCheck: An optional function to perform additional validation on the field. It receives the current form data and should return an object containing a key if there is an error.`
 * @param {Function} props.form - The function to render the form fields. It receives the following parameters:
 *   - formData: The current form data. Example: `{ name: "John Doe", email: "john.doe@example.com" }`
 *   - handleChange: A function to handle changes to the form fields, it should be called on the `onChange` event of the form fields.
 *   - fieldErrors: An object containing any field errors. Example: `{ name: "", email: "email-error" }`
 *   - error: The key of the current error message for the whole form.
 *   - success: The key of the current success message for the whole form.
 *   - submitButton: The submit button for the form.
 * @param {string} props.buttonText - The key of the text to display on the submit button. Example: `"reset-password-submit"`
 * 
 * @returns {React.Element} The BaseForm component.
 */
export default function BaseForm ({ onSubmit, initialData, validationSchema, form, buttonText }) {
  //Localisation
  const { t } = useTranslation();

  
  //Check the initial data and validation schema 
  const checkValidationSchema = () => {
    if (!initialData || !validationSchema) {
      throw new Error("initialData and validationSchema cannot be empty");
    }

    const initialDataKeys = Object.keys(initialData);
    const validationSchemaKeys = Object.keys(validationSchema);

    if (initialDataKeys.length !== validationSchemaKeys.length) {
      throw new Error("initialData and validationSchema must have the same keys");
    }

    for (let key of validationSchemaKeys) {
      if (!initialDataKeys.includes(key)) {
        throw new Error(`Key "${key}" is missing from initialData`);
      }

      const fieldSchema = validationSchema[key];
      if (typeof fieldSchema !== "object") {
        throw new Error(`Every value in validationSchema must be an object. "${key}" is not an object.`);
      }

      if (!fieldSchema.regex || !(fieldSchema.regex instanceof RegExp)) {
        throw new Error(`Every value in validationSchema must have a regex. "${key}" does not have a regex.`);
      }

      if (!fieldSchema.regexError) {
        throw new Error(`Every value in validationSchema must have a regexError. "${key}" does not have a regexError.`);
      }

      if (fieldSchema.customCheck && typeof fieldSchema.customCheck !== "function") {
        throw new Error(`customCheck must be a function. "${key}" has a customCheck that is not a function.`);
      }
    }
  };

  checkValidationSchema();


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


  //Handle form field changes
  const handleChange = (event) => {
    //Get the name, value of the field
    let { name, value } = event.target;

    //Update the form data
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    //Update the field errors
    const newFieldErrors = { ...fieldErrors };

    //Validate the field
    const fieldSchema = validationSchema[name];
    if (!fieldSchema.regex.test(value)) {
      newFieldErrors[name] = fieldSchema.regexError;
    } else {
      delete newFieldErrors[name];
    }

    //Call the custom check function if specified
    if (fieldSchema.customCheck) {
      const customErrors = fieldSchema.customCheck(newFormData);
    
      //Merge the custom errors with the existing errors
      for (let key in customErrors) {
        if (!newFieldErrors.hasOwnProperty(key)) {
          newFieldErrors[key] = customErrors[key];
        }
      }
    }

    //Update the field errors
    setFieldErrors(newFieldErrors);
  };


  //Check if the form is ready to be submitted
  useEffect(() => {
    //Check if there are any empty fields
    const isThereAnyEmptyFields = Object.entries(formData).some(([key, value]) =>
      (value === undefined || value === null || value === "") && validationSchema[key].required
    );

    //Check if there are any errors
    const isThereAnyErrors = Object.entries(fieldErrors).some(([_, value]) => value !== "");
    
    //Disable the submit button if there are any errors or empty fields
    if (isThereAnyErrors || isThereAnyEmptyFields) {
      setIsSubmitDisabled(true);
    } else {
      setIsSubmitDisabled(false);
    }
  }, [fieldErrors, formData, validationSchema]);


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
      {form(
        formData,
        handleChange,
        fieldErrors,
        error,
        success,
        <Button className="mb-3" variant="primary" type="submit" disabled={isSubmitDisabled || isRequestInProgress}>
          {t(buttonText)}
        </Button>
      )}
    </Form>
  );
};
