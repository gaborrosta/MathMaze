import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Modal, Form, Button, Alert, Row, Col } from "react-bootstrap";
import pdfGenerator from "../utils/pdfGenerator";
import LocationList from "./LocationList";
import { BACKEND_URL, FRONTEND_URL } from "../utils/constants";
import axios from "axios";
import { TokenContext } from "../utils/TokenContext";

function MazeModalContent({ mazeData, locations, mazeChanged, locationsChanged }) {
  const { t } = useTranslation();

  const { token, setToken } = useContext(TokenContext);

  const [actualData, setActualData] = useState(mazeData);
  const [actualLocations, setActualLocations] = useState(locations);

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);

  const [formData, setFormData] = useState({
    selectedLocation: actualData.location,
    description: actualData.description,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [descriptionError, setDescriptionError] = useState("");

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, description: value });

    const regex = /^[A-Za-z0-9ÁÉÍÓÖŐÚÜŰáéíóöőúüű, .?!:-]{0,100}$/;
    if (!regex.test(value)) {
      setDescriptionError("error-invalid-description");
    } else {
      setDescriptionError("");
    }
  }

  const handleLocationChange = (location) => {
    setFormData({ ...formData, selectedLocation: location });
  }

  useEffect(() => {
    setIsSubmitDisabled(descriptionError || (formData.description === actualData.description && formData.selectedLocation === actualData.location));
  }, [descriptionError, formData, actualData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      mazeId: actualData.id,
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
      setActualData(response.data.maze);
      setActualLocations(response.data.locations);

      if (mazeChanged !== undefined) {
        mazeChanged(response.data.maze);
      }

      if (locationsChanged !== undefined) {
        locationsChanged(response.data.locations);
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
        case "DescriptionInvalidFormatException":
          setError("error-save-maze-description-invalid-format");
          break;
        case "LocationInvalidFormatException":
          setError("error-save-maze-location-invalid-format");
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

  const [parentLocation, setParentLocation] = useState("/");
  const [newLocation, setNewLocation] = useState("");
  const [addButtonDisabled, setAddButtonDisabled] = useState(false);

  const handleAddLocation = () => {
    const newLocationList = [...actualLocations, (parentLocation + newLocation + "/")];
    setActualLocations(newLocationList);
    setParentLocation("/");
    setNewLocation("");
  };

  useEffect(() => {
    const regex = /^[A-Za-z0-9ÁÉÍÓÖŐÚÜŰáéíóöőúüű, .?!:-]{1,20}$/;
    setAddButtonDisabled(!regex.test(newLocation) || actualLocations.includes(parentLocation + newLocation + "/"));
  }, [parentLocation, newLocation, actualLocations]);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>{t("maze-title")} #{actualData.id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Button onClick={() => pdfGenerator(actualData, t)}>{t("maze-generated-download-pdf")}</Button>
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
                <LocationList locations={actualLocations} onLocationChange={handleLocationChange} selectedLocation={formData.selectedLocation} />
              </Form.Group>
              <Row className="mb-3 pb-1 border">
                <p className="text-muted mb-0">{t("location-add")}</p>
                <Col xs={12} md className="mb-md-0 mb-3">
                  <Form.Label>{t("location-add-parent-location")}</Form.Label>
                  <Form.Control as="select" value={parentLocation} onChange={(e) => setParentLocation(e.target.value)}>
                    {actualLocations.map((location, index) => (
                      <option key={index} value={location}>
                        {location}
                      </option>
                    ))}
                  </Form.Control>
                </Col>
                <Col xs={12} md className="mb-md-0 mb-3">
                  <Form.Label>{t("location-add-new-location")}</Form.Label>
                  <Form.Control type="text" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} />
                </Col>
                <Col xs={12} md="auto" className="d-flex align-items-end">
                  <Button variant="primary" onClick={handleAddLocation} disabled={addButtonDisabled || isRequestInProgress}>{t("location-add-save")}</Button>
                </Col>
              </Row>
              <Button className="mb-3" variant="primary" type="submit" disabled={isSubmitDisabled || isRequestInProgress}>
                {t("maze-save")}
              </Button>
            </Form>
          </>
        :
          <>
            <p>{t("maze-generated-not-logged-in")} <Link to={"/solve-maze?id=" + actualData.id } >{FRONTEND_URL + "/solve-maze?id=" + actualData.id}</Link></p>
          </>
        }
      </Modal.Body>
    </>
  );
}

export default function MazeModal({ data, visible, setVisible, locations, mazeChanged, locationsChanged }) {
  return (
    <Modal show={visible} onHide={() => setVisible(false)} backdrop="static">
      {visible && <MazeModalContent mazeData={data} locations={locations} mazeChanged={mazeChanged} locationsChanged={locationsChanged} />}
    </Modal>
  );
}
