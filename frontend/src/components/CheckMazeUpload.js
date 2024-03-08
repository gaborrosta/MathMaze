import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Form, Button, Alert, Row, Col } from "react-bootstrap";

export default function CheckMazeUpload({ handleSubmit, initialId }) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    id: initialId || "",
    file: null,
    fileUrl: "",
    rotation: 0,
  });

  const [idError, setIdError] = useState("");
  const [fileError, setFileError] = useState("");

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    if (name === "id") {
      setFormData(prevState => ({ ...prevState, id: value }));
      if (!value) {
        setIdError(t("error-invalid-maze-id"));
      } else {
        setIdError("");
      }
    } else if (name === "file") {
      const file = files[0];
      if (file.type === "image/png" || file.type === "image/jpeg") {
        setFormData(prevState => ({ ...prevState, fileUrl: URL.createObjectURL(file), file: file }));
        setFileError("");
      } else {
        setFileError(t("error-invalid-file-type"));
      }
    } else if (name === "rotation") {
      setFormData(prevState => ({ ...prevState, rotation: (prevState.rotation + 90) % 360 }));
    }
  };

  const rotateImage = () => {
    setFormData(prevState => ({ ...prevState, rotation: (prevState.rotation + 90) % 360 }));
  };

  useEffect(() => {
    if (fileError || !formData.file || idError || !formData.id) {
      setIsSubmitDisabled(true);
    } else {
      setIsSubmitDisabled(false);
    }
  }, [formData, fileError, idError]);

  const prepareSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("mazeId", formData.id);
    data.append("image", formData.file);
    data.append("rotation", formData.rotation);

    handleSubmit(data);
  };

  return (
    <Row>
      <Col xs={12} md={4}>
        <div className="border p-3 m-2">
          <Form onSubmit={prepareSubmit}>
            <Form.Group>
              <Form.Label>{t("maze-check-id-label")}</Form.Label>
              <Form.Control name="id" type="number" value={formData.id} onChange={handleChange} aria-describedby="idHelp idError" />
              <Form.Text id="idHelp" className="text-muted">
                {t("maze-check-id-help")}
              </Form.Text>
              {idError && <><br /><Form.Text className="text-danger">{t(idError)}</Form.Text></>}
            </Form.Group>
            <br />
            <Form.Group>
              <Form.Label>{t("maze-check-file-label")}</Form.Label>
              <Form.Control name="file" type="file" onChange={handleChange} aria-describedby="fileHelp fileError" />
              <Form.Text id="fileHelp" className="text-muted">
                {t("maze-check-file-help")}
              </Form.Text>
              {fileError && <><br /><Form.Text className="text-danger">{t(fileError)}</Form.Text></>}
            </Form.Group>
            <br />
            <Button variant="primary" type="submit" disabled={isSubmitDisabled}>
              {t("maze-check-title")}
            </Button>
          </Form>
        </div>
      </Col>
      <Col xs={12} md={8}>
        <div className="border p-3 m-2">
          {!formData.file ? <Alert variant="info">{t("maze-check-image-info")}</Alert> : <>
            <Alert variant="info">{t("maze-check-rotate-image-info")}</Alert>
            <Button onClick={rotateImage} className="mb-3">{t("rotate-image")}</Button>
            <div style={{ width: "100%", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div style={{ width: "100vh", height: "100vh", overflow: "hidden", position: "relative" }}>
                <img 
                  src={formData.fileUrl} 
                  alt={t("maze-check-file-label")}
                  style={{ 
                    position: "absolute", 
                    top: "50%", 
                    left: "50%", 
                    height: "100%", 
                    width: "100%", 
                    transform: `translate(-50%, -50%) rotate(${formData.rotation}deg)`, 
                    objectFit: "contain" 
                  }} 
                />
              </div>
            </div>
          </>}
        </div>
      </Col>
    </Row>
  );
};
