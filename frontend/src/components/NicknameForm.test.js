/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import NicknameForm from "./NicknameForm";

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
describe("NicknameForm", () => {
  it("throws an error if initialNickname is undefined", () => {
    expect(() => render(<NicknameForm />)).toThrow("initialNickname is required.");
  });


  it("throws an error if initialNickname is not a string", () => {
    expect(() => render(<NicknameForm initialNickname={123} />)).toThrow("initialNickname must be a string.");
  });


  it("throws an error if isSubmitDisabled is undefined", () => {
    expect(() => render(<NicknameForm initialNickname={"nickname"} />)).toThrow("isSubmitDisabled is required.");
  });


  it("throws an error if isSubmitDisabled is not a boolean", () => {
    expect(() => render(<NicknameForm initialNickname={"nickname"} isSubmitDisabled={"not boolean"} />)).toThrow("isSubmitDisabled must be a boolean.");
  });


  it("throws an error if setIsSubmitDisabled is undefined", () => {
    expect(() => render(<NicknameForm initialNickname={"nickname"} isSubmitDisabled={true} />)).toThrow("setIsSubmitDisabled is required.");
  });


  it("throws an error if setIsSubmitDisabled is not a function", () => {
    expect(() => render(<NicknameForm initialNickname={"nickname"} isSubmitDisabled={true} setIsSubmitDisabled={"not function"} />)).toThrow("setIsSubmitDisabled must be a function.");
  });


  it("throws an error if setIsSubmitDisabled does not have 1 parameter", () => {
    expect(() => render(<NicknameForm initialNickname={"nickname"} isSubmitDisabled={true} setIsSubmitDisabled={() => {}} />)).toThrow("setIsSubmitDisabled must have 1 parameter.");
  });


  it("throws an error if handleSubmit is undefined", () => {
    expect(() => render(<NicknameForm initialNickname={"nickname"} isSubmitDisabled={true} setIsSubmitDisabled={(a) => {}} />)).toThrow("handleSubmit is required.");
  });


  it("throws an error if handleSubmit is not a function", () => {
    expect(() => render(<NicknameForm initialNickname={"nickname"} isSubmitDisabled={true} setIsSubmitDisabled={(a) => {}} handleSubmit={"not function"} />)).toThrow("handleSubmit must be a function.");
  });


  it("throws an error if handleSubmit does not have 1 parameter", () => {
    expect(() => render(<NicknameForm initialNickname={"nickname"} isSubmitDisabled={true} setIsSubmitDisabled={(a) => {}} handleSubmit={() => {}} />)).toThrow("handleSubmit must have 1 parameter.");
  });


  it("displays error when value is invalid", async () => {
    //Mock the setIsSubmitDisabled function
    const setIsSubmitDisabled = jest.fn((a) => {});

    //Render the component
    render(<NicknameForm initialNickname={"nickname"} isSubmitDisabled={false} setIsSubmitDisabled={setIsSubmitDisabled} handleSubmit={(a) => {}} />);

    //Get the input element
    const input = screen.getByRole("textbox");

    expect(input.value).toBe("nickname");

    fireEvent.change(input, { target: { value: "" } });

    expect(input.value).toBe("");

    expect(screen.getByText("field-required")).toBeInTheDocument();

    expect(setIsSubmitDisabled).toHaveBeenCalledTimes(2);
    expect(setIsSubmitDisabled).toHaveBeenCalledWith(true);

    fireEvent.change(input, { target: { value: "a" } });

    expect(input.value).toBe("a");

    expect(screen.getByText("error-invalid-nickname")).toBeInTheDocument();

    expect(setIsSubmitDisabled).toHaveBeenCalledTimes(3);

    fireEvent.change(input, { target: { value: "nickname" } });

    expect(input.value).toBe("nickname");

    expect(setIsSubmitDisabled).toHaveBeenCalledTimes(4);
    expect(setIsSubmitDisabled).toHaveBeenCalledWith(false);
  });


  it("submit with no initial nickname", async () => {
    //Mock the handleSubmit function
    const handleSubmit = jest.fn((a) => {});

    //Render the component
    render(<NicknameForm initialNickname={""} isSubmitDisabled={false} setIsSubmitDisabled={(a) => {}} handleSubmit={handleSubmit} />);

    //Get the input element
    const input = screen.getByRole("textbox");

    const button = screen.getByRole("button");

    expect(input.value).toBe("");

    fireEvent.change(input, { target: { value: "nickname" } });

    expect(input.value).toBe("nickname");

    expect(button).not.toBeDisabled();

    fireEvent.click(button);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith("nickname")
  })
});
