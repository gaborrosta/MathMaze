/**
 * @jest-environment jsdom
 */

import { useContext } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import TokenContext from "./TokenContext";

//Mock component to consume the context
const MockComponent = () => {
  const { token, setToken, logout } = useContext(TokenContext);
  return (
    <div>
      <p>{token}</p>
      <button onClick={setToken}>Set Token</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};


//The test suite
describe("TokenContext", () => {
  it("provides the token, setToken, and logout", () => {
    const setToken = jest.fn();
    const logout = jest.fn();

    render(
      <TokenContext.Provider value={{ token: "test-token", setToken: setToken, logout: logout }}>
        <MockComponent />
      </TokenContext.Provider>
    );

    expect(screen.getByText("test-token")).toBeInTheDocument();

    expect(screen.getByText("Set Token")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Set Token"));

    expect(setToken).toHaveBeenCalledTimes(1);

    expect(screen.getByText("Logout")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Logout"));

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
