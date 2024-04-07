/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import LoadingSpinner from "./LoadingSpinner";

//Mock the useTranslation hook
jest.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: str => str,
    }
  }
}));


//The test suite
describe("LoadingSpinner", () => {
  it("renders", () => {
    render(<LoadingSpinner />);

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    expect(screen.getByText("loading")).toBeInTheDocument();
  });
});
