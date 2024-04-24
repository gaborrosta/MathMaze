/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import MazeOnlineSolve from "./MazeOnlineSolve";

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
  },
  Trans: ({ i18nKey }) => i18nKey
}));

//Mock the timers
jest.useFakeTimers();

//Mock NicknameForm
jest.mock("../components/NicknameForm", () => ({initialNickname, isSubmitDisabled, setIsSubmitDisabled, handleSubmit}) => <button data-testid="nickname-form" onClick={() => handleSubmit(initialNickname)} />);


//The test suite
describe("MazeOnlineSolve", () => {
  it("throws an error if data is missing", () => {
    expect(() => render(<MazeOnlineSolve />)).toThrow("data is required.");
  });


  it("throws an error if data is not an object", () => {
    expect(() => render(<MazeOnlineSolve data="test" />)).toThrow("data must be an object.");
  });


  it("throws an error if data is missing an id", () => {
    expect(() => render(<MazeOnlineSolve data={{}} />)).toThrow("data.id is required.");
  });


  it("throws an error if data.id is not a number", () => {
    expect(() => render(<MazeOnlineSolve data={{id: "1"}} />)).toThrow("data.id must be a number.");
  });


  it("throws an error if data is missing a width", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1}} />)).toThrow("data.width is required.");
  });


  it("throws an error if data.width is not a number", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: "5"}} />)).toThrow("data.width must be a number.");
  });


  it("throws an error if data is missing a height", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5}} />)).toThrow("data.height is required.");
  });


  it("throws an error if data.height is not a number", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: "5"}} />)).toThrow("data.height must be a number.");
  });


  it("throws an error if data is missing a start", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5}} />)).toThrow("data.start is required.");
  });


  it("throws an error if data.start is not an array", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: "test"}} />)).toThrow("data.start must be an array.");
  });


  it("throws an error if data.start has only one element", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0]}} />)).toThrow("data.start must have 2 elements.");
  });


  it("throws an error if data is missing an end", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0]}} />)).toThrow("data.end is required.");
  });


  it("throws an error if data.end is not an array", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: "test"}} />)).toThrow("data.end must be an array.");
  });


  it("throws an error if data.end has only one element", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4]}} />)).toThrow("data.end must have 2 elements.");
  });


  it("throws an error if data is missing a pathTypeEven", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4]}} />)).toThrow("data.pathTypeEven is required.");
  });


  it("throws an error if data.pathTypeEven is not a boolean", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], pathTypeEven: 5}} />)).toThrow("data.pathTypeEven must be a boolean.");
  });


  it("throws an error if data is missing a pathLength", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], pathTypeEven: true}} />)).toThrow("data.pathLength is required.");
  });


  it("throws an error if data.pathLength is not a number", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], pathTypeEven: true, pathLength: "5"}} />)).toThrow("data.pathLength must be a number.");
  });


  it("throws an error if data is missing a data", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], pathTypeEven: true, pathLength: 5}} />)).toThrow("data.data is required.");
  });


  it("throws an error if data.data is not an array", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], pathTypeEven: true, pathLength: 5, data: "test"}} />)).toThrow("data.data must be an array.");
  });


  it("throws an error if data.data does not have the same height as data.height", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], pathTypeEven: true, pathLength: 5, data: []}} />)).toThrow("data.data must have the same height as data.height.");
  });


  it("throws an error if data.data is not an array of arrays", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], pathTypeEven: true, pathLength: 5, data: [1, 2, 3, 4, 5]}} />)).toThrow("data.data must be an array of arrays.");
  });


  it("throws an error if data.data does not have the same width as data.width", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], pathTypeEven: true, pathLength: 5, data: [[1], [2], [3], [4], [5]]}} />)).toThrow("data.data must have the same width as data.width.");
  });


  it("throws an error if data.data is not an array of arrays of strings", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], pathTypeEven: true, pathLength: 5, data: [["1", "2", "3", "4", "5"], ["1", 2, "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} />)).toThrow("data.data must be an array of arrays of strings.");
  });


  it("throws an error if initialNickname is missing", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], pathTypeEven: true, pathLength: 5, data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} />)).toThrow("initialNickname is required.");
  });


  it("throws an error if initialNickname is not a string", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], pathTypeEven: true, pathLength: 5, data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} initialNickname={1} />)).toThrow("initialNickname must be a string.");
  });


  it("throws an error if initialMaze is not an array", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], pathTypeEven: true, pathLength: 5, data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} initialNickname={"name"} initialMaze="test" />)).toThrow("initialMaze must be an array.");
  });


  it("throws an error if initialMaze does not have the same height as data.height", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], pathTypeEven: true, pathLength: 5, data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} initialNickname={"name"} initialMaze={[]} />)).toThrow("initialMaze must have the same height as data.height.");
  });


  it("throws an error if initialMaze is not an array of arrays", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], pathTypeEven: true, pathLength: 5, data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} initialNickname={"name"} initialMaze={[1, 2, 3, 4, 5]} />)).toThrow("initialMaze must be an array of arrays.");
  });


  it("throws an error if initialMaze does not have the same width as data.width", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], pathTypeEven: true, pathLength: 5, data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} initialNickname={"name"} initialMaze={[["1"], ["2"], ["3"], ["4"], ["5"]]} />)).toThrow("initialMaze must have the same width as data.width.");
  });


  it("throws an error if initialMaze is not an array of arrays of strings", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], pathTypeEven: true, pathLength: 5, data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} initialNickname={"name"} initialMaze={[["1", "2", "3", "4", "5"], ["1", 2, "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]} />)).toThrow("initialMaze must be an array of arrays of strings.");
  });


  it("throws an error if initialPath is not an array", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], pathTypeEven: true, pathLength: 5, data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} initialNickname={"name"} initialMaze={[["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]} initialPath={"test"} />)).toThrow("initialPath must be an array.");
  });


  it("throws an error if initialPath is not an array of objects with x and y properties", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], pathTypeEven: true, pathLength: 5, data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} initialNickname={"name"} initialMaze={[["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]} initialPath={["test"]} />)).toThrow("initialPath must be an array of objects with x and y properties.");
  });


  it("throws an error if handleSubmit is missing", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], pathTypeEven: true, pathLength: 5, data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} initialNickname={"name"} initialMaze={[["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]} initialPath={[{x: 0, y: 0}]} />)).toThrow("handleSubmit is required.");
  });


  it("throws an error if handleSubmit is not a function", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], pathTypeEven: true, pathLength: 5, data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} initialNickname={"name"} initialMaze={[["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]} initialPath={[{x: 0, y: 0}]} handleSubmit="test" />)).toThrow("handleSubmit must be a function.");
  });


  it("throws an error if handleSubmit has less than 1 parameter", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], pathTypeEven: true, pathLength: 5, data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} initialNickname={"name"} initialMaze={[["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]} initialPath={[{x: 0, y: 0}]} handleSubmit={() => {}} />)).toThrow("handleSubmit must have 1 parameter.");
  });


  it("throws an error if submitError is missing", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], pathTypeEven: true, pathLength: 5, data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} initialNickname={"name"} initialMaze={[["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]} initialPath={[{x: 0, y: 0}]} handleSubmit={(a) => {}} />)).toThrow("submitError is required.");
  });


  it("throws an error if submitError is not a string", () => {
    expect(() => render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], pathTypeEven: true, pathLength: 5, data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} initialNickname={"name"} initialMaze={[["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]} initialPath={[{x: 0, y: 0}]} handleSubmit={(a) => {}} submitError={1} />)).toThrow("submitError must be a string.");
  });


  it("renders with error an initial", () => {
    //Mock the handleSubmit function
    const handleSubmit = jest.fn((a) => {});

    //Render the component
    render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], pathTypeEven: true, pathLength: 5, data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} initialNickname={"name"} initialMaze={[["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]} initialPath={[{x: 0, y: 0}]} handleSubmit={handleSubmit} submitError={"test"} />);

    expect(screen.getByText("maze-solve-online-instructions")).toBeInTheDocument();
    expect(screen.getByText(/maze-solve-online-info1/i)).toBeInTheDocument();
    expect(screen.getByText(/maze-solve-online-info2/i)).toBeInTheDocument();
    expect(screen.getByText("pdf-good-luck")).toBeInTheDocument();
    expect(screen.getByText("test")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("nickname-form"));

    expect(handleSubmit).toHaveBeenCalled();
    expect(handleSubmit).toHaveBeenCalledWith({ mazeId: 1, data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]], path: [{ x: 0, y: 0 }], nickname: "name" });

    expect(screen.getByText("maze-solve-online-legend-keys")).toBeInTheDocument();
    expect(screen.getByText("maze-check-legend")).toBeInTheDocument();
    expect(screen.getByText("maze-solve-online-selected")).toBeInTheDocument();
    expect(screen.getByText("maze-solve-online-path")).toBeInTheDocument();
    expect(screen.getByText("maze-solve-online-keys")).toBeInTheDocument();
    expect(screen.getByText("maze-solve-online-keys-move")).toBeInTheDocument();
    expect(screen.getByText("maze-solve-online-keys-edit")).toBeInTheDocument();
    expect(screen.getByText("maze-solve-online-keys-save")).toBeInTheDocument();
    expect(screen.getByText("maze-solve-online-keys-mark")).toBeInTheDocument();
    expect(screen.getByText("maze-solve-online-keys-mouse")).toBeInTheDocument();
  });


  it("renders", () => {
    //Mock the handleSubmit function
    const handleSubmit = jest.fn((a) => {});

    //Render the component
    render(<MazeOnlineSolve data={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], pathTypeEven: false, pathLength: 5, data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} initialNickname={""} handleSubmit={handleSubmit} submitError={""} />);

    expect(screen.getByText("maze-solve-online-instructions")).toBeInTheDocument();
    expect(screen.getByText(/maze-solve-online-info1/i)).toBeInTheDocument();
    expect(screen.getByText(/maze-solve-online-info2/i)).toBeInTheDocument();
    expect(screen.getByText("pdf-good-luck")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("nickname-form"));

    expect(handleSubmit).toHaveBeenCalled();
    expect(handleSubmit).toHaveBeenCalledWith({ mazeId: 1, data:  [["", "", "", "", ""], ["", "", "", "", ""], ["", "", "", "", ""], ["", "", "", "", ""], ["", "", "", "", ""]], path: [{ x: 0, y: 0 }, { x: 4, y: 4 }], nickname: "" });

    expect(screen.getByText("maze-solve-online-legend-keys")).toBeInTheDocument();
    expect(screen.getByText("maze-check-legend")).toBeInTheDocument();
    expect(screen.getByText("maze-solve-online-selected")).toBeInTheDocument();
    expect(screen.getByText("maze-solve-online-path")).toBeInTheDocument();
    expect(screen.getByText("maze-solve-online-keys")).toBeInTheDocument();
    expect(screen.getByText("maze-solve-online-keys-move")).toBeInTheDocument();
    expect(screen.getByText("maze-solve-online-keys-edit")).toBeInTheDocument();
    expect(screen.getByText("maze-solve-online-keys-save")).toBeInTheDocument();
    expect(screen.getByText("maze-solve-online-keys-mark")).toBeInTheDocument();
    expect(screen.getByText("maze-solve-online-keys-mouse")).toBeInTheDocument();
  });


  it("renders and move around with arrows and arrow clicks, mark path and edit some", () => {
    //Render the component
    render(<MazeOnlineSolve data={{id: 1, width: 6, height: 6, start: [0, 0], end: [5, 5], pathTypeEven: false, pathLength: 5, data: [["1", "2", "3", "4", "5", "6"], ["7", "8", "9", "10", "11", "12"], ["13", "14", "15", "16", "17", "18"], ["19", "20", "21", "22", "23", "24"], ["25", "26", "27", "28", "29", "30"], ["31", "32", "33", "34", "35", "36"]]}} initialNickname={""} handleSubmit={(a) => {}} submitError={""} />);

    expect(screen.getByText("maze-start")).toBeInTheDocument();

    fireEvent.click(screen.getByText("maze-start"));

    fireEvent.keyDown(screen.getByText("maze-start"), { key: "x" });

    expect(screen.getByText("maze-start").parentElement.parentElement).toHaveClass("path");

    expect(screen.getByTestId("arrow-up")).toHaveClass("text-white");
    expect(screen.getByTestId("arrow-down")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-left")).toHaveClass("text-white");
    expect(screen.getByTestId("arrow-right")).not.toHaveClass("text-white");

    fireEvent.click(screen.getByTestId("arrow-right"));

    expect(screen.getByText("maze-start").parentElement.parentElement).not.toHaveClass("yellow");

    expect(screen.getByText("2").parentElement.parentElement).toHaveClass("yellow");

    expect(screen.getByTestId("arrow-up")).toHaveClass("text-white");
    expect(screen.getByTestId("arrow-down")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-left")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-right")).not.toHaveClass("text-white");

    fireEvent.keyDown(screen.getByText("2"), { key: "x" });

    expect(screen.getByText("2").parentElement.parentElement).toHaveClass("path");

    fireEvent.keyDown(screen.getByText("2"), { key: "x" });

    expect(screen.getByText("2").parentElement.parentElement).not.toHaveClass("path");

    fireEvent.keyDown(screen.getByText("2"), { key: "ArrowRight" });

    expect(screen.getByText("2").parentElement.parentElement).not.toHaveClass("yellow");

    expect(screen.getByText("3").parentElement.parentElement).toHaveClass("yellow");

    expect(screen.getByTestId("arrow-up")).toHaveClass("text-white");
    expect(screen.getByTestId("arrow-down")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-left")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-right")).not.toHaveClass("text-white");

    fireEvent.keyDown(screen.getByText("3"), { key: "ArrowRight" });

    expect(screen.getByText("3").parentElement.parentElement).not.toHaveClass("yellow");

    expect(screen.getByText("4").parentElement.parentElement).toHaveClass("yellow");

    expect(screen.getByTestId("arrow-up")).toHaveClass("text-white");
    expect(screen.getByTestId("arrow-down")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-left")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-right")).not.toHaveClass("text-white");

    fireEvent.keyDown(screen.getByText("4"), { key: "ArrowRight" });

    expect(screen.getByText("4").parentElement.parentElement).not.toHaveClass("yellow");

    expect(screen.getByText("5").parentElement.parentElement).toHaveClass("yellow");

    expect(screen.getByTestId("arrow-up")).toHaveClass("text-white");
    expect(screen.getByTestId("arrow-down")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-left")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-right")).not.toHaveClass("text-white");

    fireEvent.keyDown(screen.getByText("5"), { key: "ArrowRight" });

    expect(screen.getByText("5").parentElement.parentElement).not.toHaveClass("yellow");

    expect(screen.getByText("6").parentElement.parentElement).toHaveClass("yellow");

    expect(screen.queryByText("maze-start")).not.toBeInTheDocument();

    expect(screen.getByTestId("arrow-up")).toHaveClass("text-white");
    expect(screen.getByTestId("arrow-down")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-left")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-right")).toHaveClass("text-white");

    fireEvent.keyDown(screen.getByText("6"), { key: "ArrowRight" });

    expect(screen.getByText("6").parentElement.parentElement).toHaveClass("yellow");

    fireEvent.keyDown(screen.getByText("6"), { key: "ArrowDown" });

    expect(screen.getByText("6").parentElement.parentElement).not.toHaveClass("yellow");

    expect(screen.getByText("12").parentElement.parentElement).toHaveClass("yellow");

    expect(screen.getByTestId("arrow-up")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-down")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-left")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-right")).toHaveClass("text-white");

    fireEvent.click(screen.getByTestId("arrow-down"));

    expect(screen.getByText("12").parentElement.parentElement).not.toHaveClass("yellow");

    expect(screen.getByText("18").parentElement.parentElement).toHaveClass("yellow");

    expect(screen.getByTestId("arrow-up")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-down")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-left")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-right")).toHaveClass("text-white");

    fireEvent.keyDown(screen.getByText("18"), { key: " " })

    fireEvent.change(screen.getByText("18").parentNode.querySelector("input"), { target: { value: "á" } });

    fireEvent.keyDown(screen.getByText("18"), { key: "x" })

    expect(screen.getByText("18").parentElement.parentElement).not.toHaveClass("path");

    fireEvent.keyDown(screen.getByText("18"), { key: "Enter" })

    expect(screen.getByText("maze-solve-online-not-number")).toBeInTheDocument();

    fireEvent.change(screen.getByText("18").parentNode.querySelector("input"), { target: { value: "-3" } });

    fireEvent.keyDown(screen.getByText("18"), { key: "Enter" })

    expect(screen.getByText("maze-solve-online-not-number")).toBeInTheDocument();

    fireEvent.change(screen.getByText("18").parentNode.querySelector("input"), { target: { value: "1000" } });

    fireEvent.keyDown(screen.getByText("18"), { key: "Enter" });

    fireEvent.keyDown(screen.getByText(/18.*1000/s), { key: "ArrowDown" });

    expect(screen.getByText(/18.*1000/s).parentElement.parentElement).not.toHaveClass("yellow");

    expect(screen.getByText("24").parentElement.parentElement).toHaveClass("yellow");

    expect(screen.getByTestId("arrow-up")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-down")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-left")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-right")).toHaveClass("text-white");

    fireEvent.keyDown(screen.getByText("24"), { key: "ArrowDown" });

    expect(screen.getByText("24").parentElement.parentElement).not.toHaveClass("yellow");

    expect(screen.getByText("30").parentElement.parentElement).toHaveClass("yellow");

    expect(screen.getByTestId("arrow-up")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-down")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-left")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-right")).toHaveClass("text-white");

    fireEvent.keyDown(screen.getByText("30"), { key: "ArrowDown" });

    expect(screen.getByText("30").parentElement.parentElement).not.toHaveClass("yellow");

    expect(screen.getByText("maze-end").parentElement.parentElement).toHaveClass("yellow");

    expect(screen.getByTestId("arrow-up")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-down")).toHaveClass("text-white");
    expect(screen.getByTestId("arrow-left")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-right")).toHaveClass("text-white");

    fireEvent.keyDown(screen.getByText("maze-end"), { key: "x" });

    expect(screen.getByText("maze-end").parentElement.parentElement).toHaveClass("path");

    fireEvent.keyDown(screen.getByText("maze-end"), { key: "ArrowDown" });

    expect(screen.getByText("maze-end").parentElement.parentElement).toHaveClass("yellow");

    fireEvent.keyDown(screen.getByText("maze-end"), { key: "ArrowLeft" });

    expect(screen.getByText("maze-end").parentElement.parentElement).not.toHaveClass("yellow");

    expect(screen.getByText("35").parentElement.parentElement).toHaveClass("yellow");

    expect(screen.getByTestId("arrow-up")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-down")).toHaveClass("text-white");
    expect(screen.getByTestId("arrow-left")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-right")).not.toHaveClass("text-white");

    fireEvent.click(screen.getByTestId("arrow-left"));

    expect(screen.getByText("35").parentElement.parentElement).not.toHaveClass("yellow");

    expect(screen.getByText("34").parentElement.parentElement).toHaveClass("yellow");

    expect(screen.getByTestId("arrow-up")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-down")).toHaveClass("text-white");
    expect(screen.getByTestId("arrow-left")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-right")).not.toHaveClass("text-white");

    fireEvent.keyDown(screen.getByText("34"), { key: "ArrowLeft" });

    expect(screen.getByText("34").parentElement.parentElement).not.toHaveClass("yellow");

    expect(screen.getByText("33").parentElement.parentElement).toHaveClass("yellow");

    expect(screen.getByTestId("arrow-up")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-down")).toHaveClass("text-white");
    expect(screen.getByTestId("arrow-left")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-right")).not.toHaveClass("text-white");

    fireEvent.keyDown(screen.getByText("33"), { key: "ArrowLeft" });

    expect(screen.getByText("33").parentElement.parentElement).not.toHaveClass("yellow");

    expect(screen.getByText("32").parentElement.parentElement).toHaveClass("yellow");

    expect(screen.getByTestId("arrow-up")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-down")).toHaveClass("text-white");
    expect(screen.getByTestId("arrow-left")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-right")).not.toHaveClass("text-white");

    fireEvent.keyDown(screen.getByText("32"), { key: "ArrowLeft" });

    expect(screen.getByText("32").parentElement.parentElement).not.toHaveClass("yellow");

    expect(screen.getByText("31").parentElement.parentElement).toHaveClass("yellow");

    expect(screen.queryByText("maze-end")).not.toBeInTheDocument();

    expect(screen.getByTestId("arrow-up")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-down")).toHaveClass("text-white");
    expect(screen.getByTestId("arrow-left")).toHaveClass("text-white");
    expect(screen.getByTestId("arrow-right")).not.toHaveClass("text-white");

    fireEvent.keyDown(screen.getByText("31"), { key: "ArrowLeft" });

    expect(screen.getByText("31").parentElement.parentElement).toHaveClass("yellow");

    fireEvent.keyDown(screen.getByText("31"), { key: "ArrowUp" });

    expect(screen.getByText("31").parentElement.parentElement).not.toHaveClass("yellow");

    expect(screen.getByText("25").parentElement.parentElement).toHaveClass("yellow");

    expect(screen.getByTestId("arrow-up")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-down")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-left")).toHaveClass("text-white");
    expect(screen.getByTestId("arrow-right")).not.toHaveClass("text-white");

    fireEvent.keyDown(screen.getByText("25"), { key: "ArrowUp" });

    expect(screen.getByText("25").parentElement.parentElement).not.toHaveClass("yellow");

    expect(screen.getByText("19").parentElement.parentElement).toHaveClass("yellow");

    expect(screen.getByTestId("arrow-up")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-down")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-left")).toHaveClass("text-white");
    expect(screen.getByTestId("arrow-right")).not.toHaveClass("text-white");

    fireEvent.click(screen.getByTestId("arrow-up"));

    expect(screen.getByText("19").parentElement.parentElement).not.toHaveClass("yellow");

    expect(screen.getByText("13").parentElement.parentElement).toHaveClass("yellow");

    expect(screen.getByTestId("arrow-up")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-down")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-left")).toHaveClass("text-white");
    expect(screen.getByTestId("arrow-right")).not.toHaveClass("text-white");

    fireEvent.keyDown(screen.getByText("13"), { key: "ArrowUp" });

    expect(screen.getByText("13").parentElement.parentElement).not.toHaveClass("yellow");

    expect(screen.getByText("7").parentElement.parentElement).toHaveClass("yellow");

    expect(screen.getByTestId("arrow-up")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-down")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-left")).toHaveClass("text-white");
    expect(screen.getByTestId("arrow-right")).not.toHaveClass("text-white");

    fireEvent.keyDown(screen.getByText("7"), { key: "ArrowUp" });

    expect(screen.getByText("7").parentElement.parentElement).not.toHaveClass("yellow");

    expect(screen.getByText("maze-start").parentElement.parentElement).toHaveClass("yellow");

    expect(screen.getByTestId("arrow-up")).toHaveClass("text-white");
    expect(screen.getByTestId("arrow-down")).not.toHaveClass("text-white");
    expect(screen.getByTestId("arrow-left")).toHaveClass("text-white");
    expect(screen.getByTestId("arrow-right")).not.toHaveClass("text-white");

    fireEvent.keyDown(screen.getByText("maze-start"), { key: "ArrowUp" });

    expect(screen.getByText("maze-start").parentElement.parentElement).toHaveClass("yellow");

    fireEvent.keyDown(screen.getByText("maze-start"), { key: "Enter" });

    expect(screen.getByText("maze-start").parentElement.parentElement).toHaveClass("yellow");

    fireEvent.keyDown(screen.getByText("maze-start"), { key: "Escape" });

    fireEvent.keyDown(screen.getByText("maze-start"), { key: "ArrowRight" });

    expect(screen.getByText("maze-start").parentElement.parentElement).toHaveClass("yellow");
  });


  it("renders and tests clicks", async () => {
    //Render the component
    render(<MazeOnlineSolve data={{id: 1, width: 6, height: 6, start: [0, 0], end: [5, 5], pathTypeEven: false, pathLength: 5, data: [["1", "2", "3", "4", "5", "6"], ["7", "8", "9", "10", "11", "12"], ["13", "14", "15", "16", "17", "18"], ["19", "20", "21", "22", "23", "24"], ["25", "26", "27", "28", "29", "30"], ["31", "32", "33", "34", "35", "36"]]}} initialNickname={""} handleSubmit={(a) => {}} submitError={""} />);

    expect(screen.getByText("maze-start")).toBeInTheDocument();

    fireEvent.click(screen.getByText("3").parentElement);

    await waitFor(() => {
      expect(screen.getByText("3").parentElement.parentElement).toHaveClass("yellow");
    });

    fireEvent.click(screen.getByText("3").parentElement);
    jest.advanceTimersByTime(100);
    fireEvent.click(screen.getByText("3").parentElement);

    await waitFor(() => {
      expect(screen.getByText("3").parentElement.parentElement).toHaveClass("path");
    });

    fireEvent.touchStart(screen.getByText("3").parentElement);
    jest.advanceTimersByTime(800);
    fireEvent.touchEnd(screen.getByText("3").parentElement);

    await waitFor(() => {
      expect(screen.getByText("3").parentNode.querySelector("input")).not.toBeNull();
    })

    fireEvent.change(screen.getByText("3").parentNode.querySelector("input"), { target: { value: "á" } });

    fireEvent.keyDown(screen.getByText("3"), { key: "x" })

    expect(screen.getByText("3").parentElement.parentElement).toHaveClass("path");

    fireEvent.keyDown(screen.getByText("3"), { key: "Enter" })

    expect(screen.getByText("maze-solve-online-not-number")).toBeInTheDocument();

    fireEvent.change(screen.getByText("3").parentNode.querySelector("input"), { target: { value: "-3" } });

    fireEvent.keyDown(screen.getByText("3"), { key: "Enter" })

    expect(screen.getByText("maze-solve-online-not-number")).toBeInTheDocument();

    fireEvent.click(screen.getByText("4").parentElement);
    jest.advanceTimersByTime(100);
    fireEvent.click(screen.getByText("4").parentElement);

    await waitFor(() => {
      expect(screen.getByText("4").parentElement.parentElement).not.toHaveClass("path");
    });

    fireEvent.touchStart(screen.getByText("4").parentElement);
    jest.advanceTimersByTime(800);
    fireEvent.touchEnd(screen.getByText("4").parentElement);

    await waitFor(() => {
      expect(screen.getByText("4").parentNode.querySelector("input")).toBeNull();
    })
  });
});
