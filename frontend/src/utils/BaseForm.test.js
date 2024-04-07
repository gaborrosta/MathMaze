/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import { Form } from "react-bootstrap";
import BaseForm from "./BaseForm";

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


//The test suite
describe("BaseForm", () => {
  //Reset the mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });


  it("throws an error if onSubmit is missing", () => {
    expect(() => render(<BaseForm />)).toThrow("onSubmit is required.");
  });


  it("throws an error if onSubmit is not a function", () => {
    expect(() => render(<BaseForm onSubmit="test" />)).toThrow("onSubmit must be a function.");
  });


  it("throws an error if onSubmit has less than 5 parameters", () => {
    expect(() => render(<BaseForm onSubmit={(a, b, c, d) => {}} />)).toThrow("onSubmit must have 5 parameters.");
  });


  it("throws an error if initialData is missing", () => {
    expect(() => render(<BaseForm onSubmit={(a, b, c, d, e) => {}} />)).toThrow("initialData is required.");
  });


  it("throws an error if initialData is not an object", () => {
    expect(() => render(<BaseForm onSubmit={(a, b, c, d, e) => {}} initialData="test" />)).toThrow("initialData must be an object.");
  });


  it("throws an error if validationSchema is missing", () => {
    expect(() => render(<BaseForm onSubmit={(a, b, c, d, e) => {}} initialData={{}} />)).toThrow("validationSchema is required.");
  });


  it("throws an error if validationSchema is not an object", () => {
    expect(() => render(<BaseForm onSubmit={(a, b, c, d, e) => {}} initialData={{}} validationSchema="test" />)).toThrow("validationSchema must be an object.");
  });


  it("throws an error if initialData and validationSchema have different keys", () => {
    expect(() => render(<BaseForm onSubmit={(a, b, c, d, e) => {}} initialData={{ name: "" }} validationSchema={{}} />)).toThrow("initialData and validationSchema must have the same keys.");
  });


  it("throws an error if a value in validationSchema is not an object", () => {
    expect(() => render(<BaseForm onSubmit={(a, b, c, d, e) => {}} initialData={{ name: "" }} validationSchema={{ name: "" }} />)).toThrow("Every value in validationSchema must be an object. \"name\" is not an object.");
  });


  it("throws an error if a value in validationSchema does not have a regex", () => {
    expect(() => render(<BaseForm onSubmit={(a, b, c, d, e) => {}} initialData={{ name: "" }} validationSchema={{ name: {} }} />)).toThrow("Every value in validationSchema must have a regex. \"name\" does not have a regex.");
  });


  it("throws an error if a value in validationSchema does not have a regexError", () => {
    expect(() => render(<BaseForm onSubmit={(a, b, c, d, e) => {}} initialData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/) } }} />)).toThrow("Every value in validationSchema must have a regexError. \"name\" does not have a regexError.");
  });


  it("throws an error if form is missing", () => {
    expect(() => render(<BaseForm onSubmit={(a, b, c, d, e) => {}} initialData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" } }} />)).toThrow("form is required.");
  });


  it("throws an error if form is not a function", () => {
    expect(() => render(<BaseForm onSubmit={(a, b, c, d, e) => {}} initialData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" }}} form="test" />)).toThrow("form must be a function.");
  });


  it("throws an error if form has less than 6 parameters", () => {
    expect(() => render(<BaseForm onSubmit={(a, b, c, d, e) => {}} initialData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" }}} form={(a, b, c, d, e) => {}} />)).toThrow("form must have 6 parameters.");
  });


  it("throws an error if buttonText is missing", () => {
    expect(() => render(<BaseForm onSubmit={(a, b, c, d, e) => {}} initialData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" }}} form={(a, b, c, d, e, f) => {}} />)).toThrow("buttonText is required.");
  });


  it("throws an error if customValidator is not a function", () => {
    expect(() => render(<BaseForm onSubmit={(a, b, c, d, e) => {}} initialData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" }}} form={(a, b, c, d, e, f) => {}} buttonText="test" customValidator="test" />)).toThrow("customValidator must be a function.");
  });


  it("throws an error if customValidator has less than 1 parameter", () => {
    expect(() => render(<BaseForm onSubmit={(a, b, c, d, e) => {}} initialData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" }}} form={(a, b, c, d, e, f) => {}} buttonText="test" customValidator={() => {}} />)).toThrow("customValidator must have 1 parameter.");
  });


  it("handles form field changes correctly", async () => {
    //Parameters
    const onSubmit = jest.fn((a, b, c, d, e) => {});
    const initialData = { name: "" };
    const validationSchema = { name: { required: true, regex: new RegExp(/.{2,100}/), regexError: "name-error" } };
    const form = (formData, handleChange, fieldErrors, error, success, submitButton) => {
      return (
        <>
          <Form.Group>
            <Form.Control required type="text" name="name" value={formData.name} onChange={handleChange} />
            {fieldErrors.name}
          </Form.Group>
          {submitButton}
        </>
      );
    };
    const buttonText = "Submit";

    //Render the component
    render(<BaseForm onSubmit={onSubmit} initialData={initialData} validationSchema={validationSchema} form={form} buttonText={buttonText} />);

    //Get the elements
    const input = screen.getByRole("textbox");
    const button = screen.getByRole("button");

    fireEvent.change(input, { target: { value: "t" } });

    expect(input.value).toBe("t");

    expect(screen.getByText("name-error")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "test" } });

    expect(input.value).toBe("test");

    expect(screen.queryByText("name-error")).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: "" } });

    expect(input.value).toBe("");

    expect(screen.getByText("field-required")).toBeInTheDocument();

    expect(button).toBeDisabled()

    fireEvent.change(input, { target: { value: "test" } });

    expect(input.value).toBe("test");

    expect(button).not.toBeDisabled();

    await act(async () => {
      fireEvent.submit(button);
    });

    expect(onSubmit).toHaveBeenCalled();
  });


  it("handles form field changes correctly with customCheck", async () => {
    //Parameters
    const onSubmit = jest.fn((a, b, c, d, e) => {});
    const initialData = { name: "", email: "" };
    const validationSchema = {
      name: { required: true, regex: new RegExp(/.{2,100}/), regexError: "name-error" },
      email: { required: true, regex: new RegExp(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/), regexError: "email-error" },
    };
    const form = (formData, handleChange, fieldErrors, error, success, submitButton) => {
      return (
        <>
          <Form.Group>
            <Form.Control required type="text" name="name" value={formData.name} onChange={handleChange} aria-label="name" />
            {fieldErrors.name}
          </Form.Group>
          <Form.Group>
            <Form.Control required type="email" name="email" value={formData.email} onChange={handleChange} aria-label="email" />
            {fieldErrors.email}
          </Form.Group>
          {submitButton}
        </>
      );
    };
    const buttonText = "Submit";
    const customValidator = (formData) => {
      if (formData.name === "test" && formData.email === "t@test.com") {
        return { email: "name-email-error" };
      } else {
        return { email: "" };
      }
    };

    //Render the component
    render(<BaseForm onSubmit={onSubmit} initialData={initialData} validationSchema={validationSchema} form={form} buttonText={buttonText} customValidator={customValidator} />);

    //Get the elements
    const inputName = screen.getByRole("textbox", { name: "name" });
    const inputEmail = screen.getByRole("textbox", { name: "email" });
    const button = screen.getByRole("button");

    expect(button).toBeDisabled();

    fireEvent.change(inputName, { target: { value: "test" } });

    expect(inputName.value).toBe("test");

    expect(screen.queryByText("name-error")).not.toBeInTheDocument();

    fireEvent.change(inputEmail, { target: { value: "t" } });

    expect(inputEmail.value).toBe("t");

    expect(screen.queryByText("email-error")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputEmail, { target: { value: "t@test.com" } });

    expect(inputEmail.value).toBe("t@test.com");

    expect(screen.queryByText("email-error")).not.toBeInTheDocument();

    expect(screen.queryByText("name-email-error")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputName, { target: { value: "testt" } });

    expect(inputName.value).toBe("testt");

    expect(screen.queryByText("name-error")).not.toBeInTheDocument();

    expect(screen.queryByText("name-email-error")).not.toBeInTheDocument();

    expect(button).not.toBeDisabled();
  });


  it("handles form submission correctly", async () => {
    //Parameters
    const onSubmit = (data, setError, setSuccess, setFormData, done) => {
      expect(data).toEqual({ name: "test" });
      setError("error");
      setSuccess("success");
      setFormData({ name: "done" });
    }
    const initialData = { name: "" };
    const validationSchema = { name: { required: true, regex: new RegExp(/.{2,100}/), regexError: "name-error" } };
    const form = (formData, handleChange, fieldErrors, error, success, submitButton) => {
      return (
        <>
          <p>{error}</p>
          <p>{success}</p>
          <Form.Group>
            <Form.Control required type="text" name="name" value={formData.name} onChange={handleChange} />
            {fieldErrors.name}
          </Form.Group>
          {submitButton}
        </>
      );
    };
    const buttonText = "Submit";

    //Render the component
    render(<BaseForm onSubmit={onSubmit} initialData={initialData} validationSchema={validationSchema} form={form} buttonText={buttonText} />);

    //Get the elements
    const input = screen.getByRole("textbox");
    const button = screen.getByRole("button");

    fireEvent.change(input, { target: { value: "test" } });

    expect(input.value).toBe("test");

    expect(button).not.toBeDisabled();

    await act(async () => {
      fireEvent.submit(button);
    });

    expect(screen.getByText("error")).toBeInTheDocument();

    expect(screen.getByText("success")).toBeInTheDocument();

    expect(input.value).toBe("done");

    expect(button).toBeDisabled();
  });
});
