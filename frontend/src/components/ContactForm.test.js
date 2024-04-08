/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import axios from "axios";
import { BACKEND_URL } from "../utils/constants";
import ContactForm from "./ContactForm";

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
describe("ContactForm", () => {
  it("displays error when value is invalid", async () => {
    //Render the component
    render(<ContactForm />);

    //Get the elements
    const inputName = screen.getByRole("textbox", { name: "contact-name *" });
    const inputEmail = screen.getByRole("textbox", { name: "email *" });
    const inputSubject = screen.getByRole("textbox", { name: "contact-subject *" });
    const inputMessage = screen.getByRole("textbox", { name: "contact-message *" });
    const button = screen.getByRole("button");

    fireEvent.change(inputName, { target: { value: "test" } });

    expect(inputName.value).toBe("test");

    fireEvent.change(inputName, { target: { value: "" } });

    expect(inputName.value).toBe("");

    expect(screen.getByText("field-required")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputName, { target: { value: "test" } });

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

    fireEvent.change(inputSubject, { target: { value: "test" } });

    expect(inputSubject.value).toBe("test");

    fireEvent.change(inputSubject, { target: { value: "" } });

    expect(inputSubject.value).toBe("");

    expect(screen.getByText("field-required")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputSubject, { target: { value: "test" } });

    fireEvent.change(inputMessage, { target: { value: "test" } });

    expect(inputMessage.value).toBe("test");

    fireEvent.change(inputMessage, { target: { value: "" } });

    expect(inputMessage.value).toBe("");

    expect(screen.getByText("field-required")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputMessage, { target: { value: "test" } });

    expect(button).toBeEnabled();
  });


  it("submits the form when the form is valid", async () => {
    //Mock the API call
    axios.post.mockResolvedValue({ data: {} });

    //Render the component
    render(<ContactForm />);

    //Fill the form
    fireEvent.input(screen.getByRole("textbox", { name: "contact-name *" }), { target: { value: "John Doe" } });
    fireEvent.input(screen.getByRole("textbox", { name: "email *" }), { target: { value: "text@example.com" } });
    fireEvent.input(screen.getByRole("textbox", { name: "contact-subject *" }), { target: { value: "Test Subject" } });
    fireEvent.input(screen.getByRole("textbox", { name: "contact-message *" }), { target: { value: "Test Message" } });

    fireEvent.submit(screen.getByRole("button"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/contact`,
        {
          name: "John Doe",
          email: "text@example.com",
          subject: "Test Subject",
          message: "Test Message",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("success-contact")).toBeInTheDocument();
    });
  });


  it("submits the form when the form is valid but receives an error", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({});

    //Render the component
    render(<ContactForm />);

    //Fill the form
    fireEvent.input(screen.getByRole("textbox", { name: "contact-name *" }), { target: { value: "John Doe" } });
    fireEvent.input(screen.getByRole("textbox", { name: "email *" }), { target: { value: "text@example.com" } });
    fireEvent.input(screen.getByRole("textbox", { name: "contact-subject *" }), { target: { value: "Test Subject" } });
    fireEvent.input(screen.getByRole("textbox", { name: "contact-message *" }), { target: { value: "Test Message" } });

    fireEvent.submit(screen.getByRole("button"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/contact`,
        {
          name: "John Doe",
          email: "text@example.com",
          subject: "Test Subject",
          message: "Test Message",
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


  it("submits the form when the form is valid but receives ContactNameEmptyException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "ContactNameEmptyException" } });

    //Render the component
    render(<ContactForm />);

    //Fill the form
    fireEvent.input(screen.getByRole("textbox", { name: "contact-name *" }), { target: { value: "John Doe" } });
    fireEvent.input(screen.getByRole("textbox", { name: "email *" }), { target: { value: "text@example.com" } });
    fireEvent.input(screen.getByRole("textbox", { name: "contact-subject *" }), { target: { value: "Test Subject" } });
    fireEvent.input(screen.getByRole("textbox", { name: "contact-message *" }), { target: { value: "Test Message" } });

    fireEvent.submit(screen.getByRole("button"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/contact`,
        {
          name: "John Doe",
          email: "text@example.com",
          subject: "Test Subject",
          message: "Test Message",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-contact-name-empty")).toBeInTheDocument();
    });
  });


  it("submits the form when the form is valid but receives EmailInvalidFormatException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "EmailInvalidFormatException" } });

    //Render the component
    render(<ContactForm />);

    //Fill the form
    fireEvent.input(screen.getByRole("textbox", { name: "contact-name *" }), { target: { value: "John Doe" } });
    fireEvent.input(screen.getByRole("textbox", { name: "email *" }), { target: { value: "text@example.com" } });
    fireEvent.input(screen.getByRole("textbox", { name: "contact-subject *" }), { target: { value: "Test Subject" } });
    fireEvent.input(screen.getByRole("textbox", { name: "contact-message *" }), { target: { value: "Test Message" } });

    fireEvent.submit(screen.getByRole("button"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/contact`,
        {
          name: "John Doe",
          email: "text@example.com",
          subject: "Test Subject",
          message: "Test Message",
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
  });


  it("submits the form when the form is valid but receives ContactSubjectEmptyException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "ContactSubjectEmptyException" } });

    //Render the component
    render(<ContactForm />);

    //Fill the form
    fireEvent.input(screen.getByRole("textbox", { name: "contact-name *" }), { target: { value: "John Doe" } });
    fireEvent.input(screen.getByRole("textbox", { name: "email *" }), { target: { value: "text@example.com" } });
    fireEvent.input(screen.getByRole("textbox", { name: "contact-subject *" }), { target: { value: "Test Subject" } });
    fireEvent.input(screen.getByRole("textbox", { name: "contact-message *" }), { target: { value: "Test Message" } });

    fireEvent.submit(screen.getByRole("button"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/contact`,
        {
          name: "John Doe",
          email: "text@example.com",
          subject: "Test Subject",
          message: "Test Message",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-contact-subject-empty")).toBeInTheDocument();
    });
  });


  it("submits the form when the form is valid but receives ContactMessageEmptyException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "ContactMessageEmptyException" } });

    //Render the component
    render(<ContactForm />);

    //Fill the form
    fireEvent.input(screen.getByRole("textbox", { name: "contact-name *" }), { target: { value: "John Doe" } });
    fireEvent.input(screen.getByRole("textbox", { name: "email *" }), { target: { value: "text@example.com" } });
    fireEvent.input(screen.getByRole("textbox", { name: "contact-subject *" }), { target: { value: "Test Subject" } });
    fireEvent.input(screen.getByRole("textbox", { name: "contact-message *" }), { target: { value: "Test Message" } });

    fireEvent.submit(screen.getByRole("button"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/contact`,
        {
          name: "John Doe",
          email: "text@example.com",
          subject: "Test Subject",
          message: "Test Message",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-contact-message-empty")).toBeInTheDocument();
    });
  });


  it("submits the form when the form is valid but receives unknown error", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "" } });

    //Render the component
    render(<ContactForm />);

    //Fill the form
    fireEvent.input(screen.getByRole("textbox", { name: "contact-name *" }), { target: { value: "John Doe" } });
    fireEvent.input(screen.getByRole("textbox", { name: "email *" }), { target: { value: "text@example.com" } });
    fireEvent.input(screen.getByRole("textbox", { name: "contact-subject *" }), { target: { value: "Test Subject" } });
    fireEvent.input(screen.getByRole("textbox", { name: "contact-message *" }), { target: { value: "Test Message" } });

    fireEvent.submit(screen.getByRole("button"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/contact`,
        {
          name: "John Doe",
          email: "text@example.com",
          subject: "Test Subject",
          message: "Test Message",
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
  });
});
