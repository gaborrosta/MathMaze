/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import NoPage from "./NoPage";

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
describe("NoPage", () => {
  it("renders", () => {
    //Render the component
    render(
      <MemoryRouter>
        <NoPage />
      </MemoryRouter>
    );

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("404-info")).toBeInTheDocument();
    expect(screen.getByText("404-go-back")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "404-go-back" })).toHaveAttribute("href", "/")
  });
});
