import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Row, Col, ToggleButton, Button, Alert } from "react-bootstrap";

/**
 * MazeGrid displays a maze grid with a save button.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.data - The data for the maze grid. It should have the following properties:
 * - width: The width of the maze.
 * - height: The height of the maze.
 * - start: The start point of the maze.
 * - end: The end point of the maze.
 * - data: The maze data.
 * - path: The path list.
 * - id: The ID of the maze.
 * @param {boolean} props.disabled - A boolean flag indicating whether the save button is disabled.
 * @param {Function} props.save - The function to call when the save button is clicked.
 * @param {string} props.saveError - The error message to display when there is an error while saving.
 * @param {Function} props.setSaveError - The function to call to set the save error.
 *
 * @returns {React.Element} The MazeGrid component.
 */
export default function MazeGrid({ data, disabled, save, saveError, setSaveError }) {
  //Check the parameters
  checkParameters(data, disabled, save, saveError, setSaveError);


  //Localisation
  const { t } = useTranslation();


  //Should show the path?
  const [showPath, setShowPath] = useState(false);

  //Is the save button disabled?
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);


  //Handle the save button click
  const handleSave = () => {
    setSaveError("");
    setIsSaveDisabled(true);
    save();
  };


  //Disable the save button if there is an error
  useEffect(() => {
    if (saveError) {
      setIsSaveDisabled(false);
    }
  }, [saveError]);


  //Reset the show path and save button when the maze changes
  useEffect(() => {
    setShowPath(false);
    setIsSaveDisabled(false);
  }, [data.id]);


  //Render the component
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
            {t("maze-path-length", { length: data.path.length - 2 })}
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


/**
 * Checks the parameters passed to the MazeGrid component.
 */
function checkParameters(data, disabled, save, saveError, setSaveError) {
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

  if (disabled === undefined) {
    throw new Error("disabled is required.");
  }
  if (typeof disabled !== "boolean") {
    throw new Error("disabled must be a boolean.");
  }

  if (save === undefined) {
    throw new Error("save is required.");
  }
  if (typeof save !== "function") {
    throw new Error("save must be a function.");
  }
  if (save.length !== 0) {
    throw new Error("save must have 0 parameters.");
  }

  if (saveError === undefined) {
    throw new Error("saveError is required.");
  }
  if (typeof saveError !== "string") {
    throw new Error("saveError must be a string.");
  }

  if (setSaveError === undefined) {
    throw new Error("setSaveError is required.");
  }
  if (typeof setSaveError !== "function") {
    throw new Error("setSaveError must be a function.");
  }
  if (setSaveError.length !== 1) {
    throw new Error("setSaveError must have 1 parameter.");
  }
}
