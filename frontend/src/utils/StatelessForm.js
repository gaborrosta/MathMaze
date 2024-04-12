import { useState, useEffect } from "react";

/**
 * StatelessForm renders a form with validation and error handling, but does not handle the submission and keeps the parent component updated.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.initialData - An object containing the initial form data. The keys should match the keys in validationSchema. It must be a state or use useMemo. Example: `{ name: "", email: "" }`
 * @param {Object} props.validationSchema - An object containing the validation schema for the form. The keys should match the keys in initialData. Each value should be an object with the following properties:
 *   - required: A boolean indicating whether the field is required.
 *   - regex: A regular expression to validate the field. Example: `new RegExp(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/)` or `new RegExp(/.* /)` for any value (remove the space). Can use regexes from constants.
 *   - regexError: The key of the error message to display if the field does not match the regex. Example: `"email-error"`
 *   - customCheck: An optional function to perform additional validation on the field. It receives the current form data and should return an object containing a key if there is an error.`
 * @param {Function} props.setIsThereAnyError - A function to set whether there are any errors in the form. It receives a boolean value.
 * @param {Function} props.onStateChanged - A function to set the state of the parent component when the form data changes. It receives the current form data.
 * @param {Function} props.form - The function to render the form fields. It receives the following parameters:
 *   - formData: The current form data. Example: `{ name: "John Doe", email: "john.doe@example.com" }`
 *   - handleChange: A function to handle changes to the form fields, it should be called on the `onChange` event of the form fields.
 *   - fieldErrors: An object containing any field errors. Example: `{ name: "", email: "email-error" }`
 * @param {Function} props.customValidator - An optional function to perform additional validation on the form. It receives the current form data and should return an object containing a key if there is an error. If the value in the object is an empty string, then the custom error is removed from that field.
 *
 * @returns {React.Element} The StatelessForm component.
 */
export default function StatelessForm({ initialData, validationSchema, setIsThereAnyError, onStateChanged, form, customValidator }) {
  //Check the parameters
  checkParameters(initialData, validationSchema, setIsThereAnyError, onStateChanged, form, customValidator);


  //Form data and field errors
  const [formData, setFormData] = useState(initialData);
  const [fieldErrors, setFieldErrors] = useState({});


  //If the initial data changes, update the form data
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);


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
    if (value === "" && fieldSchema.required) {
      newFieldErrors[name] = "field-required";
    } else if (!fieldSchema.regex.test(value)) {
      newFieldErrors[name] = fieldSchema.regexError;
    } else {
      delete newFieldErrors[name];
    }

    //Call the custom validator
    if (customValidator !== undefined) {
      const customErrors = customValidator(newFormData);

      //Merge the custom errors with the existing errors (it can delete custom errors but not regexErrors or required errors)
      for (let key in customErrors) {
        if (!newFieldErrors.hasOwnProperty(key) || (newFieldErrors[key] !== "field-required" && newFieldErrors[key] !== validationSchema[key].regexError)) {
          newFieldErrors[key] = customErrors[key];
        }
      }
    }

    //Update the field errors
    setFieldErrors(newFieldErrors);

    //Notify the parent component
    onStateChanged(newFormData);
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
      setIsThereAnyError(true);
    } else {
      setIsThereAnyError(false);
    }
  }, [fieldErrors, formData, validationSchema, setIsThereAnyError]);


  //Render the form
  return (
    form(
      formData,
      handleChange,
      fieldErrors,
    )
  );
};


/**
 * Checks the parameters passed to the StatelessForm component.
 */
function checkParameters(initialData, validationSchema, setIsThereAnyError, onStateChanged, form, customValidator) {
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

    if (!fieldSchema.regex || !(fieldSchema.regex instanceof RegExp)) {
      throw new Error(`Every value in validationSchema must have a regex. "${key}" does not have a regex.`);
    }

    if (fieldSchema.regexError === undefined) {
      throw new Error(`Every value in validationSchema must have a regexError. "${key}" does not have a regexError.`);
    }
  }

  if (setIsThereAnyError === undefined) {
    throw new Error("setIsThereAnyError is required.");
  }
  if (typeof setIsThereAnyError !== "function") {
    throw new Error("setIsThereAnyError must be a function.");
  }
  if (setIsThereAnyError.length !== 1) {
    throw new Error("setIsThereAnyError must have 1 parameter.");
  }

  if (onStateChanged === undefined) {
    throw new Error("onStateChanged is required.");
  }
  if (typeof onStateChanged !== "function") {
    throw new Error("onStateChanged must be a function.");
  }
  if (onStateChanged.length !== 1) {
    throw new Error("onStateChanged must have 1 parameter.");
  }

  if (form === undefined) {
    throw new Error("form is required.");
  }
  if (typeof form !== "function") {
    throw new Error("form must be a function.");
  }
  if (form.length !== 3) {
    throw new Error("form must have 3 parameters.");
  }

  if (customValidator !== undefined) {
    if (typeof customValidator !== "function") {
      throw new Error("customValidator must be a function.");
    }
    if (customValidator.length !== 1) {
      throw new Error("customValidator must have 1 parameter.");
    }
  }
}
