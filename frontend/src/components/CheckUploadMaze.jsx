import React from "react";
import { useTranslation } from "react-i18next";
import { Form, Button, Alert, Row, Col } from "react-bootstrap";
import BaseForm from "../utils/BaseForm";
import { INTEGER_REGEX } from "../utils/constants";

/**
 * CheckUploadMaze renders the form to check a maze by uploading an image.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.initialId - The initial value for the maze ID input.
 * @param {Function} props.handleSubmit - The function to call when the form is submitted. It receives the form data.
 *
 * @returns {React.Element} The CheckUploadMaze component.
 */
export default function CheckUploadMaze({ initialId, handleSubmit }) {
  //Check the parameters
  checkParameters(initialId, handleSubmit);


  //Localisation
  const { t } = useTranslation();


  //Initial data and validation schema
  const initialData = {
    id: initialId,
    file: null,
    rotation: 0,
  };
  const validationSchema = {
    id: {
      required: true,
      regex: INTEGER_REGEX,
      regexError: "error-invalid-maze-id",
    },
    file: {
      required: true,
      fileTypes: ["image/png", "image/jpeg"],
      fileError: "error-invalid-file-type",
    },
    rotation: {
      required: true,
      regex: new RegExp("^0$|^90$|^180$|^270$"),
      regexError: "-",
    },
  };


  //Handle the submit request
  const prepareSubmit = (formData, setError, setSuccess, setFormData, done) => {
    const data = new FormData();
    data.append("mazeId", formData.id);
    data.append("image", formData.file.file);
    data.append("rotation", formData.rotation);

    handleSubmit(data);
  };


  //Create the form
  const form = (formData, handleChange, fieldErrors, error, success, submitButton) => {
    return (
      <>
        <Row>
          <Col xs={12} lg={4}>
            <div className="border p-3 m-2">
              <Form.Group className="mb-3" controlId="id">
                <Form.Label>{t("maze-check-id-label")} <span className="text-danger">*</span></Form.Label>
                <Form.Control name="id" type="text" value={formData.id} onChange={handleChange} aria-describedby="idHelp fieldErrors.id" />
                <Form.Text id="idHelp" className="text-muted">
                  {t("maze-check-id-help")}
                </Form.Text>
                {fieldErrors.id && <><br /><Form.Text className="text-danger">{t(fieldErrors.id)}</Form.Text></>}
              </Form.Group>
              <Form.Group className="mb-3" controlId="file">
                <Form.Label>{t("maze-check-file-label")} <span className="text-danger">*</span></Form.Label>
                <Form.Control name="file" type="file" onChange={handleChange} aria-describedby="fileHelp fieldErrors.file" data-testid="file" />
                <Form.Text id="fileHelp" className="text-muted">
                  {t("maze-check-file-help")}
                </Form.Text>
                {fieldErrors.file && <><br /><Form.Text className="text-danger">{t(fieldErrors.file)}</Form.Text></>}
              </Form.Group>
              {submitButton}
            </div>
          </Col>
          <Col xs={12} lg={8}>
            <div className="border p-3 m-2">
              {!formData.file ? <Alert variant="info">{t("maze-check-image-info")}</Alert> : <>
                <Alert variant="info">{t("maze-check-rotate-image-info")}</Alert>
                <Button
                  onClick={() => {
                    handleChange({
                      target: {
                        name: "rotation",
                        value: (formData.rotation + 90) % 360
                      }
                    });
                  }}
                  className="mb-3"
                >
                  {t("rotate-image")}
                </Button>
                <div className="image-outer-container">
                  <div className="image-inner-container">
                    <img
                      src={formData.file.url}
                      alt={t("maze-check-file-label")}
                      className="rotatedImage"
                      style={{ transform: `translate(-50%, -50%) rotate(${formData.rotation}deg)` }}
                    />
                  </div>
                </div>
              </>}
            </div>
          </Col>
        </Row>
      </>
    );
  };


  //Render the component
  return (
    <>
      <BaseForm
        onSubmit={prepareSubmit}
        initialData={initialData}
        validationSchema={validationSchema}
        form={form}
        buttonText="maze-check-title"
      />
    </>
  );
};


/**
 * Checks the parameters passed to the CheckUploadMaze component.
 */
function checkParameters(initialId, handleSubmit) {
  if (initialId === undefined) {
    throw new Error("initialId is required.");
  }
  if (typeof initialId !== "string") {
    throw new Error("initialId must be a string.");
  }

  if (handleSubmit === undefined) {
    throw new Error("handleSubmit is required.");
  }
  if (typeof handleSubmit !== "function") {
    throw new Error("handleSubmit must be a function.");
  }
  if (handleSubmit.length !== 1) {
    throw new Error("handleSubmit must have 1 parameter.");
  }
}
