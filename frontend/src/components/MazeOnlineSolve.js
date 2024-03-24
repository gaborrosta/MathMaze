import React, { useState, useEffect, useRef } from "react";
import { useTranslation, Trans } from "react-i18next";
import { Form, Row, Col, Alert } from "react-bootstrap";
import NicknameForm from "./NicknameForm";

const GRID_WINDOW_SIZE = 5;

export default function MazeOnlineSolve({ data, initialNickname, handleSubmit, submitError, initialMaze, initialPath })  {
  const { t } = useTranslation();

  const mazeRef = useRef(null);
  const inputRef = useRef(null);

  const [selectedCell, setSelectedCell] = useState({x: 0, y: 0});
  const [gridShift, setGridShift] = useState({x: 0, y: 0});
  const [isInputActive, setIsInputActive] = useState(false);
  const [isKeyActive, setIsKeyActive] = useState(true);
  const [error, setError] = useState(false);

  const start = {x: data.start[0], y: data.start[1]};
  const end = {x: data.end[0], y: data.end[1]};

  const [tempValue, setTempValue] = useState("");
  const [grid, setGrid] = useState(initialMaze || Array(data.height).fill().map(() => Array(data.width).fill("")));
  const [path, setPath] = useState(initialPath || [start, end]);

  useEffect(() => {
    mazeRef.current.scrollIntoView({ behavior: "smooth" });
    document.getElementById("cell-0-0").focus();
  }, []);

  useEffect(() => {
    if (isInputActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInputActive]);

  useEffect(() => {
    if (isKeyActive && mazeRef.current) {
      mazeRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isKeyActive]);

  const handleCellSelection = (x, y) => {
    if ((x !== start.x || y !== start.y) && (x !== end.x || y !== end.y)) {
      if (path.some(cell => cell.x === x && cell.y === y)) {
        setPath(prevPath => prevPath.filter(cell => cell.x !== x || cell.y !== y));
      } else {
        setPath(prevPath => [...prevPath, {x: x, y: y}]);
      }
    }
  };

  const handleKeyDown = (event) => {
    if (!isKeyActive) return;

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Enter", "x", "X"].includes(event.key)) {
      event.preventDefault();
    }

    if (isInputActive) {
      if (event.key === "Enter") {
        if (!Number.isInteger(Number(tempValue)) || Number(tempValue) < 0) {
          setError(true);
          return;
        }
        setIsInputActive(false);
        const newGrid = [...grid];
        newGrid[gridShift.y + selectedCell.y][gridShift.x + selectedCell.x] = tempValue;
        setGrid(newGrid);
        setTempValue("");
        document.getElementById(`cell-${selectedCell.x}-${selectedCell.y}`).focus();
        setError(false);
      }
      return;
    }

    let {x, y} = selectedCell;
    let {x: shiftX, y: shiftY} = gridShift;

    switch(event.key) {
      case "ArrowUp":
        if(y > 0) y--;
        else if(shiftY > 0) shiftY--;
        break;
      case "ArrowDown":
        if(y < GRID_WINDOW_SIZE - 1) y++;
        else if(shiftY < data.height - GRID_WINDOW_SIZE) shiftY++;
        break;
      case "ArrowLeft":
        if(x > 0) x--;
        else if(shiftX > 0) shiftX--;
        break;
      case "ArrowRight":
        if(x < GRID_WINDOW_SIZE - 1) x++;
        else if(shiftX < data.width - GRID_WINDOW_SIZE) shiftX++;
        break;
      case " ":
        setIsInputActive(true);
        setTempValue(grid[shiftY + y][shiftX + x]);
        break;
      case "Enter":
        setIsInputActive(false);
        break;
      case "x":
      case "X":
        handleCellSelection(shiftX + x, shiftY + y);
        break;
      case "Escape":
        setIsKeyActive(false);
        break;
      default:
        return;
    }
    setSelectedCell({x, y});
    setGridShift({x: shiftX, y: shiftY});
    document.getElementById(`cell-${x}-${y}`).focus();
  };

  const handleInputChange = (event) => {
    setTempValue(event.target.value);
  };

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const handleFormSubmit = (nickname) => {
    handleSubmit({ mazeId: data.id, data: grid, path: path, nickname: nickname });
  };

  return (
    <Row>
      <Col>
        <div>
          <h2>{t("maze-solve-online-instructions")}</h2>
          <p><Trans i18nKey="maze-solve-online-info1" values={{ type: data.even ? t("pdf-path-even") : t("pdf-path-odd"), length: data.path.length - 2 }}> <b> </b></Trans><br />{t("maze-solve-online-info2")}</p>
          <p>{t("pdf-good-luck")}</p>

          {submitError && <Alert variant="danger">{t(submitError)}</Alert>}
          <NicknameForm initialNickname={initialNickname} isSubmitDisabled={isSubmitDisabled} setIsSubmitDisabled={setIsSubmitDisabled} handleSubmit={handleFormSubmit} />
        </div>
      </Col>
      <Col xs={{ order: "last" }} lg={{ order: 0 }} xxl={{ order: "last" }} >
        <div ref={mazeRef} className="maze mb-3" style={{width: "100vw", height: "100vh", maxWidth: "100vh", maxHeight: "100vw", gridTemplateColumns: `repeat(${GRID_WINDOW_SIZE}, 1fr)`}}>
          {Array.from({length: GRID_WINDOW_SIZE}).map((_, i) => (
            Array.from({length: GRID_WINDOW_SIZE}).map((__, j) => {
              const actualX = gridShift.x + j;
              const actualY = gridShift.y + i;
              const isStart = data.start[0] === actualX && data.start[1] === actualY;
              const isEnd = data.end[0] === actualX && data.end[1] === actualY;
              const isPath = path.some(cell => cell.x === actualX && cell.y === actualY);
              const isSelected = selectedCell.x === j && selectedCell.y === i;

              return (
                <div 
                  id={`cell-${j}-${i}`} 
                  key={`${j}-${i}`} 
                  className={`maze-cell-solving ${isSelected ? "yellow" : ""} ${isPath ? "path" : ""}`} 
                  tabIndex="0"
                  onKeyDown={handleKeyDown}
                  onClick={() => { if (!isInputActive) { setSelectedCell({x: j, y: i}); setIsKeyActive(true); } }}
                  onDoubleClick={() => { handleCellSelection(actualX, actualY); setIsKeyActive(true); }}
                  style={{ userSelect: "none" }}
                >
                  <div className="maze-cell-content" style={{ height: "100%" }}>
                    <div style={{ display: "block" }} className="text-center">
                      {isStart ? t("maze-start") : isEnd ? t("maze-end") : data.data[actualY][actualX]}
                      <br />
                      {(isSelected && isInputActive && !isStart && !isEnd) ? <>
                        <Form.Control
                          ref={inputRef}
                          type="text"
                          value={tempValue}
                          onChange={handleInputChange}
                          style={{ width: "50%", margin: "auto" }}
                        />
                        {error && <Form.Text className="text-danger">{t("maze-solve-online-not-number")}</Form.Text>}
                      </> : grid[actualY][actualX]}
                    </div>
                  </div>
                </div>
              );
            })
          ))}
        </div>
      </Col>
      <Col>
        <div>
          <h3>{t("maze-solve-online-legend-keys")}</h3>
          <p>{t("maze-check-legend")}</p>
          <Col className="justify-content-md-center mb-3">
            <Row className="yellow m-2 p-2">
              {t("maze-solve-online-selected")}
            </Row>
            <Row className="path m-2 p-2">
              {t("maze-solve-online-path")}
            </Row>
          </Col>

          <p>{t("maze-solve-online-keys")}</p>
          <ul>
            <li><Trans i18nKey="maze-solve-online-keys-move"> <b> </b></Trans></li>
            <li><Trans i18nKey="maze-solve-online-keys-edit"> <b> </b></Trans></li>
            <li><Trans i18nKey="maze-solve-online-keys-save"> <b> </b></Trans></li>
            <li><Trans i18nKey="maze-solve-online-keys-mark"> <b> </b></Trans></li>
            <li><Trans i18nKey="maze-solve-online-keys-mouse"> <b> </b></Trans></li>
          </ul>
        </div>
      </Col>
    </Row>
  );
};
