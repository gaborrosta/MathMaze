/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import CheckResults from "./CheckResults";

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


//The test suite
describe("CheckResults", () => {
  it("throws an error if data is missing", () => {
    expect(() => render(<CheckResults />)).toThrow("data is required.");
  });


  it("throws an error if data is not an object", () => {
    expect(() => render(<CheckResults data="test" />)).toThrow("data must be an object.");
  });


  it("throws an error if data is missing a width", () => {
    expect(() => render(<CheckResults data={{}} />)).toThrow("data.width is required.");
  });


  it("throws an error if data.width is not a number", () => {
    expect(() => render(<CheckResults data={{width: "5"}} />)).toThrow("data.width must be a number.");
  });


  it("throws an error if data is missing a height", () => {
    expect(() => render(<CheckResults data={{width: 5}} />)).toThrow("data.height is required.");
  });


  it("throws an error if data.height is not a number", () => {
    expect(() => render(<CheckResults data={{width: 5, height: "5"}} />)).toThrow("data.height must be a number.");
  });


  it("throws an error if data is missing a start", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5}} />)).toThrow("data.start is required.");
  });


  it("throws an error if data.start is not an array", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: "test"}} />)).toThrow("data.start must be an array.");
  });


  it("throws an error if data.start has only one element", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0]}} />)).toThrow("data.start must have 2 elements.");
  });


  it("throws an error if data is missing an end", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0]}} />)).toThrow("data.end is required.");
  });


  it("throws an error if data.end is not an array", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: "test"}} />)).toThrow("data.end must be an array.");
  });


  it("throws an error if data.end has only one element", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4]}} />)).toThrow("data.end must have 2 elements.");
  });


  it("throws an error if data is missing a data", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4]}} />)).toThrow("data.data is required.");
  });


  it("throws an error if data.data is not an array", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: "test"}} />)).toThrow("data.data must be an array.");
  });


  it("throws an error if data.data does not have the same height as data.height", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: []}} />)).toThrow("data.data must have the same height as data.height.");
  });


  it("throws an error if data.data is not an array of arrays", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [1, 2, 3, 4, 5]}} />)).toThrow("data.data must be an array of arrays.");
  });


  it("throws an error if data.data does not have the same width as data.width", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[1], [2], [3], [4], [5]]}} />)).toThrow("data.data must have the same width as data.width.");
  });


  it("throws an error if data.data is not an array of arrays of objects", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [["1", "2", "3", "4", "5"], ["1", 2, "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} />)).toThrow("data.data must be an array of arrays of objects.");
  });


  it("throws an error if every cell in data.data has 1 property", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}]]}} />)).toThrow("data.data must be an array of arrays of objects with either no properties, two properties (isUserPath, isMazePath), or five properties (isUserPath, isMazePath, result, expectedResult, operation). All properties must be of the correct type.");
  });


  it("throws an error if a cell in data.data has 0 property and one has 2 with bad names", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {x: 1, y: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}]]}} />)).toThrow("data.data must be an array of arrays of objects with either no properties, two properties (isUserPath, isMazePath), or five properties (isUserPath, isMazePath, result, expectedResult, operation). All properties must be of the correct type.");
  });


  it("throws an error if a cell in data.data has 0 property and one has 2 with right names but bad types", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: 1, isMazePath: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}]]}} />)).toThrow("data.data must be an array of arrays of objects with either no properties, two properties (isUserPath, isMazePath), or five properties (isUserPath, isMazePath, result, expectedResult, operation). All properties must be of the correct type.");
  });


  it("throws an error if a cell in data.data has 0 property and one has 2 with right names but the second one has bad type", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}]]}} />)).toThrow("data.data must be an array of arrays of objects with either no properties, two properties (isUserPath, isMazePath), or five properties (isUserPath, isMazePath, result, expectedResult, operation). All properties must be of the correct type.");
  });


  it("throws an error if a cell in data.data has 0 property and one has 2 fine and one has 5 with bad names", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {x: 2, y: 3, z:4, a:5, b:6}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}]]}} />)).toThrow("data.data must be an array of arrays of objects with either no properties, two properties (isUserPath, isMazePath), or five properties (isUserPath, isMazePath, result, expectedResult, operation). All properties must be of the correct type.");
  });


  it("throws an error if a cell in data.data has 0 property and one has 2 fine and one has 5 with 4 bad names", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: 2, y: 3, z:4, a:5, b:6}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}]]}} />)).toThrow("data.data must be an array of arrays of objects with either no properties, two properties (isUserPath, isMazePath), or five properties (isUserPath, isMazePath, result, expectedResult, operation). All properties must be of the correct type.");
  });


  it("throws an error if a cell in data.data has 0 property and one has 2 fine and one has 5 with 3 bad names", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: 2, isMazePath: 3, z:4, a:5, b:6}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}]]}} />)).toThrow("data.data must be an array of arrays of objects with either no properties, two properties (isUserPath, isMazePath), or five properties (isUserPath, isMazePath, result, expectedResult, operation). All properties must be of the correct type.");
  });


  it("throws an error if a cell in data.data has 0 property and one has 2 fine and one has 5 with 2 bad names", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: 2, isMazePath: 3, result:4, a:5, b:6}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}]]}} />)).toThrow("data.data must be an array of arrays of objects with either no properties, two properties (isUserPath, isMazePath), or five properties (isUserPath, isMazePath, result, expectedResult, operation). All properties must be of the correct type.");
  });


  it("throws an error if a cell in data.data has 0 property and one has 2 fine and one has 5 with 1 bad names", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: 2, isMazePath: 3, result:4, expectedResult:5, b:6}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}]]}} />)).toThrow("data.data must be an array of arrays of objects with either no properties, two properties (isUserPath, isMazePath), or five properties (isUserPath, isMazePath, result, expectedResult, operation). All properties must be of the correct type.");
  });


  it("throws an error if a cell in data.data has 0 property and one has 2 fine and one has 5 with right names but wrong types for 5", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: 2, isMazePath: 3, result:"4", expectedResult:"5", operation:6}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}]]}} />)).toThrow("data.data must be an array of arrays of objects with either no properties, two properties (isUserPath, isMazePath), or five properties (isUserPath, isMazePath, result, expectedResult, operation). All properties must be of the correct type.");
  });


  it("throws an error if a cell in data.data has 0 property and one has 2 fine and one has 5 with right names but wrong types for 4", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: 3, result:"4", expectedResult:"5", operation:6}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}]]}} />)).toThrow("data.data must be an array of arrays of objects with either no properties, two properties (isUserPath, isMazePath), or five properties (isUserPath, isMazePath, result, expectedResult, operation). All properties must be of the correct type.");
  });


  it("throws an error if a cell in data.data has 0 property and one has 2 fine and one has 5 with right names but wrong types for 3", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:"4", expectedResult:"5", operation:6}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}]]}} />)).toThrow("data.data must be an array of arrays of objects with either no properties, two properties (isUserPath, isMazePath), or five properties (isUserPath, isMazePath, result, expectedResult, operation). All properties must be of the correct type.");
  });


  it("throws an error if a cell in data.data has 0 property and one has 2 fine and one has 5 with right names but wrong types for 2", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:4, expectedResult:"", operation:6}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}]]}} />)).toThrow("data.data must be an array of arrays of objects with either no properties, two properties (isUserPath, isMazePath), or five properties (isUserPath, isMazePath, result, expectedResult, operation). All properties must be of the correct type.");
  });


  it("throws an error if a cell in data.data has 0 property and one has 2 fine and one has 5 with right names but wrong types for 1", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:4, expectedResult:5, operation:6}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}], [{x: 0}, {x: 1}, {x: 2}, {x: 3}, {x: 4}]]}} />)).toThrow("data.data must be an array of arrays of objects with either no properties, two properties (isUserPath, isMazePath), or five properties (isUserPath, isMazePath, result, expectedResult, operation). All properties must be of the correct type.");
  });


  it("throws an error if data is missing an info", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:4, expectedResult:5, operation: "1 + 1"}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}]]}} />)).toThrow("data.info is required.");
  });


  it("throws an error if data.info is not an object", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:4, expectedResult:5, operation: "1 + 1"}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}]], info: 1}} />)).toThrow("data.info must be an object.");
  });


  it("throws an error if data.info.userType is not a string", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:4, expectedResult:5, operation: "1 + 1"}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}]], info: {userType: 5}}} />)).toThrow("data.info.userType must be a string.");
  });


  it("throws an error if data.info.solutionId is not a number", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:4, expectedResult:5, operation: "1 + 1"}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}]], info: {solutionId: "test"}}} />)).toThrow("data.info.solutionId must be a number.");
  });


  it("throws an error if data.info.mazeId is not a number", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:4, expectedResult:5, operation: "1 + 1"}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}]], info: {mazeId: "test"}}} />)).toThrow("data.info.mazeId must be a number.");
  });


  it("throws an error if data.info is missing a nickname", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:4, expectedResult:5, operation: "1 + 1"}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}]], info: {}}} />)).toThrow("data.info.nickname is required.");
  });


  it("throws an error if data.info.nickname is not a string", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:4, expectedResult:5, operation: "1 + 1"}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}]], info: {nickname: 4}}} />)).toThrow("data.info.nickname must be a string.");
  });


  it("throws an error if data.info.solvedAt is not a number", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:4, expectedResult:5, operation: "1 + 1"}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}]], info: {nickname: "test", solvedAt: "now"}}} />)).toThrow("data.info.solvedAt must be a number.");
  });


  it("throws an error if data.info is missing a correct", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:4, expectedResult:5, operation: "1 + 1"}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}]], info: {nickname: "test"}}} />)).toThrow("data.info.correct is required.");
  });


  it("throws an error if data.info.correct is not a number", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:4, expectedResult:5, operation: "1 + 1"}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}]], info: {nickname: "test", correct: "0"}}} />)).toThrow("data.info.correct must be a number.");
  });


  it("throws an error if data.info is missing an incorrect", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:4, expectedResult:5, operation: "1 + 1"}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}]], info: {nickname: "test", correct: 0}}} />)).toThrow("data.info.incorrect is required.");
  });


  it("throws an error if data.info.incorrect is not a number", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:4, expectedResult:5, operation: "1 + 1"}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}]], info: {nickname: "test", correct: 0, incorrect: "0"}}} />)).toThrow("data.info.incorrect must be a number.");
  });


  it("throws an error if data.info is missing a correctPath", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:4, expectedResult:5, operation: "1 + 1"}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}]], info: {nickname: "test", correct: 0, incorrect: 0}}} />)).toThrow("data.info.correctPath is required.");
  });


  it("throws an error if data.info.correctPath is not a number", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:4, expectedResult:5, operation: "1 + 1"}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}]], info: {nickname: "test", correct: 0, incorrect: 0, correctPath: "0"}}} />)).toThrow("data.info.correctPath must be a number.");
  });


  it("throws an error if data.info is missing a missedPath", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:4, expectedResult:5, operation: "1 + 1"}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}]], info: {nickname: "test", correct: 0, incorrect: 0, correctPath: 0}}} />)).toThrow("data.info.missedPath is required.");
  });


  it("throws an error if data.info.missedPath is not a number", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:4, expectedResult:5, operation: "1 + 1"}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}]], info: {nickname: "test", correct: 0, incorrect: 0, correctPath: 0, missedPath: "0"}}} />)).toThrow("data.info.missedPath must be a number.");
  });


  it("throws an error if data.info is missing a wrongPath", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:4, expectedResult:5, operation: "1 + 1"}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}]], info: {nickname: "test", correct: 0, incorrect: 0, correctPath: 0, missedPath: 0}}} />)).toThrow("data.info.wrongPath is required.");
  });


  it("throws an error if data.info.wrongPath is not a number", () => {
    expect(() => render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:4, expectedResult:5, operation: "1 + 1"}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}]], info: {nickname: "test", correct: 0, incorrect: 0, correctPath: 0, missedPath: 0, wrongPath: "0"}}} />)).toThrow("data.info.wrongPath must be a number.");
  });


  it("renders with userType admin", () => {
    //Render the component
    render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:4, expectedResult:5, operation: "1 + 1"}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}]], info: {nickname: "test", correct: 0, incorrect: 0, correctPath: 0, missedPath: 0, wrongPath: 0, userType: "ADMIN"}}} />);

    expect(screen.getByText("maze-check-info-admin")).toBeInTheDocument();
  });


  it("renders with userType me", () => {
    //Render the component
    render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:4, expectedResult:5, operation: "1 + 1"}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}]], info: {nickname: "test", correct: 0, incorrect: 0, correctPath: 0, missedPath: 0, wrongPath: 0, userType: "ME"}}} />);

    expect(screen.getByText("maze-check-info-me")).toBeInTheDocument();
  });


  it("renders with userType somebody else", () => {
    //Render the component
    render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:4, expectedResult:5, operation: "1 + 1"}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}]], info: {nickname: "test", correct: 0, incorrect: 0, correctPath: 0, missedPath: 0, wrongPath: 0, userType: "SB"}}} />);

    expect(screen.getByText("maze-check-path-found")).toBeInTheDocument();
    expect(screen.getByText("maze-check-info-not-admin")).toBeInTheDocument();
  });


  it("renders with total summary", () => {
    //Render the component
    render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:4, expectedResult:5, operation: "1 + 1"}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}]], info: {nickname: "test", correct: 1, incorrect: 3, correctPath: 2, missedPath: 1, wrongPath: 5}}} />);

    expect(screen.getByText("maze-check-path-not-found")).toBeInTheDocument();
    expect(screen.getByText("maze-check-correct:")).toBeInTheDocument();
    expect(screen.getByText("maze-check-wrong:")).toBeInTheDocument();
    expect(screen.getByText("maze-check-correct-path:")).toBeInTheDocument();
    expect(screen.getByText("maze-check-missed-path:")).toBeInTheDocument();
    expect(screen.getByText("maze-check-wrong-path:")).toBeInTheDocument();
  });


  it("renders with solvedAt", () => {
    //Render the component
    render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: false}, {isUserPath: true, isMazePath: false, result:4, expectedResult:5, operation: "1 + 1"}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {}, {}, {}, {}], [{}, {},  {}, {}, {}]], info: {nickname: "test", correct: 0, incorrect: 0, correctPath: 0, missedPath: 0, wrongPath: 0, userType: "SB", solvedAt: 1}}} />);

    expect(screen.getByText(/maze-generate-nickname:/i)).toBeInTheDocument();
    expect(screen.getByText(/maze-check-solved-at/i)).toBeInTheDocument();
  });


  it("renders and changes view", () => {
    //Render the component
    const { container } = render(<CheckResults data={{width: 5, height: 5, start: [0, 0], end: [4, 4], data: [[{}, {isUserPath: true, isMazePath: true}, {isUserPath: true, isMazePath: false, result:4, expectedResult:4, operation: "1 + 1"},  {isUserPath: true, isMazePath: false}, {isUserPath: false, isMazePath: true}], [{isUserPath: false, isMazePath: false}, {isUserPath: true, isMazePath: true, result:4, expectedResult:4, operation: "1 + 1"}, {}, {}, {}], [{isUserPath: true, isMazePath: true, result:4, expectedResult:5, operation: "1 + 1"}, {}, {}, {}, {}], [{isUserPath: false, isMazePath: false, result:4, expectedResult:5, operation: "1 + 1"}, {isUserPath: false, isMazePath: true, result:4, expectedResult:5, operation: "1 + 1"}, {}, {}, {}], [{}, {}, {isUserPath: true, isMazePath: false, result:4, expectedResult:4, operation: "1 + 1"}, {}, {}]], info: {nickname: "test", correct: 0, incorrect: 0, correctPath: 0, missedPath: 0, wrongPath: 0}}} />);

    expect(container.querySelectorAll('.correct-path').length).toBe(0);

    expect(container.querySelectorAll('.missed-path').length).toBe(0);

    expect(container.querySelectorAll('.wrong-path').length).toBe(0);

    expect(container.querySelectorAll('.correct').length).toBe(3);

    expect(container.querySelectorAll('.wrong').length).toBe(4);

    expect(screen.getByRole("button", { name: "maze-check-result-type-computations" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "maze-check-result-type-path" }));

    expect(container.querySelectorAll('.correct-path').length).toBe(3);

    expect(container.querySelectorAll('.missed-path').length).toBe(3);

    expect(container.querySelectorAll('.wrong-path').length).toBe(4);

    expect(screen.getByRole("button", { name: "maze-check-result-type-path" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "maze-check-result-type-computations" }));

    expect(container.querySelectorAll('.correct-path').length).toBe(0);

    expect(container.querySelectorAll('.missed-path').length).toBe(0);

    expect(container.querySelectorAll('.wrong-path').length).toBe(0);

    expect(container.querySelectorAll('.correct').length).toBe(3);

    expect(container.querySelectorAll('.wrong').length).toBe(4);

    expect(screen.getByRole("button", { name: "maze-check-result-type-computations" })).toBeDisabled();

    expect(container.querySelectorAll('.yellow').length).toBe(17);
  });
});
