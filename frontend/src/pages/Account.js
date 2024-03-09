import React, { useState, useEffect, useContext, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Row, Col, Alert, Button, Card } from "react-bootstrap";
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

  return (
    <>
      <center>
        <h1>{t("account-title")}</h1>
      </center>
      <p>{t("account-info")}</p>

      {error && <Alert variant="danger">{t(error)}</Alert>}

      {loading && <LoadingSpinner />}

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
    </>
  );
}
