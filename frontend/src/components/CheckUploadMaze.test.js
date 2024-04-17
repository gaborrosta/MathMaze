/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import CheckUploadMaze from "./CheckUploadMaze";

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
describe("CheckUploadMaze", () => {
  it("throws error when initialId is undefined", () => {
    expect(() => render(<CheckUploadMaze />)).toThrow("initialId is required.");
  });


  it("throws error when initialId is not a string", () => {
    expect(() => render(<CheckUploadMaze initialId={123} />)).toThrow("initialId must be a string.");
  });


  it("throws error when handleSubmit is undefined", () => {
    expect(() => render(<CheckUploadMaze initialId="123" />)).toThrow("handleSubmit is required.");
  });


  it("throws error when handleSubmit is not a function", () => {
    expect(() => render(<CheckUploadMaze initialId="123" handleSubmit="test" />)).toThrow("handleSubmit must be a function.");
  });


  it("throws error when handleSubmit does not have 1 parameter", () => {
    expect(() => render(<CheckUploadMaze initialId="123" handleSubmit={() => {}} />)).toThrow("handleSubmit must have 1 parameter.");
  });


  it("displays error when value is invalid", async () => {
    //Mock the handleSubmit function
    const handleSubmit = jest.fn((a) => {});

    //Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn((file) => { return file.name; });

    //Create some files
    const file1 = new File(["hello"], "hello.png", { type: "image/png" });
    const file2 = new File(["hello"], "hello.txt", { type: "text" });

    //Render the component
    render(<CheckUploadMaze initialId="123" handleSubmit={handleSubmit} />);

    //Get the input elements
    const mazeId = screen.getByRole("textbox");
    const fileInput = screen.getByTestId("file");
    const submit = screen.getByRole("button");

    expect(mazeId.value).toBe("123");

    fireEvent.change(mazeId, { target: { value: "" } });

    expect(mazeId.value).toBe("");

    expect(screen.getByText("field-required")).toBeInTheDocument();

    expect(submit).toBeDisabled();

    fireEvent.change(mazeId, { target: { value: "a" } });

    expect(mazeId.value).toBe("a");

    expect(screen.getByText("error-invalid-maze-id")).toBeInTheDocument();

    expect(submit).toBeDisabled();

    fireEvent.change(mazeId, { target: { value: "1" } });

    expect(mazeId.value).toBe("1");

    fireEvent.change(fileInput, { target: { files: [file1] } });

    expect(screen.queryByText("maze-check-image-info")).not.toBeInTheDocument();

    expect(submit).toBeEnabled();

    fireEvent.change(fileInput, { target: { files: [file2] } });

    expect(screen.getByText("error-invalid-file-type")).toBeInTheDocument();

    expect(submit).toBeDisabled();

    fireEvent.change(fileInput, { target: { files: null } });

    expect(screen.getByText("field-required")).toBeInTheDocument();

    expect(submit).toBeDisabled();

    fireEvent.change(fileInput, { target: { files: [file1] } });

    expect(screen.queryByText("field-required")).not.toBeInTheDocument();

    expect(submit).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "rotate-image" }));

    expect(screen.getByAltText("maze-check-file-label")).toHaveStyle("transform: translate(-50%, -50%) rotate(90deg);");

    expect(submit).toBeEnabled();

    fireEvent.click(submit);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1); //The actual parameter cannot be tested.
    });

    global.URL.createObjectURL.mockRestore();
  });
});
