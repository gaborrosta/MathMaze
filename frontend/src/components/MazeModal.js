import React from "react";
import { useTranslation } from "react-i18next";
import { Modal, Button } from "react-bootstrap";
import pdfGenerator from "../utils/pdfGenerator";

export default function MazeModal({ data, visible, setVisible }) {
  const { t } = useTranslation();

  return (
    <Modal show={visible} onHide={() => setVisible(false)} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{t("maze-title")} #{data.id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>TODO...</p>
        <Button onClick={() => pdfGenerator(data, t)}>{t("maze-generated-download-pdf")}</Button>
      </Modal.Body>
    </Modal>
  );
}
