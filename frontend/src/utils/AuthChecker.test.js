/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import { MemoryRouter  } from "react-router-dom";
import TokenContext from "./TokenContext";
import AuthChecker from "./AuthChecker";

//Mock console.error
jest.spyOn(console, "error").mockImplementation(() => jest.fn());

//Mock the Navigate component from react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Navigate: (props) => {
    return <div>{props.to} {props.replace ? "replace" : "" }</div>;
  },
}));

//Mock a component that will be passed to the AuthChecker
const MockComponent = () => <div>Mock Component</div>;


//The test suite
describe("AuthChecker", () => {
  it("throws an error if Component is missing", () => {
    expect(() => render(<AuthChecker url="test-url" />)).toThrow("Component is required");
  });


  it("throws an error if Component is not a function", () => {
    expect(() => render(<AuthChecker Component="test" url="test-url" />)).toThrow("Component must be a function");
  });


  it("throws an error if url is missing", () => {
    expect(() => render(<AuthChecker Component={MockComponent} />)).toThrow("url is required");
  });


  it("throws an error if url is not a string", () => {
    expect(() => render(<AuthChecker Component={MockComponent} url={123} />)).toThrow("url must be a string");
  });


  it("uses Navigate with replace when there is no token", async () => {
    render(
      <TokenContext.Provider value={{ token: null }}>
        <MemoryRouter>
          <AuthChecker Component={MockComponent} url="test-url" />
        </MemoryRouter>
      </TokenContext.Provider>
    );

    expect(screen.getByText("/login/?next=/test-url replace")).toBeInTheDocument();
  });


  it("renders the passed component when there is a token", () => {
    render(
      <TokenContext.Provider value={{ token: "test-token" }}>
        <AuthChecker Component={MockComponent} url="test-url" />
      </TokenContext.Provider>
    );

    expect(screen.getByText("Mock Component")).toBeInTheDocument();
  });
});
