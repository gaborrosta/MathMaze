/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import { MemoryRouter  } from "react-router-dom";
import TokenContext from "./TokenContext";
import AuthChecker from "./AuthChecker";

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
