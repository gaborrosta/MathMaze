import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, Dropdown, Row } from "react-bootstrap";
import LoadingSpinner from "./LoadingSpinner";
import CheckMazeResults from "./CheckMazeResults";

export default function AccountSolutionsTab({ data, updateData, error }) {
  const { t } = useTranslation();

  if (error) {
    return (
      <Alert variant="danger">{t(error)}</Alert>
    );
  }

  if (!data) {
    return <LoadingSpinner />;
  }

  const solutions = data.data;
  const selectedIndex = (solutions.length === 1) ? 0 : data.selectedIndex;
  const selectedOption = data.selectedOption;

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
                  onClick={() => updateData({
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
