/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import { Form } from "react-bootstrap";
import StatelessForm from "./StatelessForm";

//Mock console.error
jest.spyOn(console, "error").mockImplementation(() => jest.fn());


//The test suite
describe("StatelessForm", () => {
  it("throws an error if initialData is missing", () => {
    expect(() => render(<StatelessForm />)).toThrow("initialData is required.");
  });


  it("throws an error if initialData is not an object", () => {
    expect(() => render(<StatelessForm initialData="test" />)).toThrow("initialData must be an object.");
  });


  it("throws an error if validationSchema is missing", () => {
    expect(() => render(<StatelessForm initialData={{}} />)).toThrow("validationSchema is required.");
  });


  it("throws an error if validationSchema is not an object", () => {
    expect(() => render(<StatelessForm initialData={{}} validationSchema="test" />)).toThrow("validationSchema must be an object.");
  });


  it("throws an error if initialData and validationSchema have different keys", () => {
    expect(() => render(<StatelessForm initialData={{ name: "" }} validationSchema={{}} />)).toThrow("initialData and validationSchema must have the same keys.");
  });


  it("throws an error if a value in validationSchema is not an object", () => {
    expect(() => render(<StatelessForm initialData={{ name: "" }} validationSchema={{ name: "" }} />)).toThrow("Every value in validationSchema must be an object. \"name\" is not an object.");
  });


  it("throws an error if a value in validationSchema does not have a regex", () => {
    expect(() => render(<StatelessForm initialData={{ name: "" }} validationSchema={{ name: {} }} />)).toThrow("Every value in validationSchema must have a regex. \"name\" does not have a regex.");
  });


  it("throws an error if a value in validationSchema does not have a regexError", () => {
    expect(() => render(<StatelessForm initialData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/) } }} />)).toThrow("Every value in validationSchema must have a regexError. \"name\" does not have a regexError.");
  });


  it("throws an error if setIsThereAnyError is missing", () => {
    expect(() => render(<StatelessForm initialData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" } }} />)).toThrow("setIsThereAnyError is required.");
  });


  it("throws an error if setIsThereAnyError is not a function", () => {
    expect(() => render(<StatelessForm initialData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" } }} setIsThereAnyError="test" />)).toThrow("setIsThereAnyError must be a function.");
  });


  it("throws an error if setIsThereAnyError has less than 1 parameter", () => {
    expect(() => render(<StatelessForm initialData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" } }} setIsThereAnyError={() => {}} />)).toThrow("setIsThereAnyError must have 1 parameter.");
  });


  it("throws an error if onStateChanged is missing", () => {
    expect(() => render(<StatelessForm initialData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" } }} setIsThereAnyError={(a) => {}} />)).toThrow("onStateChanged is required.");
  });


  it("throws an error if onStateChanged is not a function", () => {
    expect(() => render(<StatelessForm initialData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" } }} setIsThereAnyError={(a) => {}} onStateChanged="test" />)).toThrow("onStateChanged must be a function.");
  });


  it("throws an error if onStateChanged has less than 1 parameter", () => {
    expect(() => render(<StatelessForm initialData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" } }} setIsThereAnyError={(a) => {}} onStateChanged={() => {}} />)).toThrow("onStateChanged must have 1 parameter.");
  });


  it("throws an error if form is missing", () => {
    expect(() => render(<StatelessForm initialData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" } }} setIsThereAnyError={(a) => {}} onStateChanged={(a) => {}} />)).toThrow("form is required.");
  });


  it("throws an error if form is not a function", () => {
    expect(() => render(<StatelessForm initialData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" }}} setIsThereAnyError={(a) => {}} onStateChanged={(a) => {}} form="test" />)).toThrow("form must be a function.");
  });


  it("throws an error if form has less than 3 parameters", () => {
    expect(() => render(<StatelessForm initialData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" }}} setIsThereAnyError={(a) => {}} onStateChanged={(a) => {}} form={(a, b) => {}} />)).toThrow("form must have 3 parameters.");
  });


  it("throws an error if customValidator is not a function", () => {
    expect(() => render(<StatelessForm initialData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" }}} setIsThereAnyError={(a) => {}} onStateChanged={(a) => {}} form={(a, b, c) => {}} customValidator="test" />)).toThrow("customValidator must be a function.");
  });


  it("throws an error if customValidator has less than 1 parameter", () => {
    expect(() => render(<StatelessForm initialData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" }}} setIsThereAnyError={(a) => {}} onStateChanged={(a) => {}} form={(a, b, c) => {}} customValidator={() => {}} />)).toThrow("customValidator must have 1 parameter.");
  });


  it("handles form field changes correctly", async () => {
    //Parameters
    const initialData = { name: "" };
    const validationSchema = { name: { required: true, regex: new RegExp(/.{2,100}/), regexError: "name-error" } };
    const setIsThereAnyError = jest.fn((a) => {});
    const onStateChanged = jest.fn((a) => {});
    const form = (formData, handleChange, fieldErrors) => {
      return (
        <>
          <Form.Group>
            <Form.Control required type="text" name="name" value={formData.name} onChange={handleChange} />
            {fieldErrors.name}
          </Form.Group>
        </>
      );
    };

    //Render the component
    render(<StatelessForm initialData={initialData} validationSchema={validationSchema} setIsThereAnyError={setIsThereAnyError} onStateChanged={onStateChanged} form={form} />);

    //Get the elements
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "t" } });

    expect(input.value).toBe("t");

    expect(screen.getByText("name-error")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "test" } });

    expect(input.value).toBe("test");

    expect(screen.queryByText("name-error")).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: "" } });

    expect(input.value).toBe("");

    expect(screen.getByText("field-required")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "test" } });

    expect(input.value).toBe("test");
  });


  it("handles form field changes correctly with customCheck", async () => {
    //Parameters
    const initialData = { name: "", email: "" };
    const validationSchema = {
      name: { required: true, regex: new RegExp(/.{2,100}/), regexError: "name-error" },
      email: { required: true, regex: new RegExp(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/), regexError: "email-error" },
    };
    const setIsThereAnyError = jest.fn((a) => {});
    const onStateChanged = jest.fn((a) => {});
    const form = (formData, handleChange, fieldErrors) => {
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
        </>
      );
    };
    const customValidator = (formData) => {
      if (formData.name === "test" && formData.email === "t@test.com") {
        return { email: "name-email-error" };
      } else {
        return { email: "" };
      }
    };

    //Render the component
    render(<StatelessForm initialData={initialData} validationSchema={validationSchema} setIsThereAnyError={setIsThereAnyError} onStateChanged={onStateChanged} form={form} customValidator={customValidator} />);

    //Get the elements
    const inputName = screen.getByRole("textbox", { name: "name" });
    const inputEmail = screen.getByRole("textbox", { name: "email" });

    fireEvent.change(inputName, { target: { value: "test" } });

    expect(inputName.value).toBe("test");

    expect(screen.queryByText("name-error")).not.toBeInTheDocument();

    fireEvent.change(inputEmail, { target: { value: "t" } });

    expect(inputEmail.value).toBe("t");

    expect(screen.queryByText("email-error")).toBeInTheDocument();

    fireEvent.change(inputEmail, { target: { value: "t@test.com" } });

    expect(inputEmail.value).toBe("t@test.com");

    expect(screen.queryByText("email-error")).not.toBeInTheDocument();

    expect(screen.queryByText("name-email-error")).toBeInTheDocument();

    fireEvent.change(inputName, { target: { value: "testt" } });

    expect(inputName.value).toBe("testt");

    expect(screen.queryByText("name-error")).not.toBeInTheDocument();

    expect(screen.queryByText("name-email-error")).not.toBeInTheDocument();
  });
});
