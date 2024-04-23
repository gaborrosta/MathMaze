/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import axios from "axios";
import { BACKEND_URL } from "../utils/constants";
import AccountSetNewPasswordTab from "./AccountSetNewPasswordTab";

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

//Mock axios to control API calls
jest.mock("axios");


//The test suite
describe("AccountSetNewPasswordTab", () => {
  it("renders and displays error when value is invalid", async () => {
    //Render the component
    render(<AccountSetNewPasswordTab />);

    expect(screen.getByText("account-password-change")).toBeInTheDocument();

    //Get the elements
    const inputOldPassword = screen.getByPlaceholderText("account-old-password-placeholder");
    const inputNewPassword = screen.getByPlaceholderText("account-new-password-placeholder");
    const button = screen.getByRole("button", { name: "set-new-password-title" });

    fireEvent.change(inputOldPassword, { target: { value: "password" } });

    expect(inputOldPassword.value).toBe("password");

    expect(button).toBeDisabled();

    expect(screen.getByText("account-old-password-error")).toBeInTheDocument();

    fireEvent.change(inputOldPassword, { target: { value: "Password123@" } });

    expect(inputOldPassword.value).toBe("Password123@");

    expect(screen.queryByText("account-old-password-error")).not.toBeInTheDocument();

    fireEvent.change(inputOldPassword, { target: { value: "" } });

    expect(button).toBeDisabled();

    expect(screen.getByText("field-required")).toBeInTheDocument();

    expect(screen.queryByText("account-old-password-error")).not.toBeInTheDocument();

    fireEvent.change(inputOldPassword, { target: { value: "Password123@" } });

    fireEvent.change(inputNewPassword, { target: { value: "password" } });

    expect(inputNewPassword.value).toBe("password");

    expect(button).toBeDisabled();

    expect(screen.getByText("signup-password-error")).toBeInTheDocument();

    fireEvent.change(inputNewPassword, { target: { value: "Password123@" } });

    expect(inputNewPassword.value).toBe("Password123@");

    expect(screen.queryByText("signup-password-error")).not.toBeInTheDocument();

    expect(button).toBeEnabled();

    fireEvent.change(inputNewPassword, { target: { value: "" } });

    expect(button).toBeDisabled();

    expect(screen.getByText("field-required")).toBeInTheDocument();

    expect(screen.queryByText("signup-password-error")).not.toBeInTheDocument();

    fireEvent.change(inputNewPassword, { target: { value: "Password123@" } });

    expect(button).toBeEnabled();
  });


  it("renders and submits the form when the form is valid", async () => {
    //Mock the API call
    axios.post.mockResolvedValue({ data: {} });

    //Render the component
    render(<AccountSetNewPasswordTab />);

    //Fill the form
    fireEvent.input(screen.getByPlaceholderText("account-old-password-placeholder"), { target: { value: "Password123@" } });
    fireEvent.input(screen.getByPlaceholderText("account-new-password-placeholder"), { target: { value: "Password123@" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "set-new-password-title" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/account-password-reset`,
        {
          token: "",
          oldPassword: "Password123@",
          newPassword: "Password123@",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("account-success-set-new-password")).toBeInTheDocument();
    });
  });


  it("renders and submits the form when the form is valid but receives an error", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({});

    //Render the component
    render(<AccountSetNewPasswordTab />);

    //Fill the form
    fireEvent.input(screen.getByPlaceholderText("account-old-password-placeholder"), { target: { value: "Password123@" } });
    fireEvent.input(screen.getByPlaceholderText("account-new-password-placeholder"), { target: { value: "Password123@" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "set-new-password-title" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/account-password-reset`,
        {
          token: "",
          oldPassword: "Password123@",
          newPassword: "Password123@",
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

    expect(screen.getByPlaceholderText("account-old-password-placeholder").value).toBe("");
    expect(screen.getByPlaceholderText("account-new-password-placeholder").value).toBe("");
  });


  it("renders and submits the form when the form is valid but receives UserNotFoundException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "UserNotFoundException" } });

    //Render the component
    render(<AccountSetNewPasswordTab />);

    //Fill the form
    fireEvent.input(screen.getByPlaceholderText("account-old-password-placeholder"), { target: { value: "Password123@" } });
    fireEvent.input(screen.getByPlaceholderText("account-new-password-placeholder"), { target: { value: "Password123@" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "set-new-password-title" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/account-password-reset`,
        {
          token: "",
          oldPassword: "Password123@",
          newPassword: "Password123@",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("session-expired-log-in")).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText("account-old-password-placeholder").value).toBe("");
    expect(screen.getByPlaceholderText("account-new-password-placeholder").value).toBe("");
  });


  it("renders and submits the form when the form is valid but receives InvalidCredentialsException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "InvalidCredentialsException" } });

    //Render the component
    render(<AccountSetNewPasswordTab />);

    //Fill the form
    fireEvent.input(screen.getByPlaceholderText("account-old-password-placeholder"), { target: { value: "Password123@" } });
    fireEvent.input(screen.getByPlaceholderText("account-new-password-placeholder"), { target: { value: "Password123@" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "set-new-password-title" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/account-password-reset`,
        {
          token: "",
          oldPassword: "Password123@",
          newPassword: "Password123@",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-old-password-invalid")).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText("account-old-password-placeholder").value).toBe("");
    expect(screen.getByPlaceholderText("account-new-password-placeholder").value).toBe("");
  });


  it("renders and submits the form when the form is valid but receives PasswordInvalidFormatException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "PasswordInvalidFormatException" } });

    //Render the component
    render(<AccountSetNewPasswordTab />);

    //Fill the form
    fireEvent.input(screen.getByPlaceholderText("account-old-password-placeholder"), { target: { value: "Password123@" } });
    fireEvent.input(screen.getByPlaceholderText("account-new-password-placeholder"), { target: { value: "Password123@" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "set-new-password-title" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/account-password-reset`,
        {
          token: "",
          oldPassword: "Password123@",
          newPassword: "Password123@",
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

    expect(screen.getByPlaceholderText("account-old-password-placeholder").value).toBe("");
    expect(screen.getByPlaceholderText("account-new-password-placeholder").value).toBe("");
  });


  it("renders and submits the form when the form is valid but receives unknown error", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "" } });

    //Render the component
    render(<AccountSetNewPasswordTab />);

    //Fill the form
    fireEvent.input(screen.getByPlaceholderText("account-old-password-placeholder"), { target: { value: "Password123@" } });
    fireEvent.input(screen.getByPlaceholderText("account-new-password-placeholder"), { target: { value: "Password123@" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "set-new-password-title" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/account-password-reset`,
        {
          token: "",
          oldPassword: "Password123@",
          newPassword: "Password123@",
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

    expect(screen.getByPlaceholderText("account-old-password-placeholder").value).toBe("");
    expect(screen.getByPlaceholderText("account-new-password-placeholder").value).toBe("");
  });


  it("show-password button changes the password input type", async () => {
    //Render the component
    render(<AccountSetNewPasswordTab />);

    const oldPasswordInput = screen.getByPlaceholderText("account-old-password-placeholder");
    const newPasswordInput = screen.getByPlaceholderText("account-new-password-placeholder");

    const showOldPasswordButton = screen.getAllByRole("button", { name: "password-show" })[0];
    const showNewPasswordButton = screen.getAllByRole("button", { name: "password-show" })[1];

    expect(oldPasswordInput.type).toBe("password");
    expect(newPasswordInput.type).toBe("password");

    act(() => {
      fireEvent.click(showOldPasswordButton);
      fireEvent.click(showNewPasswordButton);
    });

    expect(oldPasswordInput.type).toBe("text");
    expect(newPasswordInput.type).toBe("text");
  });
});
