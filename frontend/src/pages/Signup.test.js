/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import axios from "axios";
import { BACKEND_URL } from "../utils/constants";
import TokenContext from "../utils/TokenContext";
import Signup from "./Signup";

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

//Mock the timers
jest.useFakeTimers();

//Mock axios to control API calls
jest.mock("axios");


//The test suite
describe("Signup", () => {
  it("renders and displays error when value is invalid", async () => {
    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <Signup />
      </TokenContext.Provider>
    );

    expect(screen.getAllByText("signup-title").length).toBe(2);
    expect(screen.getByText(/signup-privacy-terms-statement/i)).toBeInTheDocument();

    //Get the elements
    const inputUsername = screen.getByPlaceholderText("signup-username-placeholder");
    const inputEmail = screen.getByPlaceholderText("email-placeholder");
    const inputPassword = screen.getByPlaceholderText("signup-password-placeholder");
    const button = screen.getByRole("button", { name: "signup-title" });

    fireEvent.change(inputUsername, { target: { value: "user" } });

    expect(inputUsername.value).toBe("user");

    expect(screen.getByText("signup-username-error")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputUsername, { target: { value: "" } });

    expect(inputUsername.value).toBe("");

    expect(screen.queryByText("signup-username-error")).not.toBeInTheDocument();

    expect(screen.getByText("field-required")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputUsername, { target: { value: "username" } });

    expect(inputUsername.value).toBe("username");

    expect(screen.queryByText("field-required")).not.toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputEmail, { target: { value: "invalid" } });

    expect(inputEmail.value).toBe("invalid");

    expect(screen.getByText("signup-email-error")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputEmail, { target: { value: "" } });

    expect(inputEmail.value).toBe("");

    expect(screen.getByText("field-required")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputEmail, { target: { value: "test@example.com" } });

    expect(inputEmail.value).toBe("test@example.com");

    expect(screen.queryByText("field-required")).not.toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputPassword, { target: { value: "invalid" } });

    expect(inputPassword.value).toBe("invalid");

    expect(screen.getByText("signup-password-error")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputPassword, { target: { value: "" } });

    expect(inputPassword.value).toBe("");

    expect(screen.getByText("field-required")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputPassword, { target: { value: "Password@123" } });

    expect(inputPassword.value).toBe("Password@123");

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
        <Signup />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.change(screen.getByPlaceholderText("signup-username-placeholder"), { target: { value: "username" } });
    fireEvent.change(screen.getByPlaceholderText("email-placeholder"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("signup-password-placeholder"), { target: { value: "Password@123" } });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "signup-title" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/register`,
        {
          username: "username",
          email: "test@example.com",
          password: "Password@123",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
    });

    expect(screen.getByText("success-signup")).toBeInTheDocument();

    expect(screen.queryByPlaceholderText("signup-username-placeholder")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("email-placeholder")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("signup-password-placeholder")).not.toBeInTheDocument();

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(mockNavigate).toHaveBeenCalledWith("/account");
  });


  it("renders and submits the form when the form is valid but receives an error", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <Signup />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.change(screen.getByPlaceholderText("signup-username-placeholder"), { target: { value: "username" } });
    fireEvent.change(screen.getByPlaceholderText("email-placeholder"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("signup-password-placeholder"), { target: { value: "Password@123" } });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "signup-title" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/register`,
        {
          username: "username",
          email: "test@example.com",
          password: "Password@123",
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

    expect(screen.getByPlaceholderText("signup-password-placeholder").value).toBe("");
  });


  it("renders and submits the form when the form is valid but receives UsernameInvalidFormatException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "UsernameInvalidFormatException" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <Signup />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.change(screen.getByPlaceholderText("signup-username-placeholder"), { target: { value: "username" } });
    fireEvent.change(screen.getByPlaceholderText("email-placeholder"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("signup-password-placeholder"), { target: { value: "Password@123" } });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "signup-title" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/register`,
        {
          username: "username",
          email: "test@example.com",
          password: "Password@123",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-username-invalid-format")).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText("signup-password-placeholder").value).toBe("");
  });


  it("renders and submits the form when the form is valid but receives EmailInvalidFormatException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "EmailInvalidFormatException" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <Signup />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.change(screen.getByPlaceholderText("signup-username-placeholder"), { target: { value: "username" } });
    fireEvent.change(screen.getByPlaceholderText("email-placeholder"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("signup-password-placeholder"), { target: { value: "Password@123" } });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "signup-title" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/register`,
        {
          username: "username",
          email: "test@example.com",
          password: "Password@123",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-email-invalid-format")).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText("signup-password-placeholder").value).toBe("");
  });


  it("renders and submits the form when the form is valid but receives PasswordInvalidFormatException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "PasswordInvalidFormatException" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <Signup />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.change(screen.getByPlaceholderText("signup-username-placeholder"), { target: { value: "username" } });
    fireEvent.change(screen.getByPlaceholderText("email-placeholder"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("signup-password-placeholder"), { target: { value: "Password@123" } });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "signup-title" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/register`,
        {
          username: "username",
          email: "test@example.com",
          password: "Password@123",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-password-invalid-format")).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText("signup-password-placeholder").value).toBe("");
  });


  it("renders and submits the form when the form is valid but receives UsernameNotUniqueException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "UsernameNotUniqueException" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <Signup />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.change(screen.getByPlaceholderText("signup-username-placeholder"), { target: { value: "username" } });
    fireEvent.change(screen.getByPlaceholderText("email-placeholder"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("signup-password-placeholder"), { target: { value: "Password@123" } });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "signup-title" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/register`,
        {
          username: "username",
          email: "test@example.com",
          password: "Password@123",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-username-not-unique")).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText("signup-password-placeholder").value).toBe("");
  });


  it("renders and submits the form when the form is valid but receives EmailNotUniqueException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "EmailNotUniqueException" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <Signup />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.change(screen.getByPlaceholderText("signup-username-placeholder"), { target: { value: "username" } });
    fireEvent.change(screen.getByPlaceholderText("email-placeholder"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("signup-password-placeholder"), { target: { value: "Password@123" } });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "signup-title" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/register`,
        {
          username: "username",
          email: "test@example.com",
          password: "Password@123",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-email-not-unique")).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText("signup-password-placeholder").value).toBe("");
  });


  it("renders and submits the form when the form is valid but receives unknown error", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <Signup />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.change(screen.getByPlaceholderText("signup-username-placeholder"), { target: { value: "username" } });
    fireEvent.change(screen.getByPlaceholderText("email-placeholder"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("signup-password-placeholder"), { target: { value: "Password@123" } });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "signup-title" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/register`,
        {
          username: "username",
          email: "test@example.com",
          password: "Password@123",
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

    expect(screen.getByPlaceholderText("signup-password-placeholder").value).toBe("");
  });


  it("show-password button changes the password input type", async () => {
    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <Signup />
      </TokenContext.Provider>
    );

    const passwordInput = screen.getByPlaceholderText("signup-password-placeholder");
    const showPasswordButton = screen.getAllByRole("button", { name: "password-show" })[0];

    expect(passwordInput.type).toBe("password");

    act(() => {
      fireEvent.click(showPasswordButton);
    });

    expect(passwordInput.type).toBe("text");
  });
});
