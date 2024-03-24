import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Form, Alert } from "react-bootstrap";
import NicknameForm from "./NicknameForm";

export default function CheckMazeUpload({ data, handleSubmit, initialNickname }) {
  const { t } = useTranslation();

  const [mazeData, setMazeData] = useState(data.data);
  const [pathData, setPathData] = useState(data.path.map(coord => ({x: coord.x, y: coord.y})));

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

  const handleFormSubmit = (nickname) => {
    handleSubmit({ mazeId: data.id, data: mazeData, path: pathData, nickname: nickname });
  };

  return (
    <>
      <Alert variant="info">{t("maze-check-recognised-but-ai-make-mistake")}</Alert>
      <NicknameForm initialNickname={initialNickname} isSubmitDisabled={isSubmitDisabled} setIsSubmitDisabled={setIsSubmitDisabled} handleSubmit={handleFormSubmit} />

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
