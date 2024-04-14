/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PDFButtons from "./PDFButtons";
import pdfGenerator from "../utils/pdfGenerator";

//Mock console.error
jest.spyOn(console, "error").mockImplementation(() => jest.fn());

//Mock the useTranslation hook
jest.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: str => str,
    }
  }
}));

//Mock the pdfGenerator function
jest.mock("../utils/pdfGenerator");


//The test suite
describe("PDFButtons", () => {
  it("throws an error if data is missing", () => {
    expect(() => render(<PDFButtons />)).toThrow("actualData is required.");
  });


  it("throws an error if data is not an object", () => {
    expect(() => render(<PDFButtons actualData={"test"} />)).toThrow("actualData must be an object.");
  });


  it("throws an error if data is missing an id", () => {
    expect(() => render(<PDFButtons actualData={{}} />)).toThrow("actualData.id is required.");
  });


  it("throws an error if data.id is not a number", () => {
    expect(() => render(<PDFButtons actualData={{id: "1"}} />)).toThrow("actualData.id must be a number.");
  });


  it("throws an error if data is missing a width", () => {
    expect(() => render(<PDFButtons actualData={{id: 1}} />)).toThrow("actualData.width is required.");
  });


  it("throws an error if data.width is not a number", () => {
    expect(() => render(<PDFButtons actualData={{id: 1, width: "5"}} />)).toThrow("actualData.width must be a number.");
  });


  it("throws an error if data is missing a height", () => {
    expect(() => render(<PDFButtons actualData={{id: 1, width: 5}} />)).toThrow("actualData.height is required.");
  });


  it("throws an error if data.height is not a number", () => {
    expect(() => render(<PDFButtons actualData={{id: 1, width: 5, height: "5"}} />)).toThrow("actualData.height must be a number.");
  });


  it("throws an error if data is missing a start", () => {
    expect(() => render(<PDFButtons actualData={{id: 1, width: 5, height: 5}} />)).toThrow("actualData.start is required.");
  });


  it("throws an error if data.start is not an array", () => {
    expect(() => render(<PDFButtons actualData={{id: 1, width: 5, height: 5, start: "test"}} />)).toThrow("actualData.start must be an array.");
  });


  it("throws an error if data.start has only one element", () => {
    expect(() => render(<PDFButtons actualData={{id: 1, width: 5, height: 5, start: [0]}} />)).toThrow("actualData.start must have 2 elements.");
  });


  it("throws an error if data is missing an end", () => {
    expect(() => render(<PDFButtons actualData={{id: 1, width: 5, height: 5, start: [0, 0]}} />)).toThrow("actualData.end is required.");
  });


  it("throws an error if data.end is not an array", () => {
    expect(() => render(<PDFButtons actualData={{id: 1, width: 5, height: 5, start: [0, 0], end: "test"}} />)).toThrow("actualData.end must be an array.");
  });


  it("throws an error if data.end has only one element", () => {
    expect(() => render(<PDFButtons actualData={{id: 1, width: 5, height: 5, start: [0, 0], end: [4]}} />)).toThrow("actualData.end must have 2 elements.");
  });


  it("throws an error if data is missing a digits", () => {
    expect(() => render(<PDFButtons actualData={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4]}} />)).toThrow("actualData.digits is required.");
  });


  it("throws an error if data.digits is not a number", () => {
    expect(() => render(<PDFButtons actualData={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: "2"}} />)).toThrow("actualData.digits must be a number.");
  });


  it("throws an error if data is missing a pathTypeEven", () => {
    expect(() => render(<PDFButtons actualData={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2}} />)).toThrow("actualData.pathTypeEven is required.");
  });


  it("throws an error if data.pathTypeEven is not a boolean", () => {
    expect(() => render(<PDFButtons actualData={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: "true"}} />)).toThrow("actualData.pathTypeEven must be a boolean.");
  });


  it("throws an error if data is missing a pathLength", () => {
    expect(() => render(<PDFButtons actualData={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true}} />)).toThrow("actualData.pathLength is required.");
  });


  it("throws an error if data.pathLength is not a number", () => {
    expect(() => render(<PDFButtons actualData={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: "10"}} />)).toThrow("actualData.pathLength must be a number.");
  });


  it("throws an error if data is missing a description", () => {
    expect(() => render(<PDFButtons actualData={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10}} />)).toThrow("actualData.description is required.");
  });


  it("throws an error if data.description is not a string", () => {
    expect(() => render(<PDFButtons actualData={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10, description: 10}} />)).toThrow("actualData.description must be a string.");
  });


  it("throws an error if data is missing a user", () => {
    expect(() => render(<PDFButtons actualData={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10, description: "test"}} />)).toThrow("actualData.user is required.");
  });


  it("throws an error if data.user is not a string", () => {
    expect(() => render(<PDFButtons actualData={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10, description: "test", user: 10}} />)).toThrow("actualData.user must be a string.");
  });


  it("throws an error if data is missing a data", () => {
    expect(() => render(<PDFButtons actualData={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10, description: "test", user: "test"}} />)).toThrow("actualData.data is required.");
  });


  it("throws an error if data.data is not an array", () => {
    expect(() => render(<PDFButtons actualData={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10, description: "test", user: "test", data: "test"}} />)).toThrow("actualData.data must be an array.");
  });


  it("throws an error if data.data does not have the same height as data.height", () => {
    expect(() => render(<PDFButtons actualData={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10, description: "test", user: "test", data: []}} />)).toThrow("actualData.data must have the same height as data.height.");
  });


  it("throws an error if data.data is not an array of arrays", () => {
    expect(() => render(<PDFButtons actualData={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10, description: "test", user: "test", data: ["1", "2", "3", "4", "5"]}} />)).toThrow("actualData.data must be an array of arrays.");
  });


  it("throws an error if data.data does not have the same width as data.width", () => {
    expect(() => render(<PDFButtons actualData={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10, description: "test", user: "test", data: [[1], [2], [3], [4], [5]]}} />)).toThrow("actualData.data must have the same width as data.width.");
  });


  it("throws an error if data.data is not an array of arrays of strings", () => {
    expect(() => render(<PDFButtons actualData={{id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10, description: "test", user: "test", data: [["1", "2", "3", "4", "5"], ["1", 2, "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}} />)).toThrow("actualData.data must be an array of arrays of strings.");
  });


  it("generates a PDF in A4 size when the A4 button is clicked", async () => {
    //Mock the pdfGenerator function
    pdfGenerator.mockResolvedValue();

    //Render the component
    render(<PDFButtons actualData={{
      width: 5,
      height: 5,
      digits: 2,
      start: [0, 0],
      end: [4, 4],
      data: Array(5).fill().map(() => Array(5).fill("0")),
      id: 1,
      pathTypeEven: true,
      pathLength: 10,
      description: "test",
      user: "test",
    }} />);

    //Click the A4 button
    fireEvent.click(screen.getByText("maze-generated-download-pdf-a4"));

    //Wait for the function to be called
    await waitFor(() => {
      expect(pdfGenerator).toHaveBeenCalledWith(expect.any(Object), expect.any(Function), "A4");
    });
  });


  it("generates a PDF in A3 size when the A3 button is clicked", async () => {
    //Mock the pdfGenerator function
    pdfGenerator.mockResolvedValue();

    //Render the component
    render(<PDFButtons actualData={{
      width: 5,
      height: 5,
      digits: 2,
      start: [0, 0],
      end: [4, 4],
      data: Array(5).fill().map(() => Array(5).fill("0")),
      id: 1,
      pathTypeEven: true,
      pathLength: 10,
      description: "test",
      user: "test",
    }} />);

    //Click the A3 button
    fireEvent.click(screen.getByText("maze-generated-download-pdf-a3"));

    //Wait for the function to be called
    await waitFor(() => {
      expect(pdfGenerator).toHaveBeenCalledWith(expect.any(Object), expect.any(Function), "A3");
    });
  });
});
