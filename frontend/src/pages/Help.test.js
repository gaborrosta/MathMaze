/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import { useTranslation } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import Help from "./Help";

//Mock the useTranslation hook
jest.mock("react-i18next", () => ({
  useTranslation: jest.fn(),
  Trans: ({ i18nKey }) => i18nKey,
}));


//The test suite
describe("Help", () => {
  it("renders in en", () => {
    //Change the language
    useTranslation.mockReturnValue({
      t: str => str,
      i18n: {
        changeLanguage: jest.fn(),
        resolvedLanguage: "en"
      }
    });

    //Render the component
    render(
      <MemoryRouter>
        <Help />
      </MemoryRouter>
    );

    expect(screen.getByText("help-title")).toBeInTheDocument();
    expect(screen.queryByText("A Segítség oldal jelenleg csak angol nyelven érhető el.")).not.toBeInTheDocument();
  });


  it("renders in hu", () => {
    //Change the language
    useTranslation.mockReturnValue({
      t: str => str,
      i18n: {
        changeLanguage: jest.fn(),
        resolvedLanguage: "hu"
      }
    });

    //Render the component
    render(
      <MemoryRouter>
        <Help />
      </MemoryRouter>
    );

    expect(screen.getByText("help-title")).toBeInTheDocument();
    expect(screen.getByText("A Segítség oldal jelenleg csak angol nyelven érhető el.")).toBeInTheDocument();
  });
});
