/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import AccountSolutionsTab from "./AccountSolutionsTab";

//Mock console.error
jest.spyOn(console, "error").mockImplementation(() => jest.fn());

//Mock the useTranslation hook
jest.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: str => str,
      i18n: {
        changeLanguage: jest.fn(),
        resolvedLanguage: "en"
      }
    }
  }
}));

//Mock the CheckMazeResults component
jest.mock("./CheckMazeResults", () => () => <div>CheckMazeResults</div>);



//The test suite
describe("AccountSolutionsTab", () => {
  it("should throw an error if data is not an object", () => {
    expect(() => render(<AccountSolutionsTab data="test" />)).toThrow("data must be an object.");
  });


  it("should throw an error if data.data is missing", () => {
    expect(() => render(<AccountSolutionsTab data={{}} />)).toThrow("data.data is required.");
  });


  it("should throw an error if data.data is not an array", () => {
    expect(() => render(<AccountSolutionsTab data={{ data: "test" }} />)).toThrow("data.data must be an array.");
  });


  it("should throw an error if data.selectedIndex is missing", () => {
    expect(() => render(<AccountSolutionsTab data={{ data: [] }} />)).toThrow("data.selectedIndex is required.");
  });


  it("should throw an error if data.selectedIndex is not a number", () => {
    expect(() => render(<AccountSolutionsTab data={{ data: [], selectedIndex: "test" }} />)).toThrow("data.selectedIndex must be a number.");
  });


  it("should throw an error if data.selectedOption is not a string", () => {
    expect(() => render(<AccountSolutionsTab data={{ data: [], selectedIndex: 0, selectedOption: 1 }} />)).toThrow("data.selectedOption must be a string.");
  });


  it("should throw an error if updateSelected is missing", () => {
    expect(() => render(<AccountSolutionsTab data={{ data: [], selectedIndex: 0, selectedOption: "" }} />)).toThrow("updateSelected is required.");
  });


  it("should throw an error if updateSelected is not a function", () => {
    expect(() => render(<AccountSolutionsTab data={{ data: [], selectedIndex: 0, selectedOption: "" }} updateSelected="test" />)).toThrow("updateSelected must be a function.");
  });


  it("should throw an error if updateSelected does not have 1 parameter", () => {
    expect(() => render(<AccountSolutionsTab data={{ data: [], selectedIndex: 0, selectedOption: "" }} updateSelected={() => {}} />)).toThrow("updateSelected must have 1 parameter.");
  });


  it("should throw an error if error is missing", () => {
    expect(() => render(<AccountSolutionsTab data={{ data: [], selectedIndex: 0, selectedOption: "" }} updateSelected={(a) => {}} />)).toThrow("error is required.");
  });


  it("should throw an error if error is not a string", () => {
    expect(() => render(<AccountSolutionsTab data={{ data: [], selectedIndex: 0, selectedOption: "" }} updateSelected={(a) => {}} error={1} />)).toThrow("error must be a string.");
  });


  it("should display an error message if error prop is provided", () => {
    //Render the component
    render(<AccountSolutionsTab updateSelected={(a) => {}} error="Test error" />);

    expect(screen.getByText("Test error")).toBeInTheDocument();
  });


  it("should display a loading spinner if data is not provided", () => {
    //Render the component
    render(<AccountSolutionsTab updateSelected={(a) => {}} error="" />);

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });


  it("should display the solution if only one solution is provided", () => {
    const data = {
      data: [{ info: { nickname: "Test solution" } }],
      selectedIndex: 0,
      selectedOption: "Test solution",
    };

    //Render the component
    render(<AccountSolutionsTab data={data} updateSelected={(a) => {}} error="" />);

    expect(screen.getByText("CheckMazeResults")).toBeInTheDocument();
  });


  it("should display a dropdown if multiple solutions are provided", () => {
    //Mock the updateSelected function
    const updateSelected = jest.fn((a) => {});

    const data = {
      data: [
        { info: { nickname: "Test solution 1" } },
        { info: { nickname: "Test solution 2" } },
      ],
      selectedIndex: 0,
      selectedOption: "Test solution 1",
    };

    //Render the component
    render(<AccountSolutionsTab data={data} updateSelected={updateSelected} error="" />);

    expect(screen.getByText("Test solution 1")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Test solution 1"));

    expect(screen.getByText("Test solution 2")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Test solution 2"));

    expect(updateSelected).toHaveBeenCalledTimes(1);
  });


  it("should display a dropdown with no default value if multiple solutions are provided", () => {
    const data = {
      data: [
        { info: { nickname: "Test solution 1" } },
        { info: { nickname: "Test solution 2" } },
      ],
      selectedIndex: 0,
    };

    //Render the component
    render(<AccountSolutionsTab data={data} updateSelected={(a) => {}} error="" />);

    expect(screen.getByText("account-solution-dropdown")).toBeInTheDocument();
  });
});
