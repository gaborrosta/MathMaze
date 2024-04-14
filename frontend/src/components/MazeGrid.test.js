/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import MazeGrid from "./MazeGrid";

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


//The test suite
describe("MazeGrid", () => {
  it("throws an error if data is missing", () => {
    expect(() => render(<MazeGrid />)).toThrow("data is required.");
  });


  it("throws an error if data is not an object", () => {
    expect(() => render(<MazeGrid data="test" />)).toThrow("data must be an object.");
  });


  it("throws an error if data is missing an id", () => {
    expect(() => render(<MazeGrid data={{}} />)).toThrow("data.id is required.");
  });


  it("throws an error if data.id is not a number", () => {
    expect(() => render(<MazeGrid data={{id: "1"}} />)).toThrow("data.id must be a number.");
  });


  it("throws an error if data is missing a width", () => {
    expect(() => render(<MazeGrid data={{id: 1}} />)).toThrow("data.width is required.");
  });


  it("throws an error if data.width is not a number", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: "5"}} />)).toThrow("data.width must be a number.");
  });


  it("throws an error if data is missing a height", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5}} />)).toThrow("data.height is required.");
  });


  it("throws an error if data.height is not a number", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: "5"}} />)).toThrow("data.height must be a number.");
  });


  it("throws an error if data is missing a start", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: 5}} />)).toThrow("data.start is required.");
  });


  it("throws an error if data.start is not an array", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: 5, start: "test"}} />)).toThrow("data.start must be an array.");
  });


  it("throws an error if data.start has only one element", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0]}} />)).toThrow("data.start must have 2 elements.");
  });


  it("throws an error if data is missing an end", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0]}} />)).toThrow("data.end is required.");
  });


  it("throws an error if data.end is not an array", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0], end: "test"}} />)).toThrow("data.end must be an array.");
  });


  it("throws an error if data.end has only one element", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4]}} />)).toThrow("data.end must have 2 elements.");
  });


  it("throws an error if data is missing a path", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4]}} />)).toThrow("data.path is required.");
  });


  it("throws an error if data.path is not an array", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: "test"}} />)).toThrow("data.path must be an array.");
  });


  it("throws an error if data.path is not an array of objects with x and y properties", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1}]}} />)).toThrow("data.path must be an array of objects with x and y properties.");
  });


  it("throws an error if data is missing a data", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}]}} />)).toThrow("data.data is required.");
  });


  it("throws an error if data.data is not an array", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: "test"}} />)).toThrow("data.data must be an array.");
  });


  it("throws an error if data.data does not have the same height as data.height", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: []}} />)).toThrow("data.data must have the same height as data.height.");
  });


  it("throws an error if data.data is not an array of arrays", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: [1, 2, 3, 4, 5]}} />)).toThrow("data.data must be an array of arrays.");
  });


  it("throws an error if data.data does not have the same width as data.width", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: [[1], [2], [3], [4], [5]]}} />)).toThrow("data.data must have the same width as data.width.");
  });


  it("throws an error if data.data is not an array of arrays of strings", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: [["1", "2", "3", "4", "5"], ["1", 2, "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} />)).toThrow("data.data must be an array of arrays of strings.");
  });


  it("throws an error if disabled is missing", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} />)).toThrow("disabled is required.");
  });


  it("throws an error if disabled is not a boolean", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} disabled="test" />)).toThrow("disabled must be a boolean.");
  });


  it("throws an error if save is missing", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} disabled={false} />)).toThrow("save is required.");
  });


  it("throws an error if save is not a function", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} disabled={false} save="test" />)).toThrow("save must be a function.");
  });


  it("throws an error if save has parameters", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} disabled={false} save={(a) => {}} />)).toThrow("save must have 0 parameters.");
  });


  it("throws an error if saveError is missing", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} disabled={false} save={() => {}} />)).toThrow("saveError is required.");
  });


  it("throws an error if saveError is not a string", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} disabled={false} save={() => {}} saveError={5} />)).toThrow("saveError must be a string.");
  });


  it("throws an error is setSaveError is missing", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} disabled={false} save={() => {}} saveError="" />)).toThrow("setSaveError is required.");
  });


  it("throws an error if setSaveError is not a function", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} disabled={false} save={() => {}} saveError="" setSaveError="test" />)).toThrow("setSaveError must be a function.");
  });


  it("throws an error if setSaveError has more than 1 parameter", () => {
    expect(() => render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} disabled={false} save={() => {}} saveError="" setSaveError={(a, b) => {}} />)).toThrow("setSaveError must have 1 parameter.");
  });


  it("renders", () => {
    //Render the component
    render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} disabled={false} save={() => {}} saveError="" setSaveError={(a) => {}} />);

    expect(screen.getByText("maze-start")).toBeInTheDocument();
    expect(screen.getByText("maze-end")).toBeInTheDocument();
  });


  it("calls save function when save button is clicked", () => {
    //Mock the save, saveError functions
    const mockSave = jest.fn();
    const mockSetSaveError = jest.fn((a) => {});

    //Render the component
    render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} disabled={false} save={mockSave} saveError="" setSaveError={mockSetSaveError} />);

    fireEvent.click(screen.getByText("maze-generated-use"));

    expect(mockSave).toHaveBeenCalled();

    expect(mockSetSaveError).toHaveBeenCalled();

    expect(screen.getByRole("button", { name: "maze-generated-use" })).toBeDisabled();
  });


  it("displays error message when saveError is not empty", () => {
    //Render the component
    render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} disabled={false} save={() => {}} saveError="error" setSaveError={(a) => {}} />);

    expect(screen.getByText("error")).toBeInTheDocument();
  });


  it("changes showPath state when toggle button is clicked", () => {
    //Render the component
    render(<MazeGrid data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} disabled={false} save={() => {}} saveError="error" setSaveError={(a) => {}} />);

    fireEvent.click(screen.getByText("maze-path-show"));

    expect(screen.getByText("maze-path-hide")).toBeInTheDocument();
  });
});
