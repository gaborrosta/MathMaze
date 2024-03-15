import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Form, Button, Alert, Row, Col } from "react-bootstrap";
import { BACKEND_URL } from "../utils/constants";
import axios from "axios";
import { TokenContext } from "../utils/TokenContext";

function EditLocationContent({ location, mazesChanged, locationsChanged }) {
  const { t } = useTranslation();

  const { token, setToken } = useContext(TokenContext);

  const [isRequestInProgress, setIsRequestInProgress] = useState(false);

  const [parentFolder, editableLocation] = location;
  const [newLocation, setNewLocation] = useState(editableLocation);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [newLocationError, setNewLocationError] = useState("");

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const handleLocationChange = (e) => {
    setNewLocation(e.target.value);

    const regex = /^[A-Za-z0-9ÁÉÍÓÖŐÚÜŰáéíóöőúüű, .?!:-]{1,20}$/;
    if (!regex.test(e.target.value)) {
      setNewLocationError("error-rename-location-invalid-format");
    } else {
      setNewLocationError("");
    }
  }

  useEffect(() => {
    setIsSubmitDisabled(newLocationError || newLocation === editableLocation || !newLocation);
  }, [newLocation, newLocationError, editableLocation]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      parentLocation: parentFolder,
      originalLocation: editableLocation,
      newLocation: newLocation,
      token: token,
    };

    setIsRequestInProgress(true);

    //Send data
    axios.post(`${BACKEND_URL}/maze/update-location`, data, {
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      setError("");
      setToken(response.data.token);
      setSuccess("location-renamed");
      mazesChanged(response.data.mazes);
      locationsChanged(response.data.locations);
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
      setIsRequestInProgress(false);
    });
  };

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>{t("location-rename-title")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{t(error)}</Alert>}
        {success && <Alert variant="success">{t(success)}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="location">
            <Form.Label>{t("location-rename-new-name")}</Form.Label>
            <Row>
              <Col md="auto" className="mb-md-0 mb-3 d-flex align-items-center justify-content-center">
                <p className="m-0">{parentFolder}</p>
              </Col>
              <Col>
                <Form.Control 
                  type="text"
                  value={newLocation}
                  onChange={handleLocationChange}
                  aria-describedby="newLocationHelp newLocationError"
                />
              </Col>
            </Row>
            <Form.Text id="newLocationHelp" className="text-muted">
              {t("location-rename-help")}
            </Form.Text>
            {newLocationError && <><br /><Form.Text id="newLocationError" className="text-danger" aria-live="polite">{t(newLocationError)}</Form.Text></>}
          </Form.Group>
          <Button variant="primary" type="submit" disabled={isSubmitDisabled || isRequestInProgress}>
            {t("location-rename-save")}
          </Button>
        </Form>
      </Modal.Body>
    </>
  );
}

export default function EditLocation({ location, visible, setVisible, mazesChanged, locationsChanged }) {
  return (
    <Modal show={visible} onHide={() => setVisible(false)} backdrop="static">
      {visible && <EditLocationContent location={location} mazesChanged={mazesChanged} locationsChanged={locationsChanged} />}
    </Modal>
  );
}
