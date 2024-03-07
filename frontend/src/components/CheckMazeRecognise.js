import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Form, Button, Alert } from "react-bootstrap";

export default function CheckMazeUpload({ data, handleSubmit }) {
  const { t } = useTranslation();

  const [mazeData, setMazeData] = useState(data.data);
  const [pathData, setPathData] = useState(data.path.map(coord => ({x: coord.x, y: coord.y})));

  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState("");

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const handleCellChange = (i, j, value) => {
    const newData = [...mazeData];
    newData[i][j] = value;
    setMazeData(newData);
  };

  const handlePathChange = (i, j, isChecked) => {
    setPathData(prevData => {
      if (isChecked) {
        return [...prevData, {x: j, y: i}];
      } else {
        return prevData.filter(coord => !(coord.x === j && coord.y === i));
      }
    });
  };

  const handleNicknameChange = (e) => {
    const value = e.target.value;
    setNickname(value);
    const regex = /^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű .-]{5,20}$/;

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
  }, [nickname, nicknameError]);

  const handleFormSubmit = () => {
    handleSubmit({ mazeId: data.id, data: mazeData, path: pathData, nickname: nickname });
  };

  return (
    <>
      <Alert variant="info">{t("maze-check-recognised-but-ai-make-mistake")}</Alert>
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

      <div className="maze" style={{gridTemplateColumns: `repeat(${data.width}, 1fr)`, minWidth: `${75 * data.width}px`}}>
        {Array.from({length: data.height}).map((_, i) => (
          Array.from({length: data.width}).map((__, j) => {
            const isStart = data.start[0] === j && data.start[1] === i;
            const isEnd = data.end[0] === j && data.end[1] === i;
            const isPath = pathData.some(coord => coord.x === j && coord.y === i);
            return (
              <div key={`${i}-${j}`} className={isPath ? "maze-cell yellow" : "maze-cell" }>
                <div className="maze-cell-content" style={{ height: "100%" }} >
                  {isStart ? t("maze-start") : isEnd ? t("maze-end") : 
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div>
                        <Form.Check 
                          type="checkbox"
                          checked={isPath}
                          onChange={(e) => handlePathChange(i, j, e.target.checked)}
                        />
                      </div>
                      <div className="m-2">
                        <Form.Control
                          type="number"
                          value={mazeData[i][j]}
                          onChange={(e) => handleCellChange(i, j, e.target.value)}
                        />
                      </div>
                    </div>
                  }
                </div>
              </div>
            );
          })
        ))}
      </div>
    </>
  );
};
