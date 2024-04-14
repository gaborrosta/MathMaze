import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "react-bootstrap";
import pdfGenerator from "../utils/pdfGenerator";

/**
 * PDFButtons renders two buttons that allow the user to download a PDF of the maze.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.actualData - The actual data of the maze. It should have the following properties:
 * - width: The width of the maze.
 * - height: The height of the maze.
 * - digits: The expected maximum number of digits in the answer.
 * - start: The start point of the maze.
 * - end: The end point of the maze.
 * - data: The maze data.
 * - id: The ID of the maze.
 * - pathTypeEven: A boolean indicating whether the path type is even.
 * - pathLength: The length of the path.
 * - description: The description of the maze.
 * - user: The user's username who generated the maze.
 *
 * @returns {JSX.Element} The PDFButtons component.
 */
export default function PDFButtons({ actualData }) {
  //Check parameters
  checkParameters(actualData);


  //Localisation
  const { t } = useTranslation();


  //Is the generation in progress?
  const [isGenerating, setIsGenerating] = useState(false);


  //Handle the button click
  const handleClick = async (size) => {
    setIsGenerating(true);
    await pdfGenerator(actualData, t, size);
    setIsGenerating(false);
  };


  //Render the component
  return (
    <div>
      <p>{t("maze-generated-download-pdf-explanation")}</p>
      <p>{t("maze-size", { height: actualData.height, width: actualData.width })}</p>
      <Button onClick={() => handleClick("A4")} disabled={isGenerating} className="mb-3">
        {t("maze-generated-download-pdf-a4")}
      </Button>
      <br />
      <Button onClick={() => handleClick("A3")} disabled={isGenerating} className="mb-3">
        {t("maze-generated-download-pdf-a3")}
      </Button>
    </div>
  );
}


/**
 * Checks the parameters passed to the PDFButtons component.
 */
function checkParameters(actualData) {
  if (actualData === undefined) {
    throw new Error("actualData is required.");
  }
  if (typeof actualData !== "object") {
    throw new Error("actualData must be an object.");
  }
  if (actualData.id === undefined) {
    throw new Error("actualData.id is required.");
  }
  if (typeof actualData.id !== "number") {
    throw new Error("actualData.id must be a number.");
  }
  if (actualData.width === undefined) {
    throw new Error("actualData.width is required.");
  }
  if (typeof actualData.width !== "number") {
    throw new Error("actualData.width must be a number.");
  }
  if (actualData.height === undefined) {
    throw new Error("actualData.height is required.");
  }
  if (typeof actualData.height !== "number") {
    throw new Error("actualData.height must be a number.");
  }
  if (actualData.start === undefined) {
    throw new Error("actualData.start is required.");
  }
  if (!Array.isArray(actualData.start)) {
    throw new Error("actualData.start must be an array.");
  }
  if (actualData.start.length !== 2) {
    throw new Error("actualData.start must have 2 elements.");
  }
  if (actualData.end === undefined) {
    throw new Error("actualData.end is required.");
  }
  if (!Array.isArray(actualData.end)) {
    throw new Error("actualData.end must be an array.");
  }
  if (actualData.end.length !== 2) {
    throw new Error("actualData.end must have 2 elements.");
  }
  if (actualData.digits === undefined) {
    throw new Error("actualData.digits is required.");
  }
  if (typeof actualData.digits !== "number") {
    throw new Error("actualData.digits must be a number.");
  }
  if (actualData.pathTypeEven === undefined) {
    throw new Error("actualData.pathTypeEven is required.");
  }
  if (typeof actualData.pathTypeEven !== "boolean") {
    throw new Error("actualData.pathTypeEven must be a boolean.");
  }
  if (actualData.pathLength === undefined) {
    throw new Error("actualData.pathLength is required.");
  }
  if (typeof actualData.pathLength !== "number") {
    throw new Error("actualData.pathLength must be a number.");
  }
  if (actualData.description === undefined) {
    throw new Error("actualData.description is required.");
  }
  if (typeof actualData.description !== "string") {
    throw new Error("actualData.description must be a string.");
  }
  if (actualData.user === undefined) {
    throw new Error("actualData.user is required.");
  }
  if (typeof actualData.user !== "string") {
    throw new Error("actualData.user must be a string.");
  }
  if (actualData.data === undefined) {
    throw new Error("actualData.data is required.");
  }
  if (!Array.isArray(actualData.data)) {
    throw new Error("actualData.data must be an array.");
  }
  if (actualData.data.length !== actualData.height) {
    throw new Error("actualData.data must have the same height as data.height.");
  }
  if (actualData.data.some(row => !Array.isArray(row))) {
    throw new Error("actualData.data must be an array of arrays.");
  }
  if (actualData.data.some(row => row.length !== actualData.width)) {
    throw new Error("actualData.data must have the same width as data.width.");
  }
  if (actualData.data.some(row => row.some(cell => typeof cell !== "string"))) {
    throw new Error("actualData.data must be an array of arrays of strings.");
  }
}
