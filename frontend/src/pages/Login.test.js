/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import axios from "axios";
import { BACKEND_URL } from "../utils/constants";
import TokenContext from "../utils/TokenContext";
import Login from "./Login";

//Mock the useTranslation hook
jest.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: str => str,
      i18n: {
        changeLanguage: jest.fn(),
        resolvedLanguage: "en"
      },
    }
  },
  Trans: ({ i18nKey }) => i18nKey
}));

//Mock the useNavigate, useLocation hooks from react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ search: "" }), // Default return value
  Link: ({ children }) => children
}));

//Mock axios to control API calls
jest.mock("axios");


//The test suite
describe("Login", () => {
  it("renders and displays error when value is invalid", async () => {
    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <Login />
      </TokenContext.Provider>
    );

    expect(screen.getAllByText("login-title").length).toBe(2);
    expect(screen.getByText(/login-forgot-password/i)).toBeInTheDocument();
    expect(screen.getByText(/login-no-account/i)).toBeInTheDocument();
    expect(screen.getByText(/login-create-account/i)).toBeInTheDocument();
    expect(screen.getByText(/login-privacy-terms-help-link/i)).toBeInTheDocument();

    //Get the elements
    const inputEmail = screen.getByPlaceholderText("email-placeholder");
    const inputPassword = screen.getByPlaceholderText("login-password-placeholder");
    const button = screen.getByRole("button", { name: "login-title" });

    fireEvent.change(inputEmail, { target: { value: "test" } });

    expect(inputEmail.value).toBe("test");

    expect(screen.getByText("email-error")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputEmail, { target: { value: "test@example.com" } });

    expect(inputEmail.value).toBe("test@example.com");

    expect(screen.queryByText("email-error")).not.toBeInTheDocument();

    fireEvent.change(inputPassword, { target: { value: "test" } });

    expect(inputPassword.value).toBe("test");

    fireEvent.change(inputPassword, { target: { value: "" } });

    expect(screen.getByText("field-required")).toBeInTheDocument();

    fireEvent.change(inputPassword, { target: { value: "test" } });

    expect(screen.queryByText("field-required")).not.toBeInTheDocument();

    expect(button).toBeEnabled();
  });


  it("renders and submits the form when the form is valid", async () => {
    //Mock the API call
    axios.post.mockResolvedValue({ response: { data: "token" } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <Login />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.change(screen.getByPlaceholderText("email-placeholder"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("login-password-placeholder"), { target: { value: "test" } });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "login-title" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/login`,
        {
          email: "test@example.com",
          password: "test",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/account");
      expect(setToken).toHaveBeenCalled();
    });
  });


  it("renders and submits the form when the form is valid with nextPage", async () => {
    //Mock the useLocation hook
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({ search: "?next=/accoun" })

    //Mock the API call
    axios.post.mockResolvedValue({ response: { data: "" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <Login />
      </TokenContext.Provider>
    );

    expect(screen.getByText("must-be-logged-in")).toBeInTheDocument();

    //Fill the form
    fireEvent.change(screen.getByPlaceholderText("email-placeholder"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("login-password-placeholder"), { target: { value: "test" } });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "login-title" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/login`,
        {
          email: "test@example.com",
          password: "test",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/accoun");
    });
  });


  it("renders and submits the form when the form is valid but receives an error", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <Login />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.change(screen.getByPlaceholderText("email-placeholder"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("login-password-placeholder"), { target: { value: "test" } });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "login-title" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/login`,
        {
          email: "test@example.com",
          password: "test",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-unknown")).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText("login-password-placeholder").value).toBe("");
  });


  it("renders and submits the form when the form is valid but receives InvalidCredentialsException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "InvalidCredentialsException" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <Login />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.change(screen.getByPlaceholderText("email-placeholder"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("login-password-placeholder"), { target: { value: "test" } });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "login-title" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/login`,
        {
          email: "test@example.com",
          password: "test",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-invalid-credentials")).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText("login-password-placeholder").value).toBe("");
  });


  it("renders and submits the form when the form is valid but receives unknown error", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <Login />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.change(screen.getByPlaceholderText("email-placeholder"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("login-password-placeholder"), { target: { value: "test" } });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "login-title" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/login`,
        {
          email: "test@example.com",
          password: "test",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-unknown-form")).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText("login-password-placeholder").value).toBe("");
  });


  it("show-password button changes the password input type", async () => {
    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <Login />
      </TokenContext.Provider>
    );

    const passwordInput = screen.getByPlaceholderText("login-password-placeholder");
    const showPasswordButton = screen.getAllByRole("button", { name: "password-show" })[0];

    expect(passwordInput.type).toBe("password");

    act(() => {
      fireEvent.click(showPasswordButton);
    });

    expect(passwordInput.type).toBe("text");
  });
});
