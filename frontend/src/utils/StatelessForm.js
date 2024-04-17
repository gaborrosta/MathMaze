import { useEffect } from "react";

/**
 * StatelessForm renders a form with validation and error handling, but does not handle the submission and keeps the parent component updated.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.formData - An object containing the initial form data. The keys should match the keys in validationSchema. It must be a state. Example: `{ name: "", email: "" }`
 * @param {Object} props.validationSchema - An object containing the validation schema for the form. The keys should match the keys in formData. Each value should be an object with the following properties:
 *   - required: A boolean indicating whether the field is required.
 *   - regex: A regular expression to validate the field. Example: `new RegExp(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/)` or `new RegExp(/.* /)` for any value (remove the space). Can use regexes from constants.
 *   - regexError: The key of the error message to display if the field does not match the regex. Example: `"email-error"`
 *   - fileTypes: An array of file types to accept if the field is for files. Only one file handled. Example: `["image/png", "image/jpeg"]`
 *   - fileError: The key of the error message to display if the file does not have the right type. Example: `"file-error"`
* @param {Object} props.fieldErrors - An object containing the field errors. It must be a state. Example: `{ name: "", email: "email-error" }`
 * @param {Function} props.setFieldErrors - A function to set the field errors. It receives an object containing the field errors.
 * @param {Function} props.setIsThereAnyError - A function to set whether there are any errors in the form. It receives a boolean value.
 * @param {Function} props.onStateChanged - A function to set the state of the parent component when the form data changes. It receives the current form data.
 * @param {Function} props.form - The function to render the form fields. It receives the following parameters:
 *   - formData: The current form data. If the field is a file, then the file and the URL are stored here. Example: `{ name: "John Doe", email: "john.doe@example.com" }`
 *   - handleChange: A function to handle changes to the form fields, it should be called on the `onChange` event of the form fields.
 *   - fieldErrors: An object containing any field errors. Example: `{ name: "", email: "email-error" }`
 * @param {Function} props.customValidator - An optional function to perform additional validation on the form. It receives the current form data and should return an object containing a key if there is an error. If the value in the object is an empty string, then the custom error is removed from that field.
 *
 * @returns {React.Element} The StatelessForm component.
 */
export default function StatelessForm({ formData, validationSchema, fieldErrors, setFieldErrors, setIsThereAnyError, onStateChanged, form, customValidator }) {
  //Check the parameters
  checkParameters(formData, validationSchema, fieldErrors, setFieldErrors, setIsThereAnyError, onStateChanged, form, customValidator);


  //Handle form field changes
  const handleChange = (event) => {
    //Get the name, value, files of the field
    let { name, value, files } = event.target;

    //Update the form data
    const newFormData = { ...formData, [name]: value };

    //Update the field errors
    const newFieldErrors = { ...fieldErrors };

    //Validate the field
    const fieldSchema = validationSchema[name];
    if (fieldSchema.fileTypes !== undefined) { //files !== null &&
      //It is a file, so delete the saved value.
      delete newFormData[name];

      if (files === null) {
        newFieldErrors[name] = "field-required";
        newFormData[name] = null;
      } else {
        //Only one file is handled
        const file = files[0];

        //Validate the file
        if (file === undefined && fieldSchema.required) {
          newFieldErrors[name] = "field-required";
          newFormData[name] = null;
        } else if (fieldSchema.fileTypes.includes(file.type)) {
          delete newFieldErrors[name];
          newFormData[name] = { file: file, url: URL.createObjectURL(file) };
        } else {
          newFieldErrors[name] = fieldSchema.fileError;
          newFormData[name] = null;
        }
      }
    } else if (value === "" && fieldSchema.required) {
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
        if (!newFieldErrors.hasOwnProperty(key) && customErrors[key] === "") {
          continue;
        }

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
function checkParameters(formData, validationSchema, fieldErrors, setFieldErrors, setIsThereAnyError, onStateChanged, form, customValidator) {
  if (formData === undefined) {
    throw new Error("formData is required.");
  }
  if (typeof formData !== "object") {
    throw new Error("formData must be an object.");
  }

  if (validationSchema === undefined) {
    throw new Error("validationSchema is required.");
  }
  if (typeof validationSchema !== "object") {
    throw new Error("validationSchema must be an object.");
  }

  const formDataKeys = Object.keys(formData);
  const validationSchemaKeys = Object.keys(validationSchema);

  if (formDataKeys.filter(x => !validationSchemaKeys.includes(x)).length !== 0) {
    throw new Error("formData and validationSchema must have the same keys.");
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

  if (fieldErrors === undefined) {
    throw new Error("fieldErrors is required.");
  }
  if (typeof fieldErrors !== "object") {
    throw new Error("fieldErrors must be an object.");
  }
  if (Object.keys(fieldErrors).some(x => !formDataKeys.includes(x))) {
    throw new Error("fieldErrors cannot have different keys than formData.");
  }

  if (setFieldErrors === undefined) {
    throw new Error("setFieldErrors is required.");
  }
  if (typeof setFieldErrors !== "function") {
    throw new Error("setFieldErrors must be a function.");
  }
  if (setFieldErrors.length !== 1) {
    throw new Error("setFieldErrors must have 1 parameter.");
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
