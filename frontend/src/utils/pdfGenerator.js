import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FRONTEND_URL } from "../utils/constants";

export default function pdfGenerator(data, t) {
  //DPI and scale factor
  const dpi = 150;
  const scaleFactor = dpi / 96;

  //Maze div
  let maze = document.createElement("div");
  maze.className = "maze";
  maze.style.gridTemplateColumns = `repeat(${data.width}, 1fr)`;
  maze.style.minWidth = `${30 * data.digits * data.width}px`;

  //Fill the maze with cells
  for (let i = 0; i < data.height; i++) {
    for (let j = 0; j < data.width; j++) {
      //Create cell
      let cell = document.createElement("div");
      cell.className = "maze-cell";

      //Start? End?
      const isStart = data.start[0] === j && data.start[1] === i;
      const isEnd = data.end[0] === j && data.end[1] === i;

      //Create corner div
      if (!isStart && !isEnd) {
        let corner = document.createElement("div");
        corner.className = "maze-cell-corner";
        cell.appendChild(corner);
      }

      //Create content div
      let content = document.createElement("div");
      content.className = "maze-cell-content";
      content.style.bottom = (data.start[0] === j && data.start[1] === i) || (data.end[0] === j && data.end[1] === i) ? "0" : "50%";
      content.textContent = (data.start[0] === j && data.start[1] === i) ? t("maze-start") : (data.end[0] === j && data.end[1] === i) ? t("maze-end") : data.data[i][j];
      cell.appendChild(content);

      //Create cells for numbers
      if (!isStart && !isEnd) {
        let bottom = document.createElement("div");
        bottom.className = "maze-cell-bottom";

        for (let k = 0; k < data.digits; k++) {
          let bottomDiv = document.createElement("div");
          bottomDiv.className = `maze-cell-bottom-${k+1}`;
          bottom.appendChild(bottomDiv);
        }

        cell.appendChild(bottom);
      }

      maze.appendChild(cell);
    }
  }


  //Set the font size
  maze.style.fontSize = "1.5rem";

  //Create the title
  const title = document.createElement("h1");
  title.textContent = t("app-name");
  title.style.textAlign = "center";
  title.style.fontSize = "4rem";

  //Create the maze ID text
  const mazeId = document.createElement("p");
  mazeId.textContent = t("pdf-maze-id", { id: data.id });
  mazeId.style.fontSize = "2rem";
  mazeId.style.fontWeight = "bold";
  mazeId.style.textAlign = "right";

  //Create the explanation text for the top
  const explanationTop = document.createElement("p");
  explanationTop.innerHTML = t("pdf-explanation", { type: data.even ? t("pdf-path-even") : t("pdf-path-odd"), length: data.path.length - 2 })
    + "<br><br>" + t("pdf-good-luck") + "<br><br>" + t("pdf-check-solution", { url: FRONTEND_URL });
  explanationTop.style.fontSize = "2rem";
  explanationTop.style.textAlign = "left";

  //Create the explanation text for the bottom
  const explanationBottom = document.createElement("p");
  explanationBottom.innerHTML = t("pdf-copyright", { url: FRONTEND_URL });
  explanationBottom.style.fontSize = "1.5rem";

  //Create the full page
  const container = document.createElement("div");
  container.appendChild(title);
  container.appendChild(mazeId);
  container.appendChild(explanationTop);
  container.appendChild(maze);
  container.appendChild(explanationBottom);

  //Scale the container
  container.style.transform = `scale(${scaleFactor})`;
  container.style.transformOrigin = "top left";

  //Add the container to the document
  document.body.appendChild(container);

  //Create the PDF
  html2canvas(container, { scale: scaleFactor }).then(canvas => {
    //Remove the container from the document
    document.body.removeChild(container);

    //Convert the canvas to a blob
    canvas.toBlob(blob => {
      //Create a URL for the blob
      const url = URL.createObjectURL(blob);

      //Create the PDF
      const pdf = new jsPDF("p", "mm", "a4");

      //Get the page width and height
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      //Set the margins
      const marginX = 10;
      const marginYTop = 20;
      const marginYBottom = 20;

      //Calculate available width and height considering the margins
      const availableWidth = pageWidth - 2 * marginX;
      const availableHeight = pageHeight - marginYTop - marginYBottom;

      //Calculate the ratio to fit the image in the available space
      const widthRatio = availableWidth / canvas.width;
      const heightRatio = availableHeight / canvas.height;
      const ratio = widthRatio > heightRatio ? heightRatio : widthRatio;

      //Calculate the new width and height
      const canvasWidth = canvas.width * ratio;
      const canvasHeight = canvas.height * ratio;

      //Calculate the position of the image
      const imageX = (pageWidth - canvasWidth) / 2;
      const imageY = marginYTop;

      //Add the image to the PDF
      pdf.addImage(url, "JPEG", imageX, imageY, canvasWidth, canvasHeight);

      //Save the PDF
      pdf.save(t("maze-title") + " #" + data.id + ".pdf");

      //Revoke the URL
      URL.revokeObjectURL(url);
    }, "image/jpeg", 0.95);
  });
};
