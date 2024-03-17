import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Form, Row } from "react-bootstrap";

export default function SolutionIDForm({ index, onStateChange, onErrorChange }) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    solutionId: "",
    mazeId: "",
    nickname: "",
  });

  const [solutionIdError, setSolutionIdError] = useState("");
  const [mazeIdError, setMazeIdError] = useState("");
  const [nicknameError, setNicknameError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    let error = false;

    if (name === "solutionId") {
      const number = Number(value);
  
      if (value && (!number || number < 1)) {
        setSolutionIdError("maze-generate-solution-id-invalid");
        error = true;
      } else {
        setSolutionIdError("");
      }
    } else if (name === "mazeId") {
      const number = Number(value);
  
      if (value && (!number || number < 1)) {
        setMazeIdError("maze-generate-maze-id-invalid");
        error = true;
      } else {
        setMazeIdError("");
      }
    } else if (name === "nickname") {
      const regex = /^[A-Za-z0-9ÁÉÍÓÖŐÚÜŰáéíóöőúüű .-]{5,20}$/;
      if (value && !regex.test(value)) {
        setNicknameError("maze-generate-nickname-invalid");
        error = true;
      } else {
        setNicknameError("");
      }
    }

    if (!error) {
      error = (newFormData.mazeId && !newFormData.nickname) || (newFormData.nickname && !newFormData.mazeId);
    }

    onErrorChange(error);
    onStateChange(index, newFormData);
  };

  const [selectedOption, setSelectedOption] = useState("solutionId");

  const handleSelectChange = (event) => {
    setSelectedOption(event.target.value);
    let newFormData = { solutionId: "", mazeId: "", nickname: "" };
    setFormData(newFormData);
    setSolutionIdError("");
    setMazeIdError("");
    setNicknameError("");

    onErrorChange(false);
    onStateChange(index, newFormData);
  };

  return (
    <Row className="pb-1 border">
      <Form.Group controlId="selectOption">
        <Form.Label>{t("maze-generate-select-option")}</Form.Label>
        <Form.Control as="select" value={selectedOption} onChange={handleSelectChange} aria-describedby="selectOptionHelp">
          <option value="solutionId">{t("maze-generate-select-option-solution-id")}</option>
          <option value="mazeId">{t("maze-generate-select-option-maze-id-nickname")}</option>
        </Form.Control>
        <Form.Text id="selectOptionHelp" className="text-muted">
          {t("maze-generate-select-option-help")}
        </Form.Text>
      </Form.Group>
  
      {selectedOption === "solutionId" &&
        <Form.Group controlId="solutionId">
          <Form.Label>{t("maze-generate-solution-id")}</Form.Label>
          <Form.Control name="solutionId" type="text" value={formData.solutionId} onChange={handleChange} aria-describedby="solutionIdHelp solutionIdError" />
          <Form.Text id="solutionIdHelp" className="text-muted">
            {t("maze-generate-solution-id-help")}
          </Form.Text>
          {solutionIdError && <><br /><Form.Text className="text-danger">{t(solutionIdError)}</Form.Text></>}
        </Form.Group>
      }
  
      {selectedOption === "mazeId" && <>
        <Form.Group controlId="mazeId">
          <Form.Label>{t("maze-generate-maze-id")}</Form.Label>
          <Form.Control name="mazeId" type="text" value={formData.mazeId} onChange={handleChange} aria-describedby="mazeIdHelp mazeIdError" />
          <Form.Text id="mazeIdHelp" className="text-muted">
            {t("maze-generate-maze-id-help")}
          </Form.Text>
          {mazeIdError && <><br /><Form.Text className="text-danger">{t(mazeIdError)}</Form.Text></>}
        </Form.Group>
        <Form.Group controlId="nickname">
          <Form.Label>{t("maze-generate-nickname")}</Form.Label>
          <Form.Control name="nickname" type="text" value={formData.nickname} onChange={handleChange} aria-describedby="nicknameHelp nicknameError" />
          <Form.Text id="nicknameHelp" className="text-muted">
            {t("maze-generate-nickname-help")}
          </Form.Text>
          {nicknameError && <><br /><Form.Text className="text-danger">{t(nicknameError)}</Form.Text></>}
        </Form.Group>
      </>}
    </Row>
  );
}
