import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

export default function NicknameForm({ initialNickname, isSubmitDisabled, setIsSubmitDisabled, handleSubmit }) {
  const { t } = useTranslation();

  const [nickname, setNickname] = useState(initialNickname || "");
  const [nicknameError, setNicknameError] = useState("");

  const handleNicknameChange = (e) => {
    const value = e.target.value;
    setNickname(value);
    const regex = /^[A-Za-z0-9ÁÉÍÓÖŐÚÜŰáéíóöőúüű .-]{5,20}$/;

    if (!regex.test(value)) {
      setNicknameError(t("error-invalid-nickname"));
    } else {
      setNicknameError("");
    }
  };

  useEffect(() => {
    if (!nickname || nicknameError) {
      setIsSubmitDisabled(true);
    } else {
      setIsSubmitDisabled(false);
    }
  }, [nickname, nicknameError, setIsSubmitDisabled]);

  const handleFormSubmit = () => {
    handleSubmit(nickname);
  };

  return (
    <>
      <Form.Group controlId="nickname">
        <Form.Label>{t("maze-check-recognised-nickname")}</Form.Label>
        <Form.Control name="nickname" type="text" value={nickname} onChange={handleNicknameChange} aria-describedby="nicknameHelp nicknameError" />
        <Form.Text id="nicknameHelp" className="text-muted">
          {t("maze-check-recognised-nickname-help")}
        </Form.Text>
        {nicknameError && <><br /><Form.Text className="text-danger">{t(nicknameError)}</Form.Text></>}
      </Form.Group>
      <br />
      <Button disabled={isSubmitDisabled} onClick={handleFormSubmit} className="mb-3">{t("maze-check-recognised-check")}</Button>
    </>
  );
}
