import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Spinner, Row, Col, Alert, Button, Card } from "react-bootstrap";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { authObserver } from "../utils/auth";

export default function Account() {
  const { i18n, t } = useTranslation();

  const operations = ["operation-addition", "operation-subtraction", "operation-addition-subtraction", "operation-multiplication", "operation-division", "operation-multiplication-division"];

  useEffect(() => { 
    document.title = t("account-title") + " | " + t("app-name"); 
  });

  const [token, setToken] = useState(sessionStorage.getItem("token"));

  const [loading, setLoading] = useState(true);
  const [mazes, setMazes] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let privateToken = sessionStorage.getItem("token");

    axios.get(`${BASE_URL}/maze/getAll?token=${privateToken}`)
    .then(response => {
      privateToken = response.data.token;
      setToken(privateToken);
      authObserver.publish("token", privateToken);

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

      {error && <Alert variant="danger">{t(error)}</Alert>}

      {loading && 
        <>
          <Spinner animation="border" />
          <p>{t("loading")}</p>
        </>
      }

      {mazes && mazes.length === 0 && <Alert variant="info">{t("no-mazes")}</Alert>}

      {mazes && mazes.length > 0 && 
        <Col xs={12} md={8} className="mx-auto">
          {mazes.map((maze, index) => (
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
                  <Row>
                    <Col>
                      <Button variant="primary">{t("maze-edit-details")}</Button>
                    </Col>
                    <Col>
                      <p className="text-end">{t("maze-created-at", { date: new Date(maze.createdAt).toLocaleString(i18n.resolvedLanguage) })}</p>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          ))}
        </Col>
      }
    </>
  );
}
