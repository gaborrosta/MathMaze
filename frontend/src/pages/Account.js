import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Row, Col, Alert, Button, Card, Tabs, Tab, Form, InputGroup, Dropdown, Pagination } from "react-bootstrap";
import { X } from "react-bootstrap-icons";
import { BACKEND_URL } from "../utils/constants";
import axios from "axios";
import TokenContext from "../utils/TokenContext";
import LoadingSpinner from "../components/LoadingSpinner";
import MazeModal from "../components/MazeModal";
import LocationList from "../components/LocationList";
import EditLocation from "../components/EditLocation";
import AccountSolutionsTab from "../components/AccountSolutionsTab";

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

  const [editLocationModalVisible, setEditLocationModalVisible] = useState(false);
  const [editLocation, setEditLocation] = useState("");

  const [locations, setLocations] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("/");

  const openModal = (newMaze) => {
    setMaze(newMaze);
    setModalVisible(true);
  };

  const closeModal = () => {
    setMaze("");
    setModalVisible(false);
  };

  const [sortOrder, setSortOrder] = useState("desc");
  const [sortedMazes, setSortedMazes] = useState(null);
  const [pageNumbers, setPageNumbers] = useState([1]);
  const [currentPage, setCurrentPage] = useState(1);
  const [actualMazes, setActualMazes] = useState(null);

  const handleSortOrderChange = useCallback((order) => {
    if (!mazes) return;

    let newSortedMazes;
    if (order === "asc") {
      newSortedMazes = [...mazes].filter(maze => maze.location === selectedLocation).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      newSortedMazes = [...mazes].filter(maze => maze.location === selectedLocation).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const newPageNumbers = [];
    for (let i = 1; i <= Math.ceil(newSortedMazes.length / 10); i++) {
      newPageNumbers.push(i);
    }

    setActualMazes(newSortedMazes.slice(0, 10));
    setCurrentPage(1);
    setPageNumbers(newPageNumbers);
    setSortedMazes(newSortedMazes);
    setSortOrder(order);
  }, [mazes, selectedLocation]);

  const handelPageChange = useCallback((pageNumber) => {
    setActualMazes(sortedMazes.slice((pageNumber - 1) * 10, pageNumber * 10));

    setCurrentPage(pageNumber);
  }, [sortedMazes]);

  useEffect(() => {
    if (mazes) {
      handleSortOrderChange(sortOrder);
    }
  }, [mazes, handleSortOrderChange, sortOrder]);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/maze/get-all?token=${tokenRef.current}`)
    .then(response => {
      setTokenRef.current(response.data.token);

      setTimeout(() => {
        setLoading(false);
        setMazes(response.data.mazes);
        setLocations(response.data.locations);
      }, 1000);
    })
    .catch(_ => {
      setError("error-unknown");
      setLoading(false);
    });
  }, []);

  const mazeChanged = (newMaze) => {
    setMazes(mazes.map(maze => maze.id === newMaze.id ? newMaze : maze));
  }

  const mazesChanged = (newMazes) => {
    setMazes(newMazes);
  }

  const locationsChanged = (newLocations) => {
    if (!newLocations.includes(selectedLocation)) {
      setSelectedLocation("/");
    }
    setLocations(newLocations);
  }

  const onEditLocation = (location) => {
    setEditLocation(location);
    setEditLocationModalVisible(true);
  }

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
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)[A-Za-z\d\W]{8,20}$/;
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
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)[A-Za-z\d\W]{8,20}$/;
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
    axios.post(`${BACKEND_URL}/users/account-password-reset`, data, {
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

  const [key, setKey] = useState("maze");
  const [solutionsTabs, setSolutionsTabs] = useState([]);
  const [downloadedSolutions, setDownloadedSolutions] = useState({});
  const [downloadError, setDownloadError] = useState("");

  const addSolutionTab = (id) => {
    if (!solutionsTabs.includes(id)) {
      setSolutionsTabs([...solutionsTabs, id]);
    }

    if (!downloadedSolutions[id]) {
      axios.get(`${BACKEND_URL}/maze/get-solutions?token=${token}&mazeId=${id}`)
      .then(response => {
        setTimeout(() => {
          setToken(response.data.token);
          setDownloadedSolutions({ ...downloadedSolutions, [id]: { data: response.data.solutions, selectedOption: null, selectedIndex: -1 }});
        }, 1000);
      })
      .catch(error => {
        if (!error.response) {
          setDownloadError("error-unknown");
          return;
        }
  
        switch (error.response.data) {
          case "InvalidMazeIdException":
            setDownloadError("error-save-maze-invalid-id");
            break;
          case "MazeOwnerException":
            setDownloadError("error-account-maze-owner");
            break;
          default:
            setDownloadError("error-unknown");
            break;
        }
      });
    }

    window.scrollTo({top: 0, left: 0, behavior: "instant" });
    setKey(id);
  };

  const removeSolutionTab = (id) => {
    setSolutionsTabs(solutionsTabs.filter(tab => tab !== id));
    if (key === id) {
      setKey("maze");
    }
  };

  return (
    <>
      <center>
        <h1>{t("account-title")}</h1>
      </center>
      <p>{t("account-info")}</p>

      {error && <Alert variant="danger">{t(error)}</Alert>}

      {loading ? <LoadingSpinner /> : error ? null : <>
        {solutionsTabs.length > 0 && 
          <div className="text-end">
            <Button className="mb-3" onClick={() => {
              setKey("maze");
              setSolutionsTabs([]);
              setDownloadedSolutions({});
            }}>
              {t("account-close-opened-solutions")}
            </Button>
          </div>
        }
        <Tabs id="profile-tab" className="mb-3" activeKey={key} onSelect={(k) => setKey(k)}>
          <Tab eventKey="maze" title={t("account-mazes")}>
            {mazes && mazes.length === 0 && <Alert variant="info">{t("no-mazes")}</Alert>}

            {actualMazes && mazes.length > 0 &&
              <Row>
                <Col xs={12} md={4}>
                  <div className="border p-3 m-2">
                    <p>{t("account-locations")}</p>
                    <LocationList locations={locations} onLocationChange={setSelectedLocation} selectedLocation={selectedLocation} onEdit={onEditLocation} />
                    <Alert variant="info" className="mt-3">{t("account-locations-info")}</Alert>
                  </div>
                </Col>
                <Col xs={12} md={8}>
                  <div className="d-flex justify-content-end m-2">
                    <Dropdown onSelect={handleSortOrderChange}>
                      <Dropdown.Toggle id="order">
                        {t(`sort-order-${sortOrder}`)}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item eventKey="asc">{t("sort-order-asc")}</Dropdown.Item>
                        <Dropdown.Item eventKey="desc">{t("sort-order-desc")}</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                  <div className="m-2">
                    {pageNumbers.length > 1 ? <>
                      <Pagination className="justify-content-center">
                        {pageNumbers
                          .filter(num => num === 1 || num === pageNumbers.length || num === currentPage || num === currentPage - 1 || num === currentPage + 1)
                          .map(num => (
                            <Pagination.Item key={num} active={num === currentPage} onClick={() => handelPageChange(num)}>
                              {num}
                            </Pagination.Item>
                          ))}
                      </Pagination>
                    </> : null}
                    {actualMazes.map((maze, index) => (
                      <Card key={index} className="mb-3">
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
                            <div className="mb-3">
                              <p>{t("maze-solved-by", { count: maze.solved, number: maze.solved })}</p>
                              {maze.solved > 0 && <Button variant="primary" onClick={() => addSolutionTab(maze.id)}>{t("maze-check-solutions", { count: maze.solved })}</Button>}
                            </div>
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
                    {pageNumbers.length > 1 ? <>
                      <Pagination className="justify-content-center">
                        {pageNumbers
                          .filter(num => num === 1 || num === pageNumbers.length || num === currentPage || num === currentPage - 1 || num === currentPage + 1)
                          .map(num => (
                            <Pagination.Item key={num} active={num === currentPage} onClick={() => handelPageChange(num)}>
                              {num}
                            </Pagination.Item>
                          ))}
                      </Pagination>
                    </> : null}
                  </div>
                </Col>
              </Row>
            }
            <MazeModal data={maze} visible={modalVisible} setVisible={closeModal} locations={locations} mazeChanged={mazeChanged} locationsChanged={locationsChanged} />
            <EditLocation location={editLocation} visible={editLocationModalVisible} setVisible={setEditLocationModalVisible} mazesChanged={mazesChanged} locationsChanged={locationsChanged} />
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
          {solutionsTabs.map(tab => (
            <Tab 
              eventKey={tab}
              title={
                <div>
                  {t("account-solution-for-maze-tab", { id: tab })}
                  <X className="ms-2 border icon" size={22}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSolutionTab(tab);
                    }}
                  />
                </div>
              } 
              key={tab}
            >
              <AccountSolutionsTab data={downloadedSolutions[tab]} error={downloadError} updateData={(newData) => {
                setDownloadedSolutions({ ...downloadedSolutions, [tab]: newData});
              }} />
            </Tab>
          ))}
        </Tabs>
      </>}
    </>
  );
}
