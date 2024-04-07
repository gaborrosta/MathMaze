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
