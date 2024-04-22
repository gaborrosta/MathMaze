/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../utils/constants";
import SetNewPassword from "./SetNewPassword";

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

// Mock the useSearchParams hook
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useSearchParams: jest.fn(),
}));

//Mock the timers
jest.useFakeTimers();

//Mock axios to control API calls
jest.mock("axios");


//The test suite
describe("SetNewPassword", () => {
  it("renders without token param", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams()]);

    //Render the component
    render(<SetNewPassword />);

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.getByText("set-new-password-error-no-token")).toBeInTheDocument();
  });


  it("renders with token param but receives an error", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams({ token: "1234" })]);

    //Mock the API call
    axios.get.mockRejectedValue({});

    //Render the component
    render(<SetNewPassword />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/users/password-validate?token=1234`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.getByText("error-unknown")).toBeInTheDocument();
  });


  it("renders with token param but receives a TokenInvalidOrExpiredException", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams({ token: "1234" })]);

    //Mock the API call
    axios.get.mockRejectedValue({ response: { data: "TokenInvalidOrExpiredException" } });

    //Render the component
    render(<SetNewPassword />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/users/password-validate?token=1234`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.getByText("set-new-password-error-token-invalid-or-expired")).toBeInTheDocument();
  });


  it("renders with token param but receives an unknown error", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams({ token: "1234" })]);

    //Mock the API call
    axios.get.mockRejectedValue({ response: { data: "" } });

    //Render the component
    render(<SetNewPassword />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/users/password-validate?token=1234`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.getByText("error-unknown")).toBeInTheDocument();
  });


  it("renders with token param and displays error when value is invalid", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams({ token: "1234" })]);

    //Mock the API call
    axios.get.mockResolvedValue({});

    //Render the component
    render(<SetNewPassword />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/users/password-validate?token=1234`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.getAllByText("set-new-password-title").length).toBe(2);
    expect(screen.getByText("set-new-password-text")).toBeInTheDocument();

    //Get the elements
    const inputPassword = screen.getByPlaceholderText("signup-password-placeholder");
    const button = screen.getByRole("button", { name: "set-new-password-title" });

    fireEvent.change(inputPassword, { target: { value: "password" } });

    expect(inputPassword.value).toBe("password");

    expect(button).toBeDisabled();

    expect(screen.getByText("signup-password-error")).toBeInTheDocument();

    fireEvent.change(inputPassword, { target: { value: "Password123@" } });

    expect(inputPassword.value).toBe("Password123@");

    expect(screen.queryByText("signup-password-error")).not.toBeInTheDocument();

    expect(button).toBeEnabled();

    fireEvent.change(inputPassword, { target: { value: "" } });

    expect(button).toBeDisabled();

    expect(screen.getByText("field-required")).toBeInTheDocument();

    expect(screen.queryByText("signup-password-error")).not.toBeInTheDocument();

    fireEvent.change(inputPassword, { target: { value: "Password123@" } });

    expect(button).toBeEnabled();
  });


  it("renders with token param and submits the form when the form is valid", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams({ token: "1234" })]);

    //Mock the API call
    axios.get.mockResolvedValue({});
    axios.post.mockResolvedValue({ data: {} });

    //Render the component
    render(<SetNewPassword />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/users/password-validate?token=1234`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    //Fill the form
    fireEvent.input(screen.getByPlaceholderText("signup-password-placeholder"), { target: { value: "Password123@" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "set-new-password-title" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/password-reset`,
        {
          token: "1234",
          password: "Password123@",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("success-set-new-password")).toBeInTheDocument();
      expect(screen.queryByPlaceholderText("signup-password-placeholder")).not.toBeInTheDocument();
    });
  });


  it("renders with token param and submits the form when the form is valid but receives an error", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams({ token: "1234" })]);

    //Mock the API call
    axios.get.mockResolvedValue({});
    axios.post.mockRejectedValue({});

    //Render the component
    render(<SetNewPassword />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/users/password-validate?token=1234`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    //Fill the form
    fireEvent.input(screen.getByPlaceholderText("signup-password-placeholder"), { target: { value: "Password123@" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "set-new-password-title" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/password-reset`,
        {
          token: "1234",
          password: "Password123@",
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


  it("renders with token param and submits the form when the form is valid but receives PasswordInvalidFormatException", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams({ token: "1234" })]);

    //Mock the API call
    axios.get.mockResolvedValue({});
    axios.post.mockRejectedValue({ response: { data: "PasswordInvalidFormatException" } });

    //Render the component
    render(<SetNewPassword />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/users/password-validate?token=1234`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    //Fill the form
    fireEvent.input(screen.getByPlaceholderText("signup-password-placeholder"), { target: { value: "Password123@" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "set-new-password-title" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/password-reset`,
        {
          token: "1234",
          password: "Password123@",
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


  it("renders with token param and submits the form when the form is valid but receives unknown error", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams({ token: "1234" })]);

    //Mock the API call
    axios.get.mockResolvedValue({});
    axios.post.mockRejectedValue({ response: { data: "" } });

    //Render the component
    render(<SetNewPassword />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/users/password-validate?token=1234`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    //Fill the form
    fireEvent.input(screen.getByPlaceholderText("signup-password-placeholder"), { target: { value: "Password123@" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "set-new-password-title" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/password-reset`,
        {
          token: "1234",
          password: "Password123@",
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
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams({ token: "1234" })]);

    //Mock the API call
    axios.get.mockResolvedValue({});

    //Render the component
    render(<SetNewPassword />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/users/password-validate?token=1234`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    const passwordInput = screen.getByPlaceholderText("signup-password-placeholder");
    const showPasswordButton = screen.getAllByRole("button", { name: "password-show" })[0];

    expect(passwordInput.type).toBe("password");

    act(() => {
      fireEvent.click(showPasswordButton);
    });

    expect(passwordInput.type).toBe("text");
  });
});
