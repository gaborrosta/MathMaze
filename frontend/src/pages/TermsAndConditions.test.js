/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import { useTranslation } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import TermsAndConditions from "./TermsAndConditions";

//Mock the useTranslation hook
jest.mock("react-i18next", () => ({
  useTranslation: jest.fn()
}));


//The test suite
describe("TermsAndConditions", () => {
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
        <TermsAndConditions />
      </MemoryRouter>
    );

    expect(screen.getByText("terms-and-conditions-title")).toBeInTheDocument();
    expect(screen.queryByText("A Felhasználási feltételek csak angol nyelven érhetőek el.")).not.toBeInTheDocument();
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
        <TermsAndConditions />
      </MemoryRouter>
    );

    expect(screen.getByText("terms-and-conditions-title")).toBeInTheDocument();
    expect(screen.getByText("A Felhasználási feltételek csak angol nyelven érhetőek el.")).toBeInTheDocument();
  });
});
