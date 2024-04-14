import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, Dropdown, Row } from "react-bootstrap";
import LoadingSpinner from "./LoadingSpinner";
import CheckMazeResults from "./CheckMazeResults";

/**
 * AccountSolutionsTab displays the solutions to a maze.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.data - The solutions data.
 * @param {Function} props.updateSelected - The function to call when a different solution is selected.
 * @param {string} props.error - Possible error message.
 *
 * @returns {React.Element} The AccountSolutionsTab component.
 */
export default function AccountSolutionsTab({ data, updateSelected, error }) {
  //Check the parameters
  checkParameters(data, updateSelected, error);


  //Localisation
  const { t } = useTranslation();


  //If there is an error, display it
  if (error) {
    return (
      <Alert variant="danger">{t(error)}</Alert>
    );
  }


  //If the data is not loaded yet, display a loading spinner
  if (!data) {
    return <LoadingSpinner />;
  }


  //Extract data
  const solutions = data.data;
  const selectedIndex = (solutions.length === 1) ? 0 : data.selectedIndex;
  const selectedOption = data.selectedOption;


  //Render the component
  return (
    <>
      <p>{t("maze-solved-by-info", { count: solutions.length, number: solutions.length })}</p>
      <Row className="mb-3">
        {solutions.length > 1 &&
          <Dropdown>
            <Dropdown.Toggle variant="primary" id="dropdown-nicknames">
              {selectedOption || t("account-solution-dropdown")}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {solutions.map((solution, index) => (
                <Dropdown.Item
                  key={index}
                  onClick={() => updateSelected({
                    ...data,
                    selectedOption: solution.info.nickname,
                    selectedIndex: index,
                  })}
                >
                  {solution.info.nickname}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        }
      </Row>

      {selectedIndex !== -1 && <CheckMazeResults data={solutions[selectedIndex]} />}
    </>
  );
}


/**
 * Checks the parameters passed to the AccountSolutionsTab component.
 */
function checkParameters(data, updateSelected, error) {
  if (data !== undefined) {
    if (typeof data !== "object") {
      throw new Error("data must be an object.");
    }
    if (data.data === undefined) {
      throw new Error("data.data is required.");
    }
    if (!Array.isArray(data.data)) {
      throw new Error("data.data must be an array.");
    }
    if (data.selectedIndex === undefined) {
      throw new Error("data.selectedIndex is required.");
    }
    if (typeof data.selectedIndex !== "number") {
      throw new Error("data.selectedIndex must be a number.");
    }
    if (data.selectedOption !== undefined && typeof data.selectedOption !== "string") {
      throw new Error("data.selectedOption must be a string.");
    }
  }

  if (updateSelected === undefined) {
    throw new Error("updateSelected is required.");
  }
  if (typeof updateSelected !== "function") {
    throw new Error("updateSelected must be a function.");
  }
  if (updateSelected.length !== 1) {
    throw new Error("updateSelected must have 1 parameter.");
  }

  if (error === undefined) {
    throw new Error("error is required.");
  }
  if (typeof error !== "string") {
    throw new Error("error must be a string.");
  }
}
