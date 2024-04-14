import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FRONTEND_URL } from "../utils/constants";

/**
 * Generates a PDF document of a maze in the given size.
 *
 * @param {Object} data - The maze data. It should have the following properties:
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
 * @param {Function} t - The translation function.
 * @param {string} size - The size of the PDF document ("A4" or "A3").
 *
 * @returns {Promise} A promise that resolves when the PDF document has been saved.
 */
export default async function pdfGenerator(data, t, size) {
  //Check the parameters
  checkParameters(data, t, size);


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
  explanationTop.innerHTML = t("pdf-explanation", { type: data.pathTypeEven ? t("pdf-path-even") : t("pdf-path-odd"), length: data.pathLength })
    + "<br><br>" + t("maze-description") + ": " + (data.description ? data.description : "-")
    + "<br>" + t("maze-generated-by", { username: data.user })
    + "<br><br>" + t("pdf-good-luck") + "<br><br>" + t("pdf-check-solution", { url: FRONTEND_URL });  explanationTop.style.fontSize = "2rem";
  explanationTop.style.textAlign = "left";

  //Create the explanation text for the bottom
  const explanationBottom = document.createElement("p");
  explanationBottom.innerHTML = t("pdf-copyright", { url: FRONTEND_URL });
  explanationBottom.style.fontSize = "1.5rem";

  //Create the full page
  const container = document.createElement("div");
  container.style.width = (size === "A4") ? "1350px" : "3000px";
  container.appendChild(title);
  container.appendChild(mazeId);
  container.appendChild(explanationTop);
  container.appendChild(maze);
  container.appendChild(explanationBottom);

  //Scale the container
  container.style.transform = `scale(${scaleFactor})`;
  container.style.transformOrigin = "top left";

  //Create the root (this will contain container)
  let root = document.createElement("div");
  root.style.position = "absolute";
  root.style.left = 0;
  root.style.right = 0;
  root.style.top = 0;
  root.style.height = "auto";
  root.style.margin = "auto";
  root.style.backgroundColor = "white";
  root.appendChild(container);

  //Create the overlay (this will contain root)
  const overlay = document.createElement("div");
  overlay.position = "fixed";
  overlay.zIndex = 1000;
  overlay.left = 0;
  overlay.right = 0;
  overlay.bottom = 0;
  overlay.top = 0;
  overlay.backgroundColor = "rgba(0,0,0,0.8)";
  overlay.style.opacity = 0;
  overlay.appendChild(root);

  //Add the overlay to the document
  document.body.appendChild(overlay);

  //Create the PDF
  const canvas = await html2canvas(container, { scale: scaleFactor })

  //Remove the overlay from the document
  document.body.removeChild(overlay);

  //Convert the canvas to a blob
  const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.95));

  //Create a URL for the blob
  const url = URL.createObjectURL(blob);

  //Create the PDF
  const pdf = new jsPDF("p", "mm", (size === "A4") ? "a4" : "a3");

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
};


/**
 * Checks the parameters passed to pdfGenerator.
 */
function checkParameters(data, t, size) {
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
  if (data.digits === undefined) {
    throw new Error("data.digits is required.");
  }
  if (typeof data.digits !== "number") {
    throw new Error("data.digits must be a number.");
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
  if (data.description === undefined) {
    throw new Error("data.description is required.");
  }
  if (typeof data.description !== "string") {
    throw new Error("data.description must be a string.");
  }
  if (data.user === undefined) {
    throw new Error("data.user is required.");
  }
  if (typeof data.user !== "string") {
    throw new Error("data.user must be a string.");
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

  if (t === undefined) {
    throw new Error("t is required.");
  }
  if (typeof t !== "function") {
    throw new Error("t must be a function.");
  }
  if (t.length !== 1) {
    throw new Error("t must have 1 parameter.");
  }

  if (size === undefined) {
    throw new Error("size is required.");
  }
  if (typeof size !== "string") {
    throw new Error("size must be a string.");
  }
  if (size !== "A4" && size !== "A3") {
    throw new Error("size must be either 'A4' or 'A3'.");
  }
}
