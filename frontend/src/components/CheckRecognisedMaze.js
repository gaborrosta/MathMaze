import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Form, Alert } from "react-bootstrap";
import { INTEGER_REGEX, EMPTY_STRING_REGEX } from "../utils/constants";
import NicknameForm from "./NicknameForm";

/**
 * CheckRecognisedMaze renders part of a the maze checker page to check if the recognised numbers are fine and enter a nickname.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.data - The data for the maze. It should have the following properties:
 * - width: The width of the maze.
 * - height: The height of the maze.
 * - start: The start point of the maze.
 * - end: The end point of the maze.
 * - data: The maze data.
 * - path: The path list.
 * - id: The ID of the maze.
 * @param {string} props.initialNickname - The initial value for the nickname input.
 * @param {Function} props.handleSubmit - The function to call when the form is submitted. It receives the maze id, numbers, path and nickname an object parameter.
 *
 * @returns {React.Element} The CheckRecognisedMaze component.
 */
export default function CheckRecognisedMaze({ data, initialNickname, handleSubmit }) {
  //Check the parameters
  checkParameters(data, initialNickname, handleSubmit);


  //Localisation
  const { t } = useTranslation();


  //Cells' and path data (deep copy)
  const [mazeData, setMazeData] = useState(data.data.map(row => [...row]));
  const [pathData, setPathData] = useState(data.path.map(coord => ({x: coord.x, y: coord.y})));

  //Is submit button disabled?
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);


  //Regex for cells
  const regex = new RegExp(INTEGER_REGEX.source + "|" + EMPTY_STRING_REGEX.source);


  //Handle the path data change
  const handlePathChange = (i, j, isChecked) => {
    setPathData(prevData => {
      if (isChecked) {
        return [...prevData, {x: j, y: i}];
      } else {
        return prevData.filter(coord => !(coord.x === j && coord.y === i));
      }
    });
  };

  //Handle the cell data change
  const handleCellChange = (i, j, value) => {
    setMazeData(prevData => {
      const newData = [...prevData];

      //If it is an integer, then save it
      if (regex.test(value)) {
        newData[i][j] = value
      }

      return newData;
    });
  };

  //Handle the form submit
  const handleFormSubmit = (nickname) => {
    handleSubmit({ mazeId: data.id, data: mazeData, path: pathData, nickname: nickname });
  };


  //Render the component
  return (
    <>
      <Alert variant="info">{t("maze-check-recognised-but-ai-make-mistake")}</Alert>
      <NicknameForm
        initialNickname={initialNickname}
        isSubmitDisabled={isSubmitDisabled}
        setIsSubmitDisabled={setIsSubmitDisabled}
        handleSubmit={handleFormSubmit}
      />
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
                    <div className="centered-flex-container">
                      <div>
                        <Form.Check
                          type="checkbox"
                          checked={isPath}
                          onChange={(e) => handlePathChange(i, j, e.target.checked)}
                        />
                      </div>
                      <div className="m-2">
                        <Form.Control
                          type="text"
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




/**
 * Checks the parameters passed to the CheckRecognisedMaze component.
 */
function checkParameters(data, initialNickname, handleSubmit) {
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
  if (data.path === undefined) {
    throw new Error("data.path is required.");
  }
  if (!Array.isArray(data.path)) {
    throw new Error("data.path must be an array.");
  }
  if (!data.path.some(coord => coord.x !== undefined && coord.y !== undefined)) {
    throw new Error("data.path must be an array of objects with x and y properties.");
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

  if (handleSubmit === undefined) {
    throw new Error("handleSubmit is required.");
  }
  if (typeof handleSubmit !== "function") {
    throw new Error("handleSubmit must be a function.");
  }
  if (handleSubmit.length !== 1) {
    throw new Error("handleSubmit must have 1 parameter.");
  }
}
