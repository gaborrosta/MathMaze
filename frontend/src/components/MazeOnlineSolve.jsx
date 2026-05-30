import React, { useState, useEffect, useRef } from "react";
import { useTranslation, Trans } from "react-i18next";
import { Form, Row, Col, Alert } from "react-bootstrap";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "react-bootstrap-icons";
import useCustomClickHandler from "../utils/CustomClickHandler";
import NicknameForm from "./NicknameForm";

/**
 * The size of the displayed part of the maze.
 */
const GRID_WINDOW_SIZE = 5;


/**
 * MazeOnlineSolve renders the online solving component.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.data - The data of the maze. It should have the following properties:
 * - width: The width of the maze.
 * - height: The height of the maze.
 * - start: The start point of the maze.
 * - end: The end point of the maze.
 * - data: The data of the maze.
 * - pathTypeEven: The type of the path (even or odd).
 * - pathLength: The length of the path.
 * @param {string} [props.initialNickname] - The initial nickname of the user.
 * @param {Array} [props.initialMaze] - The initial maze data.
 * @param {Array} [props.initialPath] - The initial path of the maze.
 * @param {Function} props.handleSubmit - The function to call when the user submits the maze. It has a parameter with the maze id, filled data, path and nickname.
 * @param {string} [props.submitError] - The error message to display when the submission fails.
 *
 * @returns {React.Element} The MazeOnlineSolve component.
 */
export default function MazeOnlineSolve({ data, initialNickname, initialMaze, initialPath, handleSubmit, submitError })  {
  //Check the parameters
  checkParameters(data, initialNickname, initialMaze, initialPath, handleSubmit, submitError);


  //Localisation
  const { t } = useTranslation();


  //Is the maze active? (User solving it)
  const [isKeyActive, setIsKeyActive] = useState(true);

  //The actual cell
  const [selectedCell, setSelectedCell] = useState({ x: 0, y: 0 });

  //The grid shift for the window
  const [gridShift, setGridShift] = useState({ x: 0, y: 0 });


  //Start and end cells
  const start = { x: data.start[0], y: data.start[1] };
  const end = { x: data.end[0], y: data.end[1] };


  //The data and path
  const [grid, setGrid] = useState(initialMaze || Array(data.height).fill().map(() => Array(data.width).fill("")));
  const [path, setPath] = useState(initialPath || [start, end]);


  //The input field
  const inputRef = useRef(null);

  //Is the input field active?
  const [isInputActive, setIsInputActive] = useState(false);

  //Input's value
  const [inputValue, setInputValue] = useState("");

  //Input's error (visible or not)
  const [inputError, setInputError] = useState(false);

  //Request focus
  useEffect(() => {
    if (isInputActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInputActive]);


  //Can the selected cell be moved in these directions?
  const [canMoveUp, setCanMoveUp] = useState(false);
  const [canMoveDown, setCanMoveDown] = useState(true);
  const [canMoveLeft, setCanMoveLeft] = useState(false);
  const [canMoveRight, setCanMoveRight] = useState(true);


  //Is submit disabled?
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  //Submit the maze with the nickname
  const handleFormSubmit = (nickname) => {
    handleSubmit({ mazeId: data.id, data: grid, path: path, nickname: nickname });
  };



  //Adds the current cell to the path or removes it if is present
  const handleCellSelection = (x, y) => {
    if ((x !== start.x || y !== start.y) && (x !== end.x || y !== end.y)) {
      if (path.some(cell => cell.x === x && cell.y === y)) {
        setPath(prevPath => prevPath.filter(cell => cell.x !== x || cell.y !== y));
      } else {
        setPath(prevPath => [...prevPath, { x: x, y: y }]);
      }
    }
  };


  //Listens for keyboard event to move inside the maze or update it
  const handleKeyDown = (event) => {
    //The maze is not in focus, do nothing
    if (!isKeyActive) return;


    //Prevent the default behaviour of the keys
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Enter", "x", "X"].includes(event.key)) {
      if (event.preventDefault !== undefined) {
        event.preventDefault();
      }
    }


    //The input field is active
    if (isInputActive) {
      //The user pressed Enter to save it
      if (event.key === "Enter") {
        //The input is not a number
        if (!Number.isInteger(Number(inputValue)) || Number(inputValue) < 0) {
          setInputError(true);
          return;
        }

        //Close the input
        setIsInputActive(false);

        //Update the grid
        const newGrid = [...grid];
        newGrid[gridShift.y + selectedCell.y][gridShift.x + selectedCell.x] = inputValue;
        setGrid(newGrid);

        //Clear the input
        setInputValue("");

        //Request focus
        document.getElementById(`cell-${selectedCell.x}-${selectedCell.y}`).focus();

        //Remove error
        setInputError(false);
      }

      //Do not handle anything else if the input is active
      return;
    }


    //The coordinate of the selected cell and the actual shift
    let { x, y } = selectedCell;
    let { x: shiftX, y: shiftY } = gridShift;


    //What happened?
    switch(event.key) {
      case "ArrowUp":
        if (y > 0) y--;
        else if (shiftY > 0) shiftY--;
        break;
      case "ArrowDown":
        if (y < GRID_WINDOW_SIZE - 1) y++;
        else if (shiftY < data.height - GRID_WINDOW_SIZE) shiftY++;
        break;
      case "ArrowLeft":
        if (x > 0) x--;
        else if (shiftX > 0) shiftX--;
        break;
      case "ArrowRight":
        if (x < GRID_WINDOW_SIZE - 1) x++;
        else if (shiftX < data.width - GRID_WINDOW_SIZE) shiftX++;
        break;
      case " ":
        setIsInputActive(true);
        setInputValue(grid[shiftY + y][shiftX + x]);
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


    //Update the coordinates of the selected cell
    setSelectedCell({ x, y });

    //Update the shift
    setGridShift({ x: shiftX, y: shiftY });

    //Request focus
    document.getElementById(`cell-${x}-${y}`).focus();

    //Checks which arrow buttons could be clicked now
    updateCanMove(x, y, shiftX, shiftY);
  };


  //Checks which arrow buttons could be clicked with the new selected cell
  const updateCanMove = (x, y, shiftX, shiftY) => {
    setCanMoveUp(y + shiftY > 0);
    setCanMoveDown(y + shiftY < data.height - 1);
    setCanMoveLeft(x + shiftX > 0);
    setCanMoveRight(x + shiftX < data.width - 1);
  }


  //Moves the selected cell with the arrow buttons
  const handleArrowButtonPress = (direction) => {
    handleKeyDown({ key: direction });
  };


  //Click handler
  const clickHandler = useCustomClickHandler({
    onClick: (event) => {
      if (!isInputActive) {
        const x = Number(event.target.dataset.x);
        const y = Number(event.target.dataset.y);

        setIsKeyActive(true);
        setSelectedCell({ x: x, y: y });
        updateCanMove(x, y);
      }
    },
    onDoubleClick: (event) => {
      if (!isInputActive) {
        const x = Number(event.target.dataset.x);
        const y = Number(event.target.dataset.y);
        let { x: shiftX, y: shiftY } = gridShift;

        setIsKeyActive(true);
        handleCellSelection(x + shiftX, y + shiftY);
      }
    },
    onLongPress: (event) => {
      if (!isInputActive) {
        const x = Number(event.target.dataset.x);
        const y = Number(event.target.dataset.y);
        let { x: shiftX, y: shiftY } = gridShift;

        setIsInputActive(true);
        setSelectedCell({ x: x, y: y });
        setInputValue(grid[shiftY + y][shiftX + x]);
      }
    },
  });


  //The size of the maze in pixels
  const [mazeSize, setMazeSize] = useState(0);

  //Calculate the best size for the maze
  useEffect(() => {
    //Update the maze size
    const updateMazeSize = () => {
      const minDimension = Math.max(Math.min(window.innerWidth, window.innerHeight, 800), 75 * GRID_WINDOW_SIZE);
      setMazeSize((minDimension / GRID_WINDOW_SIZE + 1) * GRID_WINDOW_SIZE - 107);
    };
    updateMazeSize();

    //Listen for resize events
    window.addEventListener("resize", updateMazeSize);

    return () => window.removeEventListener("resize", updateMazeSize);
  }, []);


  //Render the component
  return (
    <Row>
      <Col>
        <h2>{t("maze-solve-online-instructions")}</h2>
        <p><Trans i18nKey="maze-solve-online-info1" values={{ type: data.pathTypeEven ? t("pdf-path-even") : t("pdf-path-odd"), length: data.pathLength }}> <b> </b></Trans><br />{t("maze-solve-online-info2")}</p>
        <p>{t("pdf-good-luck")}</p>

        {submitError && <Alert variant="danger">{t(submitError)}</Alert>}
        <NicknameForm initialNickname={initialNickname} isSubmitDisabled={isSubmitDisabled} setIsSubmitDisabled={setIsSubmitDisabled} handleSubmit={handleFormSubmit} />
      </Col>
      <Col xs={{ order: "last" }} lg={{ order: 0 }}>
        <table>
          <tbody>
            <tr>
              <td></td>
              <td className="d-flex justify-content-center align-items-center">
                <ChevronUp
                  size={48}
                  onClick={() => handleArrowButtonPress("ArrowUp")}
                  className={!canMoveUp ? "text-white" : ""}
                  disabled={!canMoveUp}
                  role={canMoveUp ? "button" : ""}
                  data-testid="arrow-up"
                />
              </td>
              <td></td>
            </tr>
            <tr>
              <td>
                <ChevronLeft
                  size={48}
                  onClick={() => handleArrowButtonPress("ArrowLeft")}
                  className={!canMoveLeft ? "text-white" : ""}
                  disabled={!canMoveLeft}
                  role={canMoveLeft ? "button" : ""}
                  data-testid="arrow-left"
                />
              </td>
              <td>
                <div className="maze" style={{ width: `${mazeSize}px`, height: `${mazeSize}px`, gridTemplateColumns: `repeat(${GRID_WINDOW_SIZE}, 1fr)` }}>
                  {Array.from({length: GRID_WINDOW_SIZE}).map((_, i) => (
                    Array.from({length: GRID_WINDOW_SIZE}).map((__, j) => {
                      const actualX = gridShift.x + j;
                      const actualY = gridShift.y + i;
                      const isStart = start.x === actualX && start.y === actualY;
                      const isEnd = end.x === actualX && end.y === actualY;
                      const isPath = path.some(cell => cell.x === actualX && cell.y === actualY);
                      const isSelected = selectedCell.x === j && selectedCell.y === i;

                      return (
                        <div
                          id={`cell-${j}-${i}`}
                          key={`${j}-${i}`}
                          className={`maze-cell-solving ${isSelected ? "yellow" : ""} ${isPath ? "path" : ""}`}
                          tabIndex="0"
                          onKeyDown={handleKeyDown}
                          {...clickHandler}
                          style={{ userSelect: "none" }}
                        >
                          <div className="maze-cell-content" style={{ height: "100%" }} data-x={j} data-y={i}>
                            <div style={{ display: "block" }} className="text-center" data-x={j} data-y={i}>
                              {isStart ? t("maze-start") : isEnd ? t("maze-end") : data.data[actualY][actualX]}
                              <br />
                              {(isSelected && isInputActive && !isStart && !isEnd) ?
                                <>
                                  <Form.Control
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    style={{ width: "75%", margin: "auto" }}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    onTouchEnd={(e) => e.stopPropagation()}
                                  />
                                  {inputError && <Form.Text className="text-danger">{t("maze-solve-online-not-number")}</Form.Text>}
                                </>
                                :
                                grid[actualY][actualX]
                              }
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
                  onClick={() => handleArrowButtonPress("ArrowRight")}
                  className={!canMoveRight ? "text-white" : ""}
                  disabled={!canMoveRight}
                  role={canMoveRight ? "button" : ""}
                  data-testid="arrow-right"
                />
              </td>
            </tr>
            <tr>
              <td></td>
              <td className="d-flex justify-content-center align-items-center">
                <ChevronDown
                  size={48}
                  onClick={() => handleArrowButtonPress("ArrowDown")}
                  className={!canMoveDown ? "text-white" : ""}
                  disabled={!canMoveDown}
                  role={canMoveDown ? "button" : ""}
                  data-testid="arrow-down"
                />
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </Col>
      <Col>
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
      </Col>
    </Row>
  );
};


/**
 * Checks the parameters passed to the MazeOnlineSolve component.
 */
function checkParameters(data, initialNickname, initialMaze, initialPath, handleSubmit, submitError) {
  if (data === undefined) {
    throw new Error("data is required.");
  }
  if (typeof data !== "object") {
    throw new Error("data must be an object.");
  }
  if (data.id === undefined) {
    throw new Error("data.id is required.");
  }
  if (typeof data.id !== "number") {
    throw new Error("data.id must be a number.");
  }
  if (data.width === undefined) {
    throw new Error("data.width is required.");
  }
  if (typeof data.width !== "number") {
    throw new Error("data.width must be a number.");
  }
  if (data.height === undefined) {
    throw new Error("data.height is required.");
  }
  if (typeof data.height !== "number") {
    throw new Error("data.height must be a number.");
  }
  if (data.start === undefined) {
    throw new Error("data.start is required.");
  }
  if (!Array.isArray(data.start)) {
    throw new Error("data.start must be an array.");
  }
  if (data.start.length !== 2) {
    throw new Error("data.start must have 2 elements.");
  }
  if (data.end === undefined) {
    throw new Error("data.end is required.");
  }
  if (!Array.isArray(data.end)) {
    throw new Error("data.end must be an array.");
  }
  if (data.end.length !== 2) {
    throw new Error("data.end must have 2 elements.");
  }
  if (data.pathTypeEven === undefined) {
    throw new Error("data.pathTypeEven is required.");
  }
  if (typeof data.pathTypeEven !== "boolean") {
    throw new Error("data.pathTypeEven must be a boolean.");
  }
  if (data.pathLength === undefined) {
    throw new Error("data.pathLength is required.");
  }
  if (typeof data.pathLength !== "number") {
    throw new Error("data.pathLength must be a number.");
  }
  if (data.data === undefined) {
    throw new Error("data.data is required.");
  }
  if (!Array.isArray(data.data)) {
    throw new Error("data.data must be an array.");
  }
  if (data.data.length !== data.height) {
    throw new Error("data.data must have the same height as data.height.");
  }
  if (data.data.some(row => !Array.isArray(row))) {
    throw new Error("data.data must be an array of arrays.");
  }
  if (data.data.some(row => row.length !== data.width)) {
    throw new Error("data.data must have the same width as data.width.");
  }
  if (data.data.some(row => row.some(cell => typeof cell !== "string"))) {
    throw new Error("data.data must be an array of arrays of strings.");
  }

  if (initialNickname === undefined) {
    throw new Error("initialNickname is required.");
  }
  if (typeof initialNickname !== "string") {
    throw new Error("initialNickname must be a string.");
  }

  if (initialMaze !== undefined) {
    if (!Array.isArray(initialMaze)) {
      throw new Error("initialMaze must be an array.");
    }
    if (initialMaze.length !== data.height) {
      throw new Error("initialMaze must have the same height as data.height.");
    }
    if (initialMaze.some(row => !Array.isArray(row))) {
      throw new Error("initialMaze must be an array of arrays.");
    }
    if (initialMaze.some(row => row.length !== data.width)) {
      throw new Error("initialMaze must have the same width as data.width.");
    }
    if (initialMaze.some(row => row.some(cell => typeof cell !== "string"))) {
      throw new Error("initialMaze must be an array of arrays of strings.");
    }
  }

  if (initialPath !== undefined) {
    if (!Array.isArray(initialPath)) {
      throw new Error("initialPath must be an array.");
    }
    if (initialPath.some(cell => cell.x === undefined || cell.y === undefined)) {
      throw new Error("initialPath must be an array of objects with x and y properties.");
    }
  }

  if (handleSubmit === undefined) {
    throw new Error("handleSubmit is required.");
  }
  if (typeof handleSubmit !== "function") {
    throw new Error("handleSubmit must be a function.");
  }
  if (handleSubmit.length !== 1) {
    throw new Error("handleSubmit must have 1 parameter.");
  }

  if (submitError === undefined) {
    throw new Error("submitError is required.");
  }
  if (typeof submitError !== "string") {
    throw new Error("submitError must be a string.");
  }
}
