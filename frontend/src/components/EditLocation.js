import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Form, Alert, Row, Col } from "react-bootstrap";
import axios from "axios";
import { BACKEND_URL } from "../utils/constants";
import BaseForm from "../utils/BaseForm";
import TokenContext from "../utils/TokenContext";

/**
 * EditLocation renders a modal to edit a location.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {boolean} props.visible - Whether the modal is visible.
 * @param {Function} props.setVisible - The function to set the visibility of the modal.
 * @param {Array} props.location - The location data to edit. The first element is the parent folder, the second is the location to edit.
 * @param {Function} props.changed - The function to call when the mazes and locations have changed. The function receives the new mazes and locations.
 *
 * @returns {React.Element} The EditLocation component.
 */
export default function EditLocation({ visible, setVisible, location, changed }) {
  //Check the parameters
  checkParameters1(visible, setVisible);


  //Render the component
  return (
    <Modal show={visible} onHide={() => setVisible(false)}>
      {visible && <EditLocationContent location={location} changed={changed} />}
    </Modal>
  );
}


/**
 * EditLocationContent renders a form to edit a location.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Array} props.location - The location data to edit. The first element is the parent folder, the second is the location to edit.
 * @param {Function} props.mazesChanged - The function to call when the mazes and locations have changed. The function receives the new mazes and locations.
 *
 * @returns {React.Element} The EditLocationContent component.
 */
function EditLocationContent({ location, changed }) {
  //Check the parameters
  checkParameters2(location, changed);


  //Localisation
  const { t } = useTranslation();


  //Actual token
  const { token, setToken } = useContext(TokenContext);


  //Location data
  const [parentFolder, editableLocation] = location;


  //Initial data and validation schema
  const initialData = { newLocation: editableLocation };
  const validationSchema = {
    newLocation: {
      required: true,
      regex: new RegExp(/^[A-Za-z0-9ÁÉÍÓÖŐÚÜŰáéíóöőúüű, .?!:-]{1,20}$/),
      regexError: "error-rename-location-invalid-format",
    }
  };


  //Handle the location change request
  const handleSubmit = (formData, setError, setSuccess, _, done) => {
    const data = {
      parentLocation: parentFolder,
      originalLocation: editableLocation,
      newLocation: formData.newLocation,
      token: token,
    };

    //Send data
    axios.post(`${BACKEND_URL}/maze/update-location`, data, {
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      setError("");
      setSuccess("location-renamed");
      setToken(response.data.token);
      changed(response.data.mazes, response.data.locations);
    })
    .catch(error => {
      setSuccess("");

      if (!error.response) {
        setError("error-unknown");
        return;
      }

      switch (error.response.data) {
        case "LocationInvalidFormatException":
          setError("error-save-maze-location-invalid-format");
          break;
        case "LocationNotUniqueException":
          setError("error-save-location-already-exists");
          break;
        case "LocationNotFoundException":
          setError("error-save-location-not-found");
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
        <Form.Group className="mb-3" controlId="location">
          <Form.Label>{t("location-rename-new-name")} <span className="text-danger">*</span></Form.Label>
          <Row>
            <Col md="auto" className="mb-md-0 mb-3 d-flex align-items-center justify-content-center">
              <p className="m-0">{parentFolder}</p>
            </Col>
            <Col>
              <Form.Control type="text" name="newLocation" value={formData.newLocation} onChange={handleChange} aria-describedby="newLocationHelp fieldErrors.newLocation" />
            </Col>
          </Row>
          <Form.Text id="newLocationHelp" className="text-muted">
            {t("location-rename-help")}
          </Form.Text>
          {fieldErrors.newLocation && <><br /><Form.Text className="text-danger">{t(fieldErrors.newLocation)}</Form.Text></>}
        </Form.Group>
        {submitButton}
      </>
    );
  };


  //Render the component
  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>{t("location-rename-title")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <BaseForm
          onSubmit={handleSubmit}
          initialData={initialData}
          validationSchema={validationSchema}
          form={form}
          buttonText="location-rename-save"
        />
      </Modal.Body>
    </>
  );
}


/**
 * Checks the parameters passed to the EditLocation component.
 */
function checkParameters1(visible, setVisible) {
  if (visible === undefined) {
    throw new Error("visible is required.");
  }
  if (typeof visible !== "boolean") {
    throw new Error("visible must be a boolean.");
  }

  if (setVisible === undefined) {
    throw new Error("setVisible is required.");
  }
  if (typeof setVisible !== "function") {
    throw new Error("setVisible must be a function.");
  }
  if (setVisible.length !== 1) {
    throw new Error("setVisible must have 1 parameter.");
  }
}

/**
 * Checks the parameters passed to the EditLocationContent component.
 */
function checkParameters2(location, changed) {
  if (location === undefined) {
    throw new Error("location is required.");
  }
  if (!Array.isArray(location) || location.length !== 2) {
    throw new Error("location must be an array with 2 elements.");
  }
  if (typeof location[0] !== "string" || typeof location[1] !== "string") {
    throw new Error("location must contain 2 strings.");
  }
  if (!location[0].startsWith("/") || !location[0].endsWith("/")) {
    throw new Error("The parent folder must start and end with '/'.");
  }

  if (changed === undefined) {
    throw new Error("changed is required.");
  }
  if (typeof changed !== "function") {
    throw new Error("changed must be a function.");
  }
  if (changed.length !== 2) {
    throw new Error("changed must have 2 parameters.");
  }
}
