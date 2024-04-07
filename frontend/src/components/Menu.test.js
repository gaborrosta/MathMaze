/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import TokenContext from "../utils/TokenContext";
import Menu from "./Menu";

//Mock the useTranslation hook
const mockedchangeLanguage = jest.fn();
jest.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: str => str,
      i18n: {
        changeLanguage: mockedchangeLanguage,
        resolvedLanguage: "en"
      }
    }
  }
}));


//The test suite
describe("Menu", () => {
  it("renders navigation links", () => {
    render(
      <TokenContext.Provider value={{ token: null, logout: () => {} }}>
        <MemoryRouter>
          <Menu />
        </MemoryRouter>
      </TokenContext.Provider>
    );

    expect(screen.getByAltText("logo")).toBeInTheDocument();
    expect(screen.getByText("help-title")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "help-title" })).toHaveAttribute("href", "/help")
    expect(screen.getByText("maze-generate-title")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "maze-generate-title" })).toHaveAttribute("href", "/generate-maze")
    expect(screen.getByText("maze-solve-title")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "maze-solve-title" })).toHaveAttribute("href", "/solve-maze")
    expect(screen.getByText("maze-check-title")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "maze-check-title" })).toHaveAttribute("href", "/check-maze")
  });


  it("renders login and signup links when not logged in", () => {
    render(
      <TokenContext.Provider value={{ token: null, logout: () => {} }}>
        <MemoryRouter>
          <Menu />
        </MemoryRouter>
      </TokenContext.Provider>
    );

    expect(screen.getByText("login-title")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "login-title" })).toHaveAttribute("href", "/login")
    expect(screen.getByText("signup-title")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "signup-title" })).toHaveAttribute("href", "/signup")
  });


  it("renders account and logout links when logged in", () => {
    render(
      <TokenContext.Provider value={{ token: "test-token", logout: () => {} }}>
        <MemoryRouter>
          <Menu />
        </MemoryRouter>
      </TokenContext.Provider>
    );

    expect(screen.getByText("account-title")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "account-title" })).toHaveAttribute("href", "/account")
    expect(screen.getByText("logout")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "logout" })).toHaveAttribute("href", "#")
  });


  it("changes language on select change", () => {
    render(
      <TokenContext.Provider value={{ token: null, logout: () => {} }}>
        <MemoryRouter>
          <Menu />
        </MemoryRouter>
      </TokenContext.Provider>
    );

    fireEvent.change(screen.getByLabelText("language-change"), { target: { value: "hu" } });

    expect(mockedchangeLanguage).toHaveBeenCalledWith("hu");
  });
});
