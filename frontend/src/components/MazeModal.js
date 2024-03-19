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
    isPrivate: actualData.isPrivate,
    passcode: actualData.passcode,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [descriptionError, setDescriptionError] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

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

  const handlePasscodeChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, passcode: value });

    const regex = /^[0-9]{8,20}$/;
    if (value && !regex.test(value)) {
      setPasscodeError("error-invalid-passcode");
    } else {
      setPasscodeError("");
    }
  }

  useEffect(() => {
    setIsSubmitDisabled(descriptionError || passcodeError ||
      (formData.description === actualData.description && formData.selectedLocation === actualData.location && formData.isPrivate === actualData.isPrivate && formData.passcode === actualData.passcode));
  }, [descriptionError, passcodeError, formData, actualData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      mazeId: actualData.id,
      description: formData.description,
      location: formData.selectedLocation,
      isPrivate: formData.isPrivate,
      passcode: formData.isPrivate ? "" : formData.passcode,
      token: token,
    };

    if (data.isPrivate) {
      formData.passcode = "";
    }

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
        case "PasscodeInvalidFormatException":
          setError("error-save-maze-passcode-invalid-format");
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

  const [isGenerating, setIsGenerating] = useState(false);

  const handleClick = async () => {
    setIsGenerating(true);
    await pdfGenerator(actualData, t);
    setIsGenerating(false);
  };

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>{t("maze-title")} #{actualData.id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Button onClick={handleClick} disabled={isGenerating}>
          {t("maze-generated-download-pdf")}
        </Button>
        <hr />
        {token ?
          <>
            {!actualData.isPrivate ? <>
              <Alert variant="info">
                {t("maze-public-info")} <Link to={"/solve-maze?id=" + actualData.id}>{FRONTEND_URL + "/solve-maze?id=" + actualData.id}</Link>
                <br />
                {actualData.passcode !== "" ? t("maze-public-passcode", { passcode: actualData.passcode } ) : t("maze-public-no-passcode")}
              </Alert>
            </> : <>
              <Alert variant="info">
                {t("maze-private-info")} <Link to={"/solve-maze?id=" + actualData.id}>{FRONTEND_URL + "/solve-maze?id=" + actualData.id}</Link>
              </Alert>
            </>}
            <hr />
            <p>{t("maze-can-edit")}</p>
            <Form onSubmit={handleSubmit}>
              {error && <Alert variant="danger">{t(error)}</Alert>}
              {success && <Alert variant="success">{t(success)}</Alert>}
              <Button className="mb-3" variant="primary" type="submit" disabled={isSubmitDisabled || isRequestInProgress}>
                {t("maze-save")}
              </Button>
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
              <Form.Group className="mb-3" controlId="isPrivate">
                <Form.Label>{t("maze-visibility")}</Form.Label>
                <Form.Check
                  type="switch"
                  label={!formData.isPrivate ? t("maze-public") : t("maze-private")}
                  checked={!formData.isPrivate}
                  onChange={(e) => setFormData({ ...formData, isPrivate: !e.target.checked })}
                  aria-describedby="isPrivateHelp"
                />
                <Form.Text id="isPrivateHelp" className="text-muted">
                  {t("maze-is-private-help")}
                </Form.Text>
              </Form.Group>
              {!formData.isPrivate ? <>
                <Form.Group className="mb-3" controlId="passcode">
                  <Form.Label>{t("maze-passcode")}</Form.Label>
                  <Form.Control 
                    type="text"
                    value={formData.passcode}
                    onChange={handlePasscodeChange}
                    aria-describedby="passcodeHelp passcodeError"
                  />
                  <Form.Text id="passcodeHelp" className="text-muted">
                    {t("maze-passcode-help")}
                  </Form.Text>
                  {passcodeError && <><br /><Form.Text className="text-danger">{t(passcodeError)}</Form.Text></>}
                </Form.Group>
              </> : null}
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
