/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "./Layout";

//Mock console.error
jest.spyOn(console, "error").mockImplementation(() => jest.fn());

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


//Mock the timers
jest.useFakeTimers();

//Mock axios to control API calls
jest.mock("axios");

//Mock sessionStorage
Object.defineProperty(window, "sessionStorage", {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
  writable: true,
});

//Mock the useLocation, useNavigate hooks
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));


//The test suite
describe("Layout", () => {
  //Reset the mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });


  it("renders without a token", () => {
    //Mock sessionStorage
    sessionStorage.getItem.mockReturnValue(null);

    //Mock the useLocation hook
    useLocation.mockReturnValue({
      pathname: "/sth",
      search: "",
      hash: "",
      state: null,
      key: "",
    });

    //Render the component
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );
  });


  it("renders and makes an API call", async () => {
    //Mock sessionStorage
    sessionStorage.getItem.mockReturnValue("test-token");

    //Mock the useLocation hook
    useLocation.mockReturnValue({
      pathname: "/sth",
      search: "",
      hash: "",
      state: null,
      key: "",
    });

    //Mock the API call
    axios.get.mockResolvedValue({});

    //Render the component
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    //Check the API call
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("test-token"));
  });


  it("token expires when the API call fails on account page", async () => {
    //Mock sessionStorage
    sessionStorage.getItem.mockReturnValue("test-token");

    //Mock the useLocation hook
    useLocation.mockReturnValue({
      pathname: "/account",
      search: "",
      hash: "",
      state: null,
      key: "",
    });

    //Mock the useNavigate hook
    const mockNavigate = jest.fn();
    useNavigate.mockImplementation(() => mockNavigate);

    //Mock the API call
    axios.get.mockRejectedValue({});

    //Render the component
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    //Check the API call
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("test-token"));

    //Modal should be displayed
    expect(screen.getByText("session-expired-log-in")).toBeInTheDocument();

    //Check the navigation
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/login?next=/account");

    //Check the sessionStorage
    expect(sessionStorage.setItem).toHaveBeenCalledTimes(2);
    expect(sessionStorage.setItem).toHaveBeenCalledWith("token", "");
  });


  it("token expires when the API call fails on not account page", async () => {
    //Mock sessionStorage
    sessionStorage.getItem.mockReturnValue("test-token");

    //Mock the useLocation hook
    useLocation.mockReturnValue({
      pathname: "/sth",
      search: "",
      hash: "",
      state: null,
      key: "",
    });



    //Mock the API call
    axios.get.mockRejectedValue({});

    //Render the component
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    //Check the API call
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("test-token"));

    //Modal should be displayed
    expect(screen.getByText("session-expired")).toBeInTheDocument();

    //Check the sessionStorage
    expect(sessionStorage.setItem).toHaveBeenCalledTimes(2);
    expect(sessionStorage.setItem).toHaveBeenCalledWith("token", "");

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    waitFor(() => {
      expect(screen.queryByText("session-expired")).not.toBeInTheDocument();
    });
  });


  it("calls the logout function when the logout button is clicked", () => {
    //Mock sessionStorage
    sessionStorage.getItem.mockReturnValue("test-token");

    //Mock the useLocation hook
    useLocation.mockReturnValue({
      pathname: "/sth",
      search: "",
      hash: "",
      state: null,
      key: "",
    });

    //Mock the useNavigate hook
    const mockNavigate = jest.fn();
    useNavigate.mockImplementation(() => mockNavigate);

    //Render the component
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );

    //Click the logout button
    const logoutButton = screen.getByRole("button", { name: /logout/i });
    fireEvent.click(logoutButton);

    //Check the navigation
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/");

    //Check the sessionStorage
    expect(sessionStorage.setItem).toHaveBeenCalledTimes(2);
    expect(sessionStorage.setItem).toHaveBeenCalledWith("token", "");
  });


  it("no menu on index page", () => {
    //Mock sessionStorage
    sessionStorage.getItem.mockReturnValue(null);

    //Mock the useLocation hook
    useLocation.mockReturnValue({
      pathname: "/",
      search: "",
      hash: "",
      state: null,
      key: "",
    });

    //Render the component
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );

    //Check if menu is not there
    expect(screen.queryByText("help-title")).not.toBeInTheDocument();
  });
});
