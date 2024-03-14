import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import pdfGenerator from "../utils/pdfGenerator";
import LocationList from "./LocationList";
import { BACKEND_URL, FRONTEND_URL } from "../utils/constants";
import axios from "axios";
import { TokenContext } from "../utils/TokenContext";

function MazeModalContent({ mazeData, locations, mazeChanged }) {
  const { t } = useTranslation();

  const { token, setToken } = useContext(TokenContext);

  const [originalData, setOriginalData] = useState(mazeData);

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);

  const [formData, setFormData] = useState({
    selectedLocation: originalData.location,
    description: originalData.description,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [descriptionError, setDescriptionError] = useState("");

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, description: value });

    const regex = /^[A-Za-z0-9ÁÉÍÓÖŐÚÜŰáéíóöőúüű, .?!:-]{1,100}$/;
    if (value && !regex.test(value)) {
      setDescriptionError("error-invalid-description");
    } else {
      setDescriptionError("");
    }
  }

  const handleLocationChange = (location) => {
    setFormData({ ...formData, selectedLocation: location });
  }

  useEffect(() => {
    setIsSubmitDisabled(descriptionError || (formData.description === originalData.description && formData.selectedLocation === originalData.location));
  }, [descriptionError, formData, originalData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      mazeId: originalData.id,
      description: formData.description,
      location: formData.selectedLocation,
      token: token,
    };

    setIsRequestInProgress(true);

    //Send data
    axios.post(`${BACKEND_URL}/maze/update`, data, {
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      setError("");
      setToken(response.data.token);
      setSuccess("maze-updated");
      setOriginalData(response.data.maze);

      if (mazeChanged !== undefined) {
        mazeChanged(response.data.maze);
      }
    })
    .catch(error => {
      setSuccess("");

      if (!error.response) {
        setError("error-unknown");
        return;
      }

      switch (error.response.data) {
        case "UserNotFoundException":
          setError("error-save-maze-user-not-found");
          break;
        case "InvalidMazeIdException":
          setError("error-save-maze-invalid-id");
          break;
        case "MazeOwnerException":
          setError("error-save-maze-owner");
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
        <Modal.Title>{t("maze-title")} #{originalData.id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Button onClick={() => pdfGenerator(originalData, t)}>{t("maze-generated-download-pdf")}</Button>
        <hr />
        {token ?
          <>
            <p>{t("maze-can-edit")}</p>
            {error && <Alert variant="danger">{t(error)}</Alert>}
            {success && <Alert variant="success">{t(success)}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="description">
                <Form.Label>{t("maze-description")}</Form.Label>
                <Form.Control 
                  name="description" 
                  type="text" 
                  value={formData.description} 
                  onChange={handleDescriptionChange} 
                  aria-describedby="descriptionHelp descriptionError"
                />
                <Form.Text id="descriptionHelp" className="text-muted">
                  {t("description-help")}
                </Form.Text>
                {descriptionError && <><br /><Form.Text className="text-danger">{t(descriptionError)}</Form.Text></>}
              </Form.Group>
              <Form.Group className="mb-3" controlId="location">
                <Form.Label>{t("location")}</Form.Label>
                <LocationList locations={locations} onLocationChange={handleLocationChange} />
              </Form.Group>
              <Button className="mb-3" variant="primary" type="submit" disabled={isSubmitDisabled || isRequestInProgress}>
                {t("maze-save")}
              </Button>
            </Form>
          </>
        :
          <>
            <p>{t("maze-generated-not-logged-in")} <Link to={"/solve-maze?id=" + originalData.id } >{FRONTEND_URL + "/solve-maze?id=" + originalData.id}</Link></p>
          </>
        }
      </Modal.Body>
    </>
  );
}

export default function MazeModal({ data, visible, setVisible, locations, mazeChanged }) {
  return (
    <Modal show={visible} onHide={() => setVisible(false)} backdrop="static">
      {visible && <MazeModalContent mazeData={data} locations={locations} mazeChanged={mazeChanged} />}
    </Modal>
  );
}
