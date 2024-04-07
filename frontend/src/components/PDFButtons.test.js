/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PDFButtons from "./PDFButtons";
import pdfGenerator from "../utils/pdfGenerator";

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
  it("generates a PDF in A4 size when the A4 button is clicked", async () => {
    //Mock the pdfGenerator function
    pdfGenerator.mockResolvedValue();

    //Render the component
    render(<PDFButtons actualData={{}} />);

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
    render(<PDFButtons actualData={{}} />);

    //Click the A3 button
    fireEvent.click(screen.getByText("maze-generated-download-pdf-a3"));

    //Wait for the function to be called
    await waitFor(() => {
      expect(pdfGenerator).toHaveBeenCalledWith(expect.any(Object), expect.any(Function), "A3");
    });
  });
});
