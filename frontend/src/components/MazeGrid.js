import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Row, Col, ToggleButton, Button, Alert } from "react-bootstrap";

export default function MazeGrid({ data, disabled, save, saveError, setSaveError }) {
  const { t } = useTranslation();

  const [showPath, setShowPath] = useState(false);

  const [isSaveDisabled, setIsSaveDisabled] = useState(false);

  const handleSave = () => {
    setSaveError("");
    setIsSaveDisabled(true);
    save();
  };

  useEffect(() => {
    if (saveError) {
      setIsSaveDisabled(false);
    }
  }, [saveError]);

  useEffect(() => {
    setShowPath(false);
    setIsSaveDisabled(false);
  }, [data.id]);

  return (
    <>
      <Row>
        <Col>
          <ToggleButton
            id="toggle-check"
            type="checkbox"
            variant="outline-primary"
            checked={showPath}
            value="1"
            onChange={(e) => setShowPath(e.currentTarget.checked)}
            className="mb-2"
          >
            {showPath ? t("maze-path-hide") : t("maze-path-show")}
          </ToggleButton>

          <p>
            {t("maze-path-length", { length: data.path.length })}
          </p>
        </Col>

        <Col>
          <Button onClick={handleSave} disabled={isSaveDisabled || disabled} className="mb-2">{t("maze-generated-use")}</Button>
          {saveError && <Alert variant="danger">{t(saveError)}</Alert>}
        </Col>
      </Row>

      <div className="maze" style={{gridTemplateColumns: `repeat(${data.width}, 1fr)`, minWidth: `${75 * data.width}px`}}>
        {Array.from({length: data.height}).map((_, i) => (
          Array.from({length: data.width}).map((__, j) => {
            const isStart = data.start[0] === j && data.start[1] === i;
            const isEnd = data.end[0] === j && data.end[1] === i;
            const isPath = data.path.some(coord => coord.x === j && coord.y === i);
            return (
              <div key={`${i}-${j}`} className={isPath && showPath ? "maze-cell yellow" : "maze-cell" }>
                <div className="maze-cell-content" style={{ height: "100%" }} >
                  {isStart ? t("maze-start") : isEnd ? t("maze-end") : data.data[i][j]}
                </div>
              </div>
            );
          })
        ))}
      </div>
    </>
  );
};
