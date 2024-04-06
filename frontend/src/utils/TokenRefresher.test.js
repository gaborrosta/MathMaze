/**
 * @jest-environment jsdom
 */

import React from "react";
import { render } from "@testing-library/react";
import axios from "axios";
import TokenRefresher from "./TokenRefresher";

//Mock the timers
jest.useFakeTimers();

//Mock axios to control API calls
jest.mock("axios");


//The test suite
describe("TokenRefresher", () => {
  it("throws an error if token is missing", () => {
    expect(() => render(<TokenRefresher />)).toThrow("Token is required.");
  });


  it("throws an error if token is not a string", () => {
    expect(() => render(<TokenRefresher token={123} />)).toThrow("Token must be a string.");
  });


  it("throws an error if setToken is missing", () => {
    expect(() => render(<TokenRefresher token="test-token" />)).toThrow("setToken is required.");
  });


  it("throws an error if setToken is not a function", () => {
    expect(() => render(<TokenRefresher token="test-token" setToken="test-setToken" />)).toThrow("setToken must be a function.");
  });


  it("throws an error if refreshMinutes is not a number", () => {
    expect(() => render(<TokenRefresher token="test-token" setToken={() => {}} refreshMinutes="test-minutes" />)).toThrow("refreshMinutes must be a number.");
  });


  it("refreshes the token after a certain amount of time", () => {
    //"TokenContext"
    const setToken = jest.fn();
    const token = "initial-token";

    //Mock the API call
    axios.get.mockResolvedValue({ data: "new-token" });

    //Render the component
    render(<TokenRefresher token={token} setToken={setToken} refreshMinutes={0.1} />);

    //Fast-forward timers
    jest.runAllTimers();

    //Check the API call
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining(token));

    //Check the token update
    setTimeout(() => {
      expect(setToken).toHaveBeenCalledTimes(1);
      expect(setToken).toHaveBeenCalledWith("new-token");
    }, 0);
  });
});
