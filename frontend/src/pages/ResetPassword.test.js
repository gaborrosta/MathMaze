/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import axios from "axios";
import { BACKEND_URL } from "../utils/constants";
import ResetPassword from "./ResetPassword";

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
describe("ResetPassword", () => {
  it("renders", () => {
    //Render the component
    render(<ResetPassword />);

    expect(screen.getByText("reset-password-title")).toBeInTheDocument();
    expect(screen.getByText("reset-password-text")).toBeInTheDocument();
  });


  it("displays error when value is invalid", async () => {
    //Render the component
    render(<ResetPassword />);

    //Get the elements
    const inputEmail = screen.getByRole("textbox", { name: "email *" });
    const button = screen.getByRole("button");

    fireEvent.change(inputEmail, { target: { value: "test@example.com" } });

    expect(inputEmail.value).toBe("test@example.com");

    fireEvent.change(inputEmail, { target: { value: "" } });

    expect(inputEmail.value).toBe("");

    expect(screen.getByText("field-required")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputEmail, { target: { value: "test" } });

    expect(inputEmail.value).toBe("test");

    expect(screen.getByText("email-error")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputEmail, { target: { value: "test@example.com" } });

    expect(inputEmail.value).toBe("test@example.com");

    expect(button).toBeEnabled();
  });


  it("submits the form when the form is valid", async () => {
    //Mock the API call
    axios.post.mockResolvedValue({ data: {} });

    //Render the component
    render(<ResetPassword />);

    //Fill the form
    fireEvent.input(screen.getByRole("textbox", { name: "email *" }), { target: { value: "text@example.com" } });

    fireEvent.submit(screen.getByRole("button"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/password-request`,
        {
          email: "text@example.com",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("success-password-reset")).toBeInTheDocument();
    });
  });


  it("submits the form when the form is valid but receives an error", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({});

    //Render the component
    render(<ResetPassword />);

    //Fill the form
    fireEvent.input(screen.getByRole("textbox", { name: "email *" }), { target: { value: "text@example.com" } });

    fireEvent.submit(screen.getByRole("button"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/password-request`,
        {
          email: "text@example.com",
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
  });
});
