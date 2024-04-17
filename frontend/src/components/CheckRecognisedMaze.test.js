/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import CheckRecognisedMaze from "./CheckRecognisedMaze";

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

//Mock NicknameForm
jest.mock("../components/NicknameForm", () => ({initialNickname, isSubmitDisabled, setIsSubmitDisabled, handleSubmit}) => <button data-testid="nickname-form" onClick={() => handleSubmit(initialNickname)} />);


//The test suite
describe("CheckRecognisedMaze", () => {
  it("throws an error if data is missing", () => {
    expect(() => render(<CheckRecognisedMaze />)).toThrow("data is required.");
  });


  it("throws an error if data is not an object", () => {
    expect(() => render(<CheckRecognisedMaze data="test" />)).toThrow("data must be an object.");
  });


  it("throws an error if data is missing an id", () => {
    expect(() => render(<CheckRecognisedMaze data={{}} />)).toThrow("data.id is required.");
  });


  it("throws an error if data.id is not a number", () => {
    expect(() => render(<CheckRecognisedMaze data={{id: "1"}} />)).toThrow("data.id must be a number.");
  });


  it("throws an error if data is missing a width", () => {
    expect(() => render(<CheckRecognisedMaze data={{id: 1}} />)).toThrow("data.width is required.");
  });


  it("throws an error if data.width is not a number", () => {
    expect(() => render(<CheckRecognisedMaze data={{id: 1, width: "5"}} />)).toThrow("data.width must be a number.");
  });


  it("throws an error if data is missing a height", () => {
    expect(() => render(<CheckRecognisedMaze data={{id: 1, width: 5}} />)).toThrow("data.height is required.");
  });


  it("throws an error if data.height is not a number", () => {
    expect(() => render(<CheckRecognisedMaze data={{id: 1, width: 5, height: "5"}} />)).toThrow("data.height must be a number.");
  });


  it("throws an error if data is missing a start", () => {
    expect(() => render(<CheckRecognisedMaze data={{id: 1, width: 5, height: 5}} />)).toThrow("data.start is required.");
  });


  it("throws an error if data.start is not an array", () => {
    expect(() => render(<CheckRecognisedMaze data={{id: 1, width: 5, height: 5, start: "test"}} />)).toThrow("data.start must be an array.");
  });


  it("throws an error if data.start has only one element", () => {
    expect(() => render(<CheckRecognisedMaze data={{id: 1, width: 5, height: 5, start: [0]}} />)).toThrow("data.start must have 2 elements.");
  });


  it("throws an error if data is missing an end", () => {
    expect(() => render(<CheckRecognisedMaze data={{id: 1, width: 5, height: 5, start: [0, 0]}} />)).toThrow("data.end is required.");
  });


  it("throws an error if data.end is not an array", () => {
    expect(() => render(<CheckRecognisedMaze data={{id: 1, width: 5, height: 5, start: [0, 0], end: "test"}} />)).toThrow("data.end must be an array.");
  });


  it("throws an error if data.end has only one element", () => {
    expect(() => render(<CheckRecognisedMaze data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4]}} />)).toThrow("data.end must have 2 elements.");
  });


  it("throws an error if data is missing a path", () => {
    expect(() => render(<CheckRecognisedMaze data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4]}} />)).toThrow("data.path is required.");
  });


  it("throws an error if data.path is not an array", () => {
    expect(() => render(<CheckRecognisedMaze data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: "test"}} />)).toThrow("data.path must be an array.");
  });


  it("throws an error if data.path is not an array of objects with x and y properties", () => {
    expect(() => render(<CheckRecognisedMaze data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1}]}} />)).toThrow("data.path must be an array of objects with x and y properties.");
  });


  it("throws an error if data is missing a data", () => {
    expect(() => render(<CheckRecognisedMaze data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}]}} />)).toThrow("data.data is required.");
  });


  it("throws an error if data.data is not an array", () => {
    expect(() => render(<CheckRecognisedMaze data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: "test"}} />)).toThrow("data.data must be an array.");
  });


  it("throws an error if data.data does not have the same height as data.height", () => {
    expect(() => render(<CheckRecognisedMaze data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: []}} />)).toThrow("data.data must have the same height as data.height.");
  });


  it("throws an error if data.data is not an array of arrays", () => {
    expect(() => render(<CheckRecognisedMaze data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: [1, 2, 3, 4, 5]}} />)).toThrow("data.data must be an array of arrays.");
  });


  it("throws an error if data.data does not have the same width as data.width", () => {
    expect(() => render(<CheckRecognisedMaze data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: [[1], [2], [3], [4], [5]]}} />)).toThrow("data.data must have the same width as data.width.");
  });


  it("throws an error if data.data is not an array of arrays of strings", () => {
    expect(() => render(<CheckRecognisedMaze data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: [["1", "2", "3", "4", "5"], ["1", 2, "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} />)).toThrow("data.data must be an array of arrays of strings.");
  });


  it("throws an error if initialNickname is missing", () => {
    expect(() => render(<CheckRecognisedMaze data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} />)).toThrow("initialNickname is required.");
  });


  it("throws an error if initialNickname is not a string", () => {
    expect(() => render(<CheckRecognisedMaze data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} initialNickname={1} />)).toThrow("initialNickname must be a string.");
  });


  it("throws an error if handleSubmit is missing", () => {
    expect(() => render(<CheckRecognisedMaze data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} initialNickname="nothing" />)).toThrow("handleSubmit is required.");
  });


  it("throws an error if handleSubmit is is not a function", () => {
    expect(() => render(<CheckRecognisedMaze data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} initialNickname="nothing" handleSubmit="test" />)).toThrow("handleSubmit must be a function.");
  });


  it("throws an error if handleSubmit is missing", () => {
    expect(() => render(<CheckRecognisedMaze data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} initialNickname="nothing" handleSubmit={() => {}} />)).toThrow("handleSubmit must have 1 parameter.");
  });


  it("handles path change", async () => {
    //Mock the handleSubmit function
    const handleSubmit = jest.fn((a) => {});

    //data
    const dataList = [["", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", ""]];

    //Render the component
    render(<CheckRecognisedMaze data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: dataList}} initialNickname="nothing" handleSubmit={handleSubmit} />);

    const checkboxes = screen.getAllByRole("checkbox");

    let tickedCheckboxes = checkboxes.filter(checkbox => checkbox.checked);

    expect(tickedCheckboxes.length).toBe(1);

    fireEvent.click(checkboxes[0]);

    tickedCheckboxes = checkboxes.filter(checkbox => checkbox.checked);

    expect(tickedCheckboxes.length).toBe(2);

    fireEvent.click(tickedCheckboxes[1]);

    tickedCheckboxes = checkboxes.filter(checkbox => checkbox.checked);

    expect(tickedCheckboxes.length).toBe(1);

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
      expect(handleSubmit).toHaveBeenCalledWith({
        data: dataList,
        mazeId: 1,
        nickname: "nothing",
        path: [{x: 1, y:0}],
      });
    });
  });


  it("handles cell change", async () => {
    //Mock the handleSubmit function
    const handleSubmit = jest.fn((a) => {});

    //data
    const dataList = [["", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", ""]];

    //Render the component
    render(<CheckRecognisedMaze data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], path: [{x: 1, y: 1}], data: dataList}} initialNickname="nothing" handleSubmit={handleSubmit} />);

    const inputs = screen.getAllByRole("textbox");

    fireEvent.change(inputs[0], { target: { value: "a" } });

    expect(inputs[0].value).toBe("2");

    fireEvent.change(inputs[0], { target: { value: "22" } });

    expect(inputs[0].value).toBe("22");

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
      expect(handleSubmit).toHaveBeenCalledWith({
        data: [["", "22", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", ""]],
        mazeId: 1,
        nickname: "nothing",
        path: [{x: 1, y:1}],
      });
    });
  });
});
