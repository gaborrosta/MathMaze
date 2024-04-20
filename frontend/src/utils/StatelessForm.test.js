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
  it("throws an error if formData is missing", () => {
    expect(() => render(<StatelessForm />)).toThrow("formData is required.");
  });


  it("throws an error if formData is not an object", () => {
    expect(() => render(<StatelessForm formData="test" />)).toThrow("formData must be an object.");
  });


  it("throws an error if validationSchema is missing", () => {
    expect(() => render(<StatelessForm formData={{}} />)).toThrow("validationSchema is required.");
  });


  it("throws an error if validationSchema is not an object", () => {
    expect(() => render(<StatelessForm formData={{}} validationSchema="test" />)).toThrow("validationSchema must be an object.");
  });


  it("throws an error if formData and validationSchema have different keys", () => {
    expect(() => render(<StatelessForm formData={{ name: "" }} validationSchema={{}} />)).toThrow("formData and validationSchema must have the same keys.");
  });


  it("throws an error if a value in validationSchema is not an object", () => {
    expect(() => render(<StatelessForm formData={{ name: "" }} validationSchema={{ name: "" }} />)).toThrow("Every value in validationSchema must be an object. \"name\" is not an object.");
  });


  it("throws an error if a value in validationSchema does not have a regex", () => {
    expect(() => render(<StatelessForm formData={{ name: "" }} validationSchema={{ name: {} }} />)).toThrow("Every value in validationSchema must either have a regex with regexError or fileTypes with fileError. \"name\" does not meet this requirement.");
  });


  it("throws an error if a value in validationSchema does not have a regexError", () => {
    expect(() => render(<StatelessForm formData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/) } }} />)).toThrow("Every value in validationSchema must either have a regex with regexError or fileTypes with fileError. \"name\" does not meet this requirement.");
  });


  it("throws an error if a value in validationSchema has wrong fileTypes", () => {
    expect(() => render(<StatelessForm formData={{ name: "" }} validationSchema={{ name: { fileTypes: "nothing" } }} />)).toThrow("Every value in validationSchema must either have a regex with regexError or fileTypes with fileError. \"name\" does not meet this requirement.");
  });


  it("throws an error if a value in validationSchema does not have fileError but has fileTypes", () => {
    expect(() => render(<StatelessForm formData={{ name: "" }} validationSchema={{ name: { fileTypes: ["types"] } }} />)).toThrow("Every value in validationSchema must either have a regex with regexError or fileTypes with fileError. \"name\" does not meet this requirement.");
  });


  it("throws an error if fieldErrors is missing", () => {
    expect(() => render(<StatelessForm formData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" } }} />)).toThrow("fieldErrors is required.");
  });


  it("throws an error if fieldErrors is not an object", () => {
    expect(() => render(<StatelessForm formData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" } }} fieldErrors="test" />)).toThrow("fieldErrors must be an object.");
  });


  it("throws an error if fieldErrors has a different key", () => {
    expect(() => render(<StatelessForm formData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" } }} fieldErrors={{ asd: "" }} />)).toThrow("fieldErrors cannot have different keys than formData.");
  });


  it("throws an error if setFieldErrors is missing", () => {
    expect(() => render(<StatelessForm formData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" } }} fieldErrors={{ name: "" }} />)).toThrow("setFieldErrors is required.");
  });


  it("throws an error if setFieldErrors is not a function", () => {
    expect(() => render(<StatelessForm formData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" } }} fieldErrors={{ name: "" }} setFieldErrors="test" />)).toThrow("setFieldErrors must be a function.");
  });


  it("throws an error if setFieldErrors has less than 1 parameter", () => {
    expect(() => render(<StatelessForm formData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" } }} fieldErrors={{ name: "" }} setFieldErrors={() => {}} />)).toThrow("setFieldErrors must have 1 parameter.");
  });


  it("throws an error if setIsThereAnyError is missing", () => {
    expect(() => render(<StatelessForm formData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" } }} fieldErrors={{ name: "" }} setFieldErrors={(a) => {}} />)).toThrow("setIsThereAnyError is required.");
  });


  it("throws an error if setIsThereAnyError is not a function", () => {
    expect(() => render(<StatelessForm formData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" } }} fieldErrors={{ name: "" }} setFieldErrors={(a) => {}} setIsThereAnyError="test" />)).toThrow("setIsThereAnyError must be a function.");
  });


  it("throws an error if setIsThereAnyError has less than 1 parameter", () => {
    expect(() => render(<StatelessForm formData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" } }} fieldErrors={{ name: "" }} setFieldErrors={(a) => {}} setIsThereAnyError={() => {}} />)).toThrow("setIsThereAnyError must have 1 parameter.");
  });


  it("throws an error if onStateChanged is missing", () => {
    expect(() => render(<StatelessForm formData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" } }} fieldErrors={{ name: "" }} setFieldErrors={(a) => {}} setIsThereAnyError={(a) => {}} />)).toThrow("onStateChanged is required.");
  });


  it("throws an error if onStateChanged is not a function", () => {
    expect(() => render(<StatelessForm formData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" } }} fieldErrors={{ name: "" }} setFieldErrors={(a) => {}} setIsThereAnyError={(a) => {}} onStateChanged="test" />)).toThrow("onStateChanged must be a function.");
  });


  it("throws an error if onStateChanged has less than 1 parameter", () => {
    expect(() => render(<StatelessForm formData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" } }} fieldErrors={{ name: "" }} setFieldErrors={(a) => {}} setIsThereAnyError={(a) => {}} onStateChanged={() => {}} />)).toThrow("onStateChanged must have 1 parameter.");
  });


  it("throws an error if form is missing", () => {
    expect(() => render(<StatelessForm formData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" } }} fieldErrors={{ name: "" }} setFieldErrors={(a) => {}} setIsThereAnyError={(a) => {}} onStateChanged={(a) => {}} />)).toThrow("form is required.");
  });


  it("throws an error if form is not a function", () => {
    expect(() => render(<StatelessForm formData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" } }} fieldErrors={{ name: "" }} setFieldErrors={(a) => {}} setIsThereAnyError={(a) => {}} onStateChanged={(a) => {}} form="test" />)).toThrow("form must be a function.");
  });


  it("throws an error if form has less than 3 parameters", () => {
    expect(() => render(<StatelessForm formData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" } }} fieldErrors={{ name: "" }} setFieldErrors={(a) => {}} setIsThereAnyError={(a) => {}} onStateChanged={(a) => {}} form={(a, b) => {}} />)).toThrow("form must have 3 parameters.");
  });


  it("throws an error if customValidator is not a function", () => {
    expect(() => render(<StatelessForm formData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" } }} fieldErrors={{ name: "" }} setFieldErrors={(a) => {}} setIsThereAnyError={(a) => {}} onStateChanged={(a) => {}} form={(a, b, c) => {}} customValidator="test" />)).toThrow("customValidator must be a function.");
  });


  it("throws an error if customValidator has less than 1 parameter", () => {
    expect(() => render(<StatelessForm formData={{ name: "" }} validationSchema={{ name: { regex: new RegExp(/.{1,100}/), regexError: "name-error" } }} fieldErrors={{ name: "" }} setFieldErrors={(a) => {}} setIsThereAnyError={(a) => {}} onStateChanged={(a) => {}} form={(a, b, c) => {}} customValidator={() => {}} />)).toThrow("customValidator must have 1 parameter.");
  });


  it("handles form field changes correctly", async () => {
    //Parameters
    const formData = { name: "" };
    const validationSchema = { name: { required: true, regex: new RegExp(/.{2,100}/), regexError: "name-error" } };
    const fieldErrors = {};
    const setFieldErrors = jest.fn((a) => {});
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
    render(<StatelessForm formData={formData} validationSchema={validationSchema} fieldErrors={fieldErrors} setFieldErrors={setFieldErrors} setIsThereAnyError={setIsThereAnyError} onStateChanged={onStateChanged} form={form} />);

    //Get the elements
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "t" } });

    expect(onStateChanged).toHaveBeenCalledTimes(1);
    expect(onStateChanged).toHaveBeenCalledWith({ name: "t" });
    expect(setFieldErrors).toHaveBeenCalledTimes(1);
    expect(setFieldErrors).toHaveBeenCalledWith({ name: "name-error" })

    fireEvent.change(input, { target: { value: "test" } });

    expect(onStateChanged).toHaveBeenCalledTimes(2);
    expect(onStateChanged).toHaveBeenCalledWith({ name: "test" });
    expect(setFieldErrors).toHaveBeenCalledTimes(2);
    expect(setFieldErrors).toHaveBeenCalledWith({})
  });


  it("starts with fieldErrors", async () => {
    //Parameters
    const formData = { name: "" };
    const validationSchema = { name: { required: true, regex: new RegExp(/.{2,100}/), regexError: "name-error" } };
    const fieldErrors = { name: "field-required" };
    const setFieldErrors = jest.fn((a) => {});
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
    render(<StatelessForm formData={formData} validationSchema={validationSchema} fieldErrors={fieldErrors} setFieldErrors={setFieldErrors} setIsThereAnyError={setIsThereAnyError} onStateChanged={onStateChanged} form={form} />);

    expect(screen.getByText("field-required")).toBeInTheDocument();
  });


  it("gives field-required error", async () => {
    //Parameters
    const formData = { name: "asd" };
    const validationSchema = { name: { required: true, regex: new RegExp(/.{2,100}/), regexError: "name-error" } };
    const fieldErrors = {};
    const setFieldErrors = jest.fn((a) => {});
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
    render(<StatelessForm formData={formData} validationSchema={validationSchema} fieldErrors={fieldErrors} setFieldErrors={setFieldErrors} setIsThereAnyError={setIsThereAnyError} onStateChanged={onStateChanged} form={form} />);

    //Get the elements
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "" } });

    expect(setFieldErrors).toHaveBeenCalledTimes(1);
    expect(setFieldErrors).toHaveBeenCalledWith({ name: "field-required" })
  });


  it("handles form field changes correctly with customCheck", async () => {
    //Parameters
    const formData = { name: "", email: "" };
    const validationSchema = {
      name: { required: true, regex: new RegExp(/.{2,100}/), regexError: "name-error" },
      email: { required: true, regex: new RegExp(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/), regexError: "email-error" },
    };
    const fieldErrors = {};
    const setFieldErrors = jest.fn((a) => {});
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
      if (formData.email === "t@test.com") {
        return { email: "name-email-error" };
      } else {
        return { email: "" };
      }
    };

    //Render the component
    render(<StatelessForm formData={formData} validationSchema={validationSchema} fieldErrors={fieldErrors} setFieldErrors={setFieldErrors} setIsThereAnyError={setIsThereAnyError} onStateChanged={onStateChanged} form={form} customValidator={customValidator} />);

    //Get the elements
    const inputName = screen.getByRole("textbox", { name: "name" });
    const inputEmail = screen.getByRole("textbox", { name: "email" });

    fireEvent.change(inputName, { target: { value: "test" } });

    expect(onStateChanged).toHaveBeenCalledTimes(1);
    expect(onStateChanged).toHaveBeenCalledWith({ name: "test", email: "" });
    expect(setFieldErrors).toHaveBeenCalledTimes(1);
    expect(setFieldErrors).toHaveBeenCalledWith({})

    fireEvent.change(inputEmail, { target: { value: "t" } });

    expect(onStateChanged).toHaveBeenCalledTimes(2);
    expect(onStateChanged).toHaveBeenCalledWith({ name: "", email: "t" });
    expect(setFieldErrors).toHaveBeenCalledTimes(2);
    expect(setFieldErrors).toHaveBeenCalledWith({ email: "email-error" })

    fireEvent.change(inputEmail, { target: { value: "t@test.com" } });

    expect(onStateChanged).toHaveBeenCalledTimes(3);
    expect(onStateChanged).toHaveBeenCalledWith({ name: "", email: "t@test.com" });
    expect(setFieldErrors).toHaveBeenCalledTimes(3);
    expect(setFieldErrors).toHaveBeenCalledWith({ email: "name-email-error" })

    fireEvent.change(inputName, { target: { value: "test" } });

    expect(onStateChanged).toHaveBeenCalledTimes(4);
    expect(onStateChanged).toHaveBeenCalledWith({ name: "test", email: "" });
    expect(setFieldErrors).toHaveBeenCalledTimes(4);
    expect(setFieldErrors).toHaveBeenCalledWith({})
  });


  it("handles file upload", async () => {
    //Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn((file) => { return file.name; });

    //Create some files
    const file1 = new File(["hello"], "hello.png", { type: "image/png" });
    const file2 = new File(["hello"], "hello.txt", { type: "text" });

    //Parameters
    const formData = { file: "" };
    const validationSchema = { file: { fileTypes: [ "image/png" ], fileError: "file-error", required: true } };
    const fieldErrors = {};
    const setFieldErrors = jest.fn((a) => {});
    const setIsThereAnyError = jest.fn((a) => {});
    const onStateChanged = jest.fn((a) => {});
    const form = (formData, handleChange, fieldErrors) => {
      return (
        <>
          <Form.Group>
            <Form.Control required type="file" name="file" value={formData.file} onChange={handleChange} data-testid="file" />
            {fieldErrors.file}
          </Form.Group>
        </>
      );
    };

    //Render the component
    render(<StatelessForm formData={formData} validationSchema={validationSchema} fieldErrors={fieldErrors} setFieldErrors={setFieldErrors} setIsThereAnyError={setIsThereAnyError} onStateChanged={onStateChanged} form={form} />);

    //Get the elements
    const input = screen.getByTestId("file");

    fireEvent.change(input, { target: { files: [file1] } });

    expect(onStateChanged).toHaveBeenCalledTimes(1);
    expect(onStateChanged).toHaveBeenCalledWith({ file: { file: file1, url: "hello.png" } });
    expect(setFieldErrors).toHaveBeenCalledTimes(1);
    expect(setFieldErrors).toHaveBeenCalledWith({})

    fireEvent.change(input, { target: { files: [file2] } });

    expect(onStateChanged).toHaveBeenCalledTimes(2);
    expect(onStateChanged).toHaveBeenCalledWith({ file: null });
    expect(setFieldErrors).toHaveBeenCalledTimes(2);
    expect(setFieldErrors).toHaveBeenCalledWith({ file: "file-error" });

    fireEvent.change(input, { target: { files: null } });

    expect(onStateChanged).toHaveBeenCalledTimes(3);
    expect(onStateChanged).toHaveBeenCalledWith({ file: null });
    expect(setFieldErrors).toHaveBeenCalledTimes(3);
    expect(setFieldErrors).toHaveBeenCalledWith({ file: "field-required" });

    fireEvent.change(input, { target: { files: [undefined] } });

    expect(onStateChanged).toHaveBeenCalledTimes(4);
    expect(onStateChanged).toHaveBeenCalledWith({ file: null });
    expect(setFieldErrors).toHaveBeenCalledTimes(4);
    expect(setFieldErrors).toHaveBeenCalledWith({ file: "field-required" });

    global.URL.createObjectURL.mockRestore();
  });


  it("handles form field changes with more", async () => {
    //Parameters
    const formData = { name: "", email: "" };
    const validationSchema = {
      name: { required: true, regex: new RegExp(/.{2,100}/), regexError: "name-error" },
      email: { required: true, regex: new RegExp(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/), regexError: "email-error" },
    };
    const fieldErrors = {};
    const setFieldErrors = jest.fn((a) => {});
    const setIsThereAnyError = jest.fn((a) => {});
    const onStateChanged = jest.fn((a) => {});
    const form = (formData, handleChange, fieldErrors) => {
      const handle = (e) => {
        const value = e.target.value;
        handleChange({ target: { name: "name", value: "test", more: [{ name: "email", value: value }] } });
      }

      return (
        <>
          <Form.Group>
            <Form.Control required type="text" name="name" value={formData.name} onChange={handle} aria-label="name" />
            {fieldErrors.name}
          </Form.Group>
          <Form.Group>
            <Form.Control required type="email" name="email" value={formData.email} onChange={handleChange} aria-label="email" />
            {fieldErrors.email}
          </Form.Group>
        </>
      );
    };

    //Render the component
    render(<StatelessForm formData={formData} validationSchema={validationSchema} fieldErrors={fieldErrors} setFieldErrors={setFieldErrors} setIsThereAnyError={setIsThereAnyError} onStateChanged={onStateChanged} form={form} />);

    //Get the elements
    const inputName = screen.getByRole("textbox", { name: "name" });
    const inputEmail = screen.getByRole("textbox", { name: "email" });

    fireEvent.change(inputName, { target: { value: "test" } });

    expect(onStateChanged).toHaveBeenCalledTimes(1);
    expect(onStateChanged).toHaveBeenCalledWith({ name: "test", email: "test" });
    expect(setFieldErrors).toHaveBeenCalledTimes(1);
    expect(setFieldErrors).toHaveBeenCalledWith({ email: "email-error" })
  });
});
