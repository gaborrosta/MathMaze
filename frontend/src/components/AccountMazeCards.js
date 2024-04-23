import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Row, Col, Button, Card, Dropdown, Pagination } from "react-bootstrap";

/**
 * AccountMazeCards displays the column of cards of mazes.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Array} props.mazes - The downloaded mazes.
 * @param {string} props.selectedLocation - The selected location.
 * @param {Function} props.addSolutionTab - The function to call when a solution tab should be added. It takes the maze id as a parameter.
 * @param {Function} props.openModal - The function to call when the modal should be opened. It takes the maze as a parameter.
 *
 * @returns {React.Element} The AccountMazeCards component.
 */
export default function AccountMazeCards({ mazes, selectedLocation, addSolutionTab, openModal }) {
  //Check the parameters
  checkParameters(mazes, selectedLocation, addSolutionTab, openModal);


  //Localisation
  const { i18n, t } = useTranslation();


  //Sorting and pagination
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortedMazes, setSortedMazes] = useState([]);
  const [pageNumbers, setPageNumbers] = useState([1]);
  const [currentPage, setCurrentPage] = useState(1);
  const [actualMazes, setActualMazes] = useState([]);


  //Handle sorting order change
  const handleSortOrderChange = useCallback((order) => {
    let newSortedMazes;
    if (order === "asc") {
      newSortedMazes = [...mazes].filter(maze => maze.location === selectedLocation).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      newSortedMazes = [...mazes].filter(maze => maze.location === selectedLocation).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const newPageNumbers = [];
    for (let i = 1; i <= Math.ceil(newSortedMazes.length / 10); i++) {
      newPageNumbers.push(i);
    }

    setActualMazes(newSortedMazes.slice(0, 10));
    setCurrentPage(1);
    setPageNumbers(newPageNumbers);
    setSortedMazes(newSortedMazes);
    setSortOrder(order);
  }, [mazes, selectedLocation]);


  //Handle page change
  const handelPageChange = useCallback((pageNumber) => {
    setActualMazes(sortedMazes.slice((pageNumber - 1) * 10, pageNumber * 10));

    setCurrentPage(pageNumber);
  }, [sortedMazes]);


  //Update mazes on sort order change
  useEffect(() => {
    handleSortOrderChange(sortOrder);
  }, [mazes, handleSortOrderChange, sortOrder]);


  //Operations
  const operations = ["operation-addition", "operation-subtraction", "operation-addition-subtraction", "operation-multiplication", "operation-division", "operation-multiplication-division"];


  //Render the component
  return (
    <Col xs={12} md={8}>
      <div className="d-flex justify-content-end m-2">
        <Dropdown onSelect={handleSortOrderChange}>
          <Dropdown.Toggle id="order">
            {t(`sort-order-${sortOrder}`)}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item eventKey="asc">{t("sort-order-asc")}</Dropdown.Item>
            <Dropdown.Item eventKey="desc">{t("sort-order-desc")}</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <div className="m-2">
        {pageNumbers.length > 1 &&
          <Pagination className="justify-content-center">
            {pageNumbers
              .filter(num => num === 1 || num === pageNumbers.length || num === currentPage || num === currentPage - 1 || num === currentPage + 1)
              .map(num => (
                <Pagination.Item key={num} active={num === currentPage} onClick={() => handelPageChange(num)}>
                  {num}
                </Pagination.Item>
              ))}
          </Pagination>
        }

        {actualMazes.map((maze, index) => (
          <Card key={index} className="mb-3">
            <Card.Body>
              <Card.Title>{t("maze-title")} #{maze.id}</Card.Title>
              <div>
                <p>{t("maze-description")}: {maze.description ? maze.description : "-"}</p>
                <Row>
                  <Col>
                    <p>{t("maze-size", { height: maze.height, width: maze.width })}</p>
                    <p>{t("maze-operation-type")}: {t(operations[maze.operation])}</p>
                    <p>{t("maze-generate-range")}: {maze.numbersRangeStart}-{maze.numbersRangeEnd}</p>
                  </Col>
                  <Col>
                    <p>{t("maze-length-of-the-path", { length: maze.pathLength })}</p>
                    <p>{t("maze-generate-path-type")}: {maze.pathTypeEven ? t("maze-generate-path-type-even") : t("maze-generate-path-type-odd")}</p>
                  </Col>
                </Row>
                <div className="mb-3">
                  <p>{t("maze-solved-by", { count: maze.solved, number: maze.solved })}</p>
                  {maze.solved > 0 && <Button variant="primary" onClick={() => addSolutionTab(maze.id)}>{t("maze-check-solutions", { count: maze.solved })}</Button>}
                </div>
                <Row>
                  <Col>
                    <Button variant="primary" onClick={() => openModal(maze)}>{t("maze-edit-details")}</Button>
                  </Col>
                  <Col>
                    <p className="text-end">{t("maze-created-at", { date: new Date(maze.createdAt).toLocaleString(i18n.resolvedLanguage) })}</p>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>
        ))}

        {pageNumbers.length > 1 &&
          <Pagination className="justify-content-center">
            {pageNumbers
              .filter(num => num === 1 || num === pageNumbers.length || num === currentPage || num === currentPage - 1 || num === currentPage + 1)
              .map(num => (
                <Pagination.Item key={num} active={num === currentPage} onClick={() => handelPageChange(num)}>
                  {num}
                </Pagination.Item>
              ))}
          </Pagination>
        }
      </div>
    </Col>
  );
}


/**
 * Checks the parameters passed to the AccountMazeCards component.
 */
function checkParameters(mazes, selectedLocation, addSolutionTab, openModal) {
  if (mazes === undefined) {
    throw new Error("mazes is required.");
  }
  if (!Array.isArray(mazes)) {
    throw new Error("mazes must be an array.");
  }
  if (mazes.some(maze => typeof maze !== "object")) {
    throw new Error("mazes must be an array of objects.");
  }
  if (mazes.some(maze => maze.id === undefined)) {
    throw new Error("mazes must have an id property.");
  }
  if (mazes.some(maze => typeof maze.id !== "number")) {
    throw new Error("mazes must have an id property of type number.");
  }
  if (mazes.some(maze => maze.description === undefined)) {
    throw new Error("mazes must have a description property.");
  }
  if (mazes.some(maze => typeof maze.description !== "string")) {
    throw new Error("mazes must have a description property of type string.");
  }
  if (mazes.some(maze => maze.height === undefined)) {
    throw new Error("mazes must have a height property.");
  }
  if (mazes.some(maze => typeof maze.height !== "number")) {
    throw new Error("mazes must have a height property of type number.");
  }
  if (mazes.some(maze => maze.width === undefined)) {
    throw new Error("mazes must have a width property.");
  }
  if (mazes.some(maze => typeof maze.width !== "number")) {
    throw new Error("mazes must have a width property of type number.");
  }
  if (mazes.some(maze => maze.operation === undefined)) {
    throw new Error("mazes must have an operation property.");
  }
  if (mazes.some(maze => typeof maze.operation !== "number")) {
    throw new Error("mazes must have an operation property of type number.");
  }
  if (mazes.some(maze => maze.numbersRangeStart === undefined)) {
    throw new Error("mazes must have a numbersRangeStart property.");
  }
  if (mazes.some(maze => typeof maze.numbersRangeStart !== "number")) {
    throw new Error("mazes must have a numbersRangeStart property of type number.");
  }
  if (mazes.some(maze => maze.numbersRangeEnd === undefined)) {
    throw new Error("mazes must have a numbersRangeEnd property.");
  }
  if (mazes.some(maze => typeof maze.numbersRangeEnd !== "number")) {
    throw new Error("mazes must have a numbersRangeEnd property of type number.");
  }
  if (mazes.some(maze => maze.pathLength === undefined)) {
    throw new Error("mazes must have a pathLength property.");
  }
  if (mazes.some(maze => typeof maze.pathLength !== "number")) {
    throw new Error("mazes must have a pathLength property of type number.");
  }
  if (mazes.some(maze => maze.pathTypeEven === undefined)) {
    throw new Error("mazes must have a pathTypeEven property.");
  }
  if (mazes.some(maze => typeof maze.pathTypeEven !== "boolean")) {
    throw new Error("mazes must have a pathTypeEven property of type boolean.");
  }
  if (mazes.some(maze => maze.solved === undefined)) {
    throw new Error("mazes must have a solved property.");
  }
  if (mazes.some(maze => typeof maze.solved !== "number")) {
    throw new Error("mazes must have a solved property of type number.");
  }
  if (mazes.some(maze => maze.createdAt === undefined)) {
    throw new Error("mazes must have a createdAt property.");
  }
  if (mazes.some(maze => typeof maze.createdAt !== "number")) {
    throw new Error("mazes must have a createdAt property of type number.");
  }
  if (mazes.some(maze => maze.location === undefined)) {
    throw new Error("mazes must have a location property.");
  }
  if (mazes.some(maze => typeof maze.location !== "string")) {
    throw new Error("mazes must have a location property of type string.");
  }

  if (selectedLocation === undefined) {
    throw new Error("selectedLocation is required.");
  }
  if (typeof selectedLocation !== "string") {
    throw new Error("selectedLocation must be a string.");
  }

  if (addSolutionTab === undefined) {
    throw new Error("addSolutionTab is required.");
  }
  if (typeof addSolutionTab !== "function") {
    throw new Error("addSolutionTab must be a function.");
  }
  if (addSolutionTab.length !== 1) {
    throw new Error("addSolutionTab must have 1 parameter.")
  }

  if (openModal === undefined) {
    throw new Error("openModal is required.");
  }
  if (typeof openModal !== "function") {
    throw new Error("openModal must be a function.");
  }
  if (openModal.length !== 1) {
    throw new Error("openModal must have 1 parameter.")
  }
}
