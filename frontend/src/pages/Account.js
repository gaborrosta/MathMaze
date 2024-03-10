import React, { useState, useEffect, useContext, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Row, Col, Alert, Button, Card, Tabs, Tab, Form, InputGroup } from "react-bootstrap";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { TokenContext } from "../utils/TokenContext";
import LoadingSpinner from "../components/LoadingSpinner";
import MazeModal from "../components/MazeModal";

export default function Account() {
  const { i18n, t } = useTranslation();

  const operations = ["operation-addition", "operation-subtraction", "operation-addition-subtraction", "operation-multiplication", "operation-division", "operation-multiplication-division"];

  useEffect(() => { document.title = t("account-title") + " | " + t("app-name"); });

  const { token, setToken } = useContext(TokenContext);
  const tokenRef = useRef(token);
  const setTokenRef = useRef(setToken);

  useEffect(() => {
    tokenRef.current = token;
    setTokenRef.current = setToken;
  }, [token, setToken]);

  const [loading, setLoading] = useState(true);
  const [mazes, setMazes] = useState(null);
  const [error, setError] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [maze, setMaze] = useState("");

  const openModal = (newMaze) => {
    setMaze(newMaze);
    setModalVisible(true);
  };

  const closeModal = () => {
    setMaze("");
    setModalVisible(false);
  };

  useEffect(() => {
    axios.get(`${BASE_URL}/maze/getAll?token=${tokenRef.current}`)
    .then(response => {
      setTokenRef.current(response.data.token);

      setTimeout(() => {
        setLoading(false);
        setMazes(response.data.mazes);
      }, 1000);
    })
    .catch(_ => {
      setError("error-unknown");
      setLoading(false);
    });
  }, []);

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [oldPasswordError, setOldPasswordError] = useState(null);
  const [newPasswordError, setNewPasswordError] = useState(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);

  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  
    if (e.target.name === "oldPassword") {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
      if (e.target.value) {
        if (!passwordRegex.test(e.target.value)) {
          setOldPasswordError("account-old-password-error");
        } else {
          setOldPasswordError("");
        }
      } else {
        setOldPasswordError("");
      }
    }
    else if (e.target.name === "newPassword") {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
      if (e.target.value) {
        if (!passwordRegex.test(e.target.value)) {
          setNewPasswordError("signup-password-error");
        } else if (e.target.value === formData.confirmPassword) {
          setConfirmPasswordError("");
          setNewPasswordError("");
        } else {
          setConfirmPasswordError("signup-confirm-password-error");
          setNewPasswordError("");
        }
      } else {
        setNewPasswordError("");

        if (!formData.confirmPassword) {
          setConfirmPasswordError("");
        }
      }
    }
    else if (e.target.name === "confirmPassword") {
      if (e.target.value !== formData.newPassword) {
        setConfirmPasswordError("signup-confirm-password-error");
      } else {
        setConfirmPasswordError("");
      }
    }
  };

  useEffect(() => {
    if (oldPasswordError || newPasswordError || confirmPasswordError || !formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      setIsSubmitDisabled(true);
    } else {
      setIsSubmitDisabled(false);
    }
  }, [oldPasswordError, newPasswordError, confirmPasswordError, formData]);

  const handleSetNewPassword = (e) => {
    e.preventDefault();

    const data = {
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword,
      token: token,
    };

    setIsRequestInProgress(true);

    //Send data
    axios.post(`${BASE_URL}/users/account-password-reset`, data, {
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      setToken(response.data);
      setPasswordError("");
      setPasswordSuccess("account-success-set-new-password");
    })
    .catch(error => {
      if (!error.response) {
        setPasswordError("error-unknown");
        return;
      }

      switch (error.response.data) {
        case "UserNotFoundException":
          setPasswordError("session-expired-log-in");
          break;
        case "InvalidCredentialsException":
          setPasswordError("error-old-password-invalid");
          break;
        case "PasswordInvalidFormatException":
          setPasswordError("error-password-invalid-format");
          break;
        default:
          setPasswordError("error-unknown-form");
          break;
      }
    })
    .finally(() => {
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: ""});
      setIsRequestInProgress(false);
    });
  }

  return (
    <>
      <center>
        <h1>{t("account-title")}</h1>
      </center>
      <p>{t("account-info")}</p>

      {error && <Alert variant="danger">{t(error)}</Alert>}

      {loading ? <LoadingSpinner /> : error ? null : <>
        <Tabs defaultActiveKey="maze" id="profile-tab" className="mb-3">
          <Tab eventKey="maze" title={t("account-mazes")}>
            {mazes && mazes.length === 0 && <Alert variant="info">{t("no-mazes")}</Alert>}

            {mazes && mazes.length > 0 &&
              <Row>
                <Col xs={12} md={4}>
                  <div className="border p-3 m-2">
                    <p>TODO...</p>
                  </div>
                </Col>
                <Col xs={12} md={8}>
                  <div className="m-2">
                    {mazes.map((maze, index) => (
                      <Card key={index} className={index < mazes.length - 1 ? "mb-3" : ""}>
                        <Card.Body>
                          <Card.Title>{t("maze-title")} #{maze.id}</Card.Title>
                          <div>
                            <p>{t("maze-description")}: {maze.description ? maze.description : "-"}</p>
                            <Row>
                              <Col>
                                <p>{t("maze-size", { height: maze.height, width: maze.width })}</p>
                                <p>{t("maze-operation-type")}: {t(operations[maze.operation])}</p>
                                <p>{t("maze-generate-range")}: {maze.numbersRangeStart}-{maze.numbersRangeEnd}</p>
                              </Col>
                              <Col>
                                <p>{t("maze-length-of-the-path", { length: maze.pathLength })}</p>
                                <p>{t("maze-generate-path-type")}: {maze.pathTypeEven ? t("maze-generate-path-type-even") : t("maze-generate-path-type-odd")}</p>
                              </Col>
                            </Row>
                            <Row>
                              <Col>
                                <Button variant="primary" onClick={() => openModal(maze)}>{t("maze-edit-details")}</Button>
                              </Col>
                              <Col>
                                <p className="text-end">{t("maze-created-at", { date: new Date(maze.createdAt).toLocaleString(i18n.resolvedLanguage) })}</p>
                              </Col>
                            </Row>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </Col>
              </Row>
            }
            <MazeModal data={maze} visible={modalVisible} setVisible={closeModal} />
          </Tab>
          <Tab eventKey="settings" title={t("account-settings")}>
            <Col>
              <p>{t("account-password-change")}</p>
              {passwordError && <Alert variant="danger">{t(passwordError)}</Alert>}
              {passwordSuccess && <Alert variant="success">{t(passwordSuccess)}</Alert>}
              <Form onSubmit={handleSetNewPassword}>
                <Form.Group className="mb-3" controlId="oldPassword">
                  <Form.Label>{t("account-old-password")}</Form.Label>
                  <InputGroup>
                    <Form.Control required type={showOldPassword ? "text" : "password"} placeholder={t("account-old-password-placeholder")} name="oldPassword" value={formData.oldPassword} onChange={handleChange} aria-describedby="oldPasswordError" />
                    <Button variant="outline-secondary" onClick={() => setShowOldPassword(!showOldPassword)}>{showOldPassword ? t("password-hide") : t("password-show")}</Button>
                  </InputGroup>
                  {oldPasswordError && <Form.Text id="oldPasswordError" className="text-danger" aria-live="polite">{t(oldPasswordError)}</Form.Text>}
                </Form.Group>
                <Form.Group className="mb-3" controlId="newPassword">
                  <Form.Label>{t("account-new-password")}</Form.Label>
                  <InputGroup>
                    <Form.Control required type={showNewPassword ? "text" : "password"} placeholder={t("account-new-password-placeholder")} name="newPassword" value={formData.newPassword} onChange={handleChange} aria-describedby="newPasswordHelp newPasswordError" />
                    <Button variant="outline-secondary" onClick={() => setShowNewPassword(!showNewPassword)}>{showNewPassword ? t("password-hide") : t("password-show")}</Button>
                  </InputGroup>
                  <Form.Text id="newPasswordHelp" className="text-muted">
                    {t("signup-password-help")}
                  </Form.Text>
                  {newPasswordError && <><br /><Form.Text id="newPasswordError" className="text-danger" aria-live="polite">{t(newPasswordError)}</Form.Text></>}
                </Form.Group>
                <Form.Group className="mb-3" controlId="confirmPassword">
                  <Form.Label>{t("account-confirm-new-password")}</Form.Label>
                  <InputGroup>
                    <Form.Control required type={showConfirmPassword ? "text" : "password"} placeholder={t("account-confirm-new-password-placeholder")} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} aria-describedby="confirmPasswordHelp confirmPasswordError" />
                    <Button variant="outline-secondary" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? t("password-hide") : t("password-show")}</Button>
                  </InputGroup>
                  {confirmPasswordError && <Form.Text id="confirmPasswordError" className="text-danger" aria-live="polite">{t(confirmPasswordError)}</Form.Text>}
                </Form.Group>
                <Button className="mb-3" variant="primary" type="submit" disabled={isSubmitDisabled || isRequestInProgress}>
                  {t("set-new-password-title")}
                </Button>
              </Form>
            </Col>
          </Tab>
        </Tabs>
      </>}
    </>
  );
}
