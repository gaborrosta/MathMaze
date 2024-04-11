import React, { useState, useEffect, useRef } from "react";
import { useTranslation, Trans } from "react-i18next";
import { Form, Row, Col, Alert } from "react-bootstrap";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "react-bootstrap-icons";
import { useLongPress } from "react-use";
import NicknameForm from "./NicknameForm";

const GRID_WINDOW_SIZE = 5;

export default function MazeOnlineSolve({ data, initialNickname, handleSubmit, submitError, initialMaze, initialPath })  {
  const { t } = useTranslation();

  //const mazeRef = useRef(null);
  const inputRef = useRef(null);

  const [mazeSize, setMazeSize] = useState(0);

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

  const [canMoveUp, setCanMoveUp] = useState(false);
  const [canMoveDown, setCanMoveDown] = useState(true);
  const [canMoveLeft, setCanMoveLeft] = useState(false);
  const [canMoveRight, setCanMoveRight] = useState(true);

  /*useEffect(() => {
    mazeRef.current.scrollIntoView({ behavior: "smooth" });
    document.getElementById("cell-0-0").focus();
  }, [mazeRef, mazeSize]);*/

  useEffect(() => {
    if (isInputActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInputActive]);

  /*useEffect(() => {
    if (isKeyActive && mazeRef.current) {
      mazeRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isKeyActive]);*/

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
      if (event.preventDefault !== undefined) {
        event.preventDefault();
      }
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
    updateCanMove(x, y);
  };

  const updateCanMove = (x, y) => {
    let {x: shiftX, y: shiftY} = gridShift;
    setCanMoveUp(y > 0 || shiftY > 0);
    setCanMoveDown(y < GRID_WINDOW_SIZE - 1 || shiftY < data.height - GRID_WINDOW_SIZE);
    setCanMoveLeft(x > 0 || shiftX > 0);
    setCanMoveRight(x < GRID_WINDOW_SIZE - 1 || shiftX < data.width - GRID_WINDOW_SIZE);
  }

  const handleInputChange = (event) => {
    setTempValue(event.target.value);
  };

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const handleFormSubmit = (nickname) => {
    handleSubmit({ mazeId: data.id, data: grid, path: path, nickname: nickname });
  };

  useEffect(() => {
    const updateCellSize = () => {
      const minDimension = Math.max(Math.min(window.innerWidth, window.innerHeight, 800), 75 * GRID_WINDOW_SIZE);
      setMazeSize((minDimension / GRID_WINDOW_SIZE + 1) * GRID_WINDOW_SIZE - 107);
    };

    updateCellSize();
    window.addEventListener("resize", updateCellSize);

    return () => window.removeEventListener("resize", updateCellSize);
  }, []);

  const handleButtonPress = (direction) => {
    handleKeyDown({ key: direction });
  };

  const onClick = (x, y) => {
    if (!isInputActive) {
      setSelectedCell({x: x, y: y});
      setIsKeyActive(true);
      updateCanMove(x, y);
    }
  }

  const onDoubleClick = (x, y) => {
    if (!isInputActive) {
      handleCellSelection(x, y);
      setIsKeyActive(true);
      updateCanMove(x, y);
    }
  }

  const onLongPress = (event) => {
    if (!isInputActive) {
      const x = Number(event.target.dataset.x);
      const y = Number(event.target.dataset.y);

      let {x: shiftX, y: shiftY} = gridShift;
      setSelectedCell({x: x, y: y});
      setIsInputActive(true);
      setTempValue(grid[shiftY + y][shiftX + x]);
    }
  };

  const longPressEvent = useLongPress(onLongPress, { isPreventDefault: true, delay: 700 });

  return (
    <Row className="mb-3">
      <Col>
        <div>
          <h2>{t("maze-solve-online-instructions")}</h2>
          <p><Trans i18nKey="maze-solve-online-info1" values={{ type: data.pathTypeEven ? t("pdf-path-even") : t("pdf-path-odd"), length: data.pathLength }}> <b> </b></Trans><br />{t("maze-solve-online-info2")}</p>
          <p>{t("pdf-good-luck")}</p>

          {submitError && <Alert variant="danger">{t(submitError)}</Alert>}
          <NicknameForm initialNickname={initialNickname} isSubmitDisabled={isSubmitDisabled} setIsSubmitDisabled={setIsSubmitDisabled} handleSubmit={handleFormSubmit} />
        </div>
      </Col>
      <Col xs={{ order: "last" }} lg={{ order: 0 }}>
        <table>
          <tbody>
            <tr>
              <td></td>
              <td className="d-flex justify-content-center align-items-center">
                <ChevronUp
                  size={48}
                  onClick={() => handleButtonPress("ArrowUp")}
                  className={!canMoveUp ? "text-white" : ""}
                  disabled={!canMoveUp}
                />
              </td>
              <td></td>
            </tr>
            <tr>
              <td>
                <ChevronLeft
                  size={48}
                  onClick={() => handleButtonPress("ArrowLeft")}
                  className={!canMoveLeft ? "text-white" : ""}
                  disabled={!canMoveLeft}
                />
              </td>
              <td>
                <div className="maze" style={{ width: `${mazeSize}px`, height: `${mazeSize}px`, gridTemplateColumns: `repeat(${GRID_WINDOW_SIZE}, 1fr)` }}>
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
                          onClick={() => onClick(j, i)}
                          onDoubleClick={() => onDoubleClick(j, i)}
                          {...longPressEvent}
                          style={{ userSelect: "none" }}
                        >
                          <div className="maze-cell-content" style={{ height: "100%" }} data-x={j} data-y={i}>
                            <div style={{ display: "block" }} className="text-center" data-x={j} data-y={i}>
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
              </td>
              <td>
                <ChevronRight
                  size={48}
                  onClick={() => handleButtonPress("ArrowRight")}
                  className={!canMoveRight ? "text-white" : ""}
                  disabled={!canMoveRight}
                />
              </td>
            </tr>
            <tr>
              <td></td>
              <td className="d-flex justify-content-center align-items-center">
                <ChevronDown
                  size={48}
                  onClick={() => handleButtonPress("ArrowDown")}
                  className={!canMoveDown ? "text-white" : ""}
                  disabled={!canMoveDown}
                />
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
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
