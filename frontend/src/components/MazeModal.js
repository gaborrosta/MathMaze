import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Modal, Form, Button, Alert, Row, Col } from "react-bootstrap";
import axios from "axios";
import { BACKEND_URL, FRONTEND_URL, ANYTHING_REGEX } from "../utils/constants";
import TokenContext from "../utils/TokenContext";
import BaseForm from "../utils/BaseForm";
import LocationsList from "./LocationsList";
import PDFButtons from "./PDFButtons";

/**
 * MazeModal renders a modal to edit a maze or just see the info about it.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {boolean} props.visible - Whether the modal is visible.
 * @param {Function} props.setVisible - The function to set the visibility of the modal.
 * @param {Object} props.data - The maze data to edit.
 * @param {Array} props.locations - The locations list.
 * @param {Function} props.changed - The function to call when the maze and locations have changed. The function receives the new maze and locations. It is optional.
 *
 * @returns {React.Element} The MazeModal component.
 */
export default function MazeModal({ visible, setVisible, data, locations, changed }) {
  //Check the parameters
  checkParameters1(visible, setVisible);


  //Token
  const { token } = useContext(TokenContext);


  //Render the component
  return (
    <Modal show={visible} onHide={() => setVisible(false)} backdrop={!token ? "static" : true} dialogClassName={!token ? "" : "modal-container"}>
      {visible &&
        (token ? <MazeModalContentAuthenticated mazeData={data} locations={locations} changed={changed} /> : <MazeModalContentNotAuthenticated mazeData={data} />)
      }
    </Modal>
  );
}


/**
 * MazeModalContentAuthenticated renders the form to edit a maze if the user is logged in.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.data - The maze data to edit.
 * @param {Array} props.locations - The locations list.
 * @param {Function} props.changed - The function to call when the maze and locations have changed. The function receives the new maze and locations. It is optional.
 *
 * @returns {React.Element} The MazeModalContentAuthenticated component.
 */
function MazeModalContentAuthenticated({ mazeData, locations, changed }) {
  //Check the parameters
  checkParameters2(mazeData);
  checkParameters3(locations, changed);


  //Localisation
  const { t } = useTranslation();


  //Token
  const { token, setToken } = useContext(TokenContext);


  //Actual maze and locations data
  const [actualData, setActualData] = useState(mazeData);
  const [actualLocations, setActualLocations] = useState(locations);



  //Initial data and validation schema
  const initialData = {
    description: actualData.description,
    selectedLocation: actualData.location,
    isPrivate: actualData.isPrivate,
    passcode: actualData.passcode,
  };
  const validationSchema = {
    description: {
      regex: new RegExp(/^[A-Za-z0-9ÁÉÍÓÖŐÚÜŰáéíóöőúüű, .?!:-]{0,100}$/),
      regexError: "error-invalid-description",
    },
    selectedLocation: {
      required: true,
      regex: ANYTHING_REGEX,
      regexError: "-",
    },
    isPrivate: {
      required: true,
      regex: ANYTHING_REGEX,
      regexError: "-",
    },
    passcode: {
      regex: new RegExp(/^[0-9]{8,20}$/),
      regexError: "error-invalid-passcode",
    },
  };


  //Handle the change request
  const handleSubmit = (formData, setError, setSuccess, setFormData, done) => {
    const data = {
      mazeId: actualData.id,
      description: formData.description,
      location: formData.selectedLocation,
      isPrivate: formData.isPrivate,
      passcode: formData.isPrivate ? "" : formData.passcode,
      token: token,
    };

    if (data.isPrivate) {
      setFormData({ ...formData, passcode: "" });
    }

    //Send data
    axios.post(`${BACKEND_URL}/maze/update`, data, {
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      setError("");
      setSuccess("maze-updated");

      setToken(response.data.token);
      setActualData(response.data.maze);
      setActualLocations(response.data.locations);

      if (changed !== undefined) {
        changed(response.data.maze, response.data.locations);
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
      done();
    });
  };


  //New folder section visible?
  const [showNewFolder, setShowNewFolder] = useState(false);

  //Change new folder section's visibility
  const handleShowNewFolder = () => setShowNewFolder(!showNewFolder);

  //Parent location and new location
  const [parentLocation, setParentLocation] = useState("/");
  const [newLocation, setNewLocation] = useState("");

  //New location error
  const [newLocationError, setNewLocationError] = useState("");

  //Add button disabled?
  const [addButtonDisabled, setAddButtonDisabled] = useState(false);

  //Handle add location
  const handleAddLocation = () => {
    const newLocationsList = [...actualLocations, (parentLocation + newLocation + "/")];
    setActualLocations(newLocationsList);
    setParentLocation("/");
    setNewLocation("");
  };

  //Check the errors
  useEffect(() => {
    const regex = /^[A-Za-z0-9ÁÉÍÓÖŐÚÜŰáéíóöőúüű, .?!:-]{1,20}$/;
    if (newLocation !== "") {
      if (!regex.test(newLocation)) {
        setNewLocationError("error-rename-location-invalid-format");
        setAddButtonDisabled(true);
      } else if (actualLocations.includes(parentLocation + newLocation + "/")) {
        setNewLocationError("error-save-location-already-exists");
        setAddButtonDisabled(true);
      } else {
        setNewLocationError("");
        setAddButtonDisabled(false);
      }
    } else {
      setNewLocationError("");
      setAddButtonDisabled(true);
    }
  }, [parentLocation, newLocation, actualLocations]);


  //Create the form
  const form = (formData, handleChange, fieldErrors, error, success, submitButton) => {
    return (
      <>
        <Form.Group className="mb-3" controlId="description">
          <Form.Label>{t("maze-description")}</Form.Label>
          <Form.Control
            name="description"
            type="text"
            value={formData.description}
            onChange={handleChange}
            aria-describedby="descriptionHelp fieldErrors.description"
          />
          <Form.Text id="descriptionHelp" className="text-muted">
            {t("description-help")}
          </Form.Text>
          {fieldErrors.description && <><br /><Form.Text className="text-danger">{t(fieldErrors.description)}</Form.Text></>}
        </Form.Group>
        <Form.Group className="mb-3" controlId="location">
          <Form.Label>{t("location")}</Form.Label>
          <LocationsList locations={actualLocations} onLocationChange={(location) => handleChange({ target: { name: "selectedLocation", value: location }})} selectedLocation={formData.selectedLocation} />
        </Form.Group>
        <Button variant="link" onClick={handleShowNewFolder} className="mb-3">
          <span className={`mr-2 pr-2 arrow ${showNewFolder ? "rotate" : ""}`}>
            &#9654;
          </span>
          {t("location-add")}
        </Button>
        {showNewFolder && (
          <Row className="mb-3 pb-1 border">
            <Col xs={12} md className="mb-md-0 mb-3">
              <Form.Group className="mb-3" controlId="parentLocation">
                <Form.Label>{t("location-add-parent-location")} <span className="text-danger">*</span></Form.Label>
                <Form.Control as="select" value={parentLocation} onChange={(e) => setParentLocation(e.target.value)}>
                  {actualLocations.map((location, index) => (
                    <option key={index} value={location}>
                      {location}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col xs={12} md className="mb-md-0 mb-3">
              <Form.Group className="mb-3" controlId="newLocation">
                <Form.Label>{t("location-add-new-location")} <span className="text-danger">*</span></Form.Label>
                <Form.Control type="text" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} aria-describedby="newLocationError" />
                {newLocationError && <Form.Text className="text-danger">{t(newLocationError)}</Form.Text>}
              </Form.Group>
            </Col>
            <Col xs={12} md="auto" className="d-flex align-items-center">
              <Button variant="primary" onClick={handleAddLocation} disabled={addButtonDisabled} className="mt-3">{t("location-add-save")}</Button>
            </Col>
          </Row>
        )}
        <Form.Group className="mb-3" controlId="isPrivate">
          <Form.Label>{t("maze-visibility")}</Form.Label>
          <Form.Check
            type="switch"
            label={!formData.isPrivate ? t("maze-public") : t("maze-private")}
            checked={!formData.isPrivate}
            onChange={(e) => handleChange({ target: { name: "isPrivate", value: !e.target.checked }})}
            aria-describedby="isPrivateHelp"
          />
          <Form.Text id="isPrivateHelp" className="text-muted">
            {t("maze-is-private-help")}
          </Form.Text>
        </Form.Group>
        {!formData.isPrivate &&
          <Form.Group className="mb-3" controlId="passcode">
            <Form.Label>{t("maze-passcode")}</Form.Label>
            <Form.Control
              name="passcode"
              type="text"
              value={formData.passcode}
              onChange={handleChange}
              aria-describedby="passcodeHelp fieldErrors.passcode"
            />
            <Form.Text id="passcodeHelp" className="text-muted">
              {t("maze-passcode-help")}
            </Form.Text>
            {fieldErrors.passcode && <><br /><Form.Text className="text-danger">{t(fieldErrors.passcode)}</Form.Text></>}
          </Form.Group>
        }
        {error && <Alert variant="danger">{t(error)}</Alert>}
        {success && <Alert variant="success">{t(success)}</Alert>}
        {submitButton}
      </>
    );
  };


  //Render the component
  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>{t("maze-title")} #{actualData.id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col xs={12} md={6}>
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
            <PDFButtons actualData={actualData} />
          </Col>
          <Col xs={12} md={6}>
            <hr className="until-md" />
            <p>{t("maze-can-edit")}</p>
            <BaseForm
              onSubmit={handleSubmit}
              initialData={initialData}
              validationSchema={validationSchema}
              form={form}
              buttonText="maze-save"
              extraCheckForSubmitButton={(formData) => {
                return formData.description === actualData.description &&
                  formData.selectedLocation === actualData.location &&
                  formData.isPrivate === actualData.isPrivate &&
                  formData.passcode === actualData.passcode;
              }}
            />
          </Col>
        </Row>
      </Modal.Body>
    </>
  );
}


/**
 * MazeModalContentNotAuthenticated renders the info about a maze if the user is not logged in.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.mazeData - The maze data.
 *
 * @returns {React.Element} The MazeModalContentNotAuthenticated component.
 */
function MazeModalContentNotAuthenticated({ mazeData }) {
  //Check the parameters
  checkParameters2(mazeData);


  //Localisation
  const { t } = useTranslation();


  //Render the component
  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>{t("maze-title")} #{mazeData.id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="info">
          {t("maze-generated-not-logged-in")} <Link to={"/solve-maze?id=" + mazeData.id } >{FRONTEND_URL + "/solve-maze?id=" + mazeData.id}</Link>
        </Alert>
        <hr />
        <PDFButtons actualData={mazeData} />
      </Modal.Body>
    </>
  );
}


/**
 * Checks the parameters passed to the MazeModal component.
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
 * Checks the parameters passed to the MazeModalContent components.
 */
function checkParameters2(mazeData) {
  if (mazeData === undefined) {
    throw new Error("mazeData is required.");
  }
  if (typeof mazeData !== "object") {
    throw new Error("mazeData must be an object.");
  }
  if (mazeData.id === undefined) {
    throw new Error("mazeData.id is required.");
  }
  if (typeof mazeData.id !== "number") {
    throw new Error("mazeData.id must be a number.");
  }
  if (mazeData.description === undefined) {
    throw new Error("mazeData.description is required.");
  }
  if (typeof mazeData.description !== "string") {
    throw new Error("mazeData.description must be a string.");
  }
  if (mazeData.location === undefined) {
    throw new Error("mazeData.location is required.");
  }
  if (typeof mazeData.location !== "string") {
    throw new Error("mazeData.location must be a string.");
  }
  if (mazeData.isPrivate === undefined) {
    throw new Error("mazeData.isPrivate is required.");
  }
  if (typeof mazeData.isPrivate !== "boolean") {
    throw new Error("mazeData.isPrivate must be a boolean.");
  }
  if (mazeData.passcode === undefined) {
    throw new Error("mazeData.passcode is required.");
  }
  if (typeof mazeData.passcode !== "string") {
    throw new Error("mazeData.passcode must be a string.");
  }
}

/**
 * Checks the parameters passed to the MazeModalContentAuthenticated component.
 */
function checkParameters3(locations, changed) {
  if (locations === undefined) {
    throw new Error("locations is required.");
  }
  if (!Array.isArray(locations)) {
    throw new Error("locations must be an array.");
  }
  if (locations.some(location => typeof location !== "string")) {
    throw new Error("locations must be an array of strings.");
  }
  if (locations.some(location => !location.startsWith("/") || !location.endsWith("/"))) {
    throw new Error("locations must be an array of strings starting and ending with a slash.");
  }

  if (changed !== undefined) {
    if (typeof changed !== "function") {
      throw new Error("changed must be a function.");
    }
    if (changed.length !== 2) {
      throw new Error("changed must have 2 parameters.");
    }
  }
}
