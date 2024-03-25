import React, { useState } from "react";
import { Button } from "react-bootstrap";
import pdfGenerator from "../utils/pdfGenerator";

export default function PDFButtons({ actualData, t }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleClick = async (size) => {
    setIsGenerating(true);
    await pdfGenerator(actualData, t, size);
    setIsGenerating(false);
  };

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
