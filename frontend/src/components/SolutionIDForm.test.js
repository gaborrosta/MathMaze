/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import SolutionIDForm from "./SolutionIDForm";

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
describe("SolutionIDForm", () => {
  it("throws error when index is undefined", () => {
    expect(() => render(<SolutionIDForm />)).toThrow("index is required.");
  });


  it("throws error when index is not a number", () => {
    expect(() => render(<SolutionIDForm index="not a number" />)).toThrow("index must be a number.");
  });


  it("throws error when onStateChange is undefined", () => {
    expect(() => render(<SolutionIDForm index={0} />)).toThrow("onStateChange is required.");
  });


  it("throws error when onStateChange is not a function", () => {
    expect(() => render(<SolutionIDForm index={0} onStateChange="not a function" />)).toThrow("onStateChange must be a function.");
  });


  it("throws error when onStateChange does not have 2 parameters", () => {
    expect(() => render(<SolutionIDForm index={0} onStateChange={() => {}} />)).toThrow("onStateChange must have 2 parameters.");
  });


  it("throws error when onErrorChange is undefined", () => {
    expect(() => render(<SolutionIDForm index={0} onStateChange={(a, b) => {}} />)).toThrow("onErrorChange is required.");
  });


  it("throws error when onErrorChange is not a function", () => {
    expect(() => render(<SolutionIDForm index={0} onStateChange={(a, b) => {}} onErrorChange="not a function" />)).toThrow("onErrorChange must be a function.");
  });


  it("throws error when onErrorChange does not have 1 parameter", () => {
    expect(() => render(<SolutionIDForm index={0} onStateChange={(a, b) => {}} onErrorChange={() => {}} />)).toThrow("onErrorChange must have 1 parameter.");
  });


  it("displays error when value is invalid", async () => {
    //Mock the onStateChange, onErrorChange functions
    const onStateChange = jest.fn((a, b) => {});
    const onErrorChange = jest.fn((a) => {});

    //Render the component
    render(<SolutionIDForm index={0} onStateChange={onStateChange} onErrorChange={onErrorChange} />);

    const select = screen.getByRole("combobox");

    const solutionId = screen.getByRole("textbox", { name: "maze-generate-solution-id *" });

    fireEvent.change(solutionId, { target: { value: "asd" } });

    expect(solutionId.value).toBe("asd");

    expect(screen.getByText("maze-generate-solution-id-invalid")).toBeInTheDocument();

    expect(onStateChange).toHaveBeenCalledTimes(1);
    expect(onStateChange).toHaveBeenCalledWith(0, { solutionId: "asd" })

    expect(onErrorChange).toHaveBeenCalledTimes(2);
    expect(onErrorChange).toHaveBeenCalledWith(true);

    fireEvent.change(solutionId, { target: { value: "" } });

    expect(solutionId.value).toBe("");

    expect(screen.queryByText("maze-generate-solution-id-invalid")).not.toBeInTheDocument();

    expect(screen.getByText("field-required")).toBeInTheDocument();

    expect(onStateChange).toHaveBeenCalledTimes(2);
    expect(onStateChange).toHaveBeenCalledWith(0, { solutionId: "" })

    expect(onErrorChange).toHaveBeenCalledTimes(3);
    expect(onErrorChange).toHaveBeenCalledWith(true);

    fireEvent.change(solutionId, { target: { value: "1" } });

    expect(solutionId.value).toBe("1");

    expect(screen.queryByText("field-required")).not.toBeInTheDocument();

    expect(onStateChange).toHaveBeenCalledTimes(3);
    expect(onStateChange).toHaveBeenCalledWith(0, { solutionId: "1" })

    expect(onErrorChange).toHaveBeenCalledTimes(4);
    expect(onErrorChange).toHaveBeenCalledWith(false);

    fireEvent.change(select, { target: { value: "mazeId" } });

    expect(select.value).toBe("mazeId");

    expect(solutionId).not.toBeInTheDocument();

    expect(onStateChange).toHaveBeenCalledTimes(4);
    expect(onStateChange).toHaveBeenCalledWith(0, { mazeId: "", nickname: "" })

    expect(onErrorChange).toHaveBeenCalledTimes(6);
    expect(onErrorChange).toHaveBeenCalledWith(false);

    const mazeId = screen.getByRole("textbox", { name: "maze-generate-maze-id *" });
    const nickname = screen.getByRole("textbox", { name: "maze-generate-nickname *" });

    fireEvent.change(mazeId, { target: { value: "asd" } });

    expect(mazeId.value).toBe("asd");

    expect(screen.getByText("maze-generate-maze-id-invalid")).toBeInTheDocument();

    expect(onStateChange).toHaveBeenCalledTimes(5);
    expect(onStateChange).toHaveBeenCalledWith(0, { mazeId: "asd", nickname: "" })

    expect(onErrorChange).toHaveBeenCalledTimes(7);
    expect(onErrorChange).toHaveBeenCalledWith(false);

    fireEvent.change(mazeId, { target: { value: "" } });

    expect(mazeId.value).toBe("");

    expect(screen.queryByText("maze-generate-maze-id-invalid")).not.toBeInTheDocument();

    expect(screen.getByText("field-required")).toBeInTheDocument();

    expect(onStateChange).toHaveBeenCalledTimes(6);
    expect(onStateChange).toHaveBeenCalledWith(0, { mazeId: "", nickname: "" })

    expect(onErrorChange).toHaveBeenCalledTimes(8);

    fireEvent.change(mazeId, { target: { value: "1" } });

    expect(mazeId.value).toBe("1");

    expect(screen.queryByText("field-required")).not.toBeInTheDocument();

    expect(onStateChange).toHaveBeenCalledTimes(7);
    expect(onStateChange).toHaveBeenCalledWith(0, { mazeId: "1", nickname: "" })

    expect(onErrorChange).toHaveBeenCalledTimes(9);
    expect(onErrorChange).toHaveBeenCalledWith(true);

    fireEvent.change(nickname, { target: { value: "asd" } });

    expect(nickname.value).toBe("asd");

    expect(screen.getByText("maze-generate-nickname-invalid")).toBeInTheDocument();

    expect(onStateChange).toHaveBeenCalledTimes(8);
    expect(onStateChange).toHaveBeenCalledWith(0, { mazeId: "1", nickname: "asd" })

    expect(onErrorChange).toHaveBeenCalledTimes(10);

    fireEvent.change(nickname, { target: { value: "" } });

    expect(nickname.value).toBe("");

    expect(screen.queryByText("maze-generate-nickname-invalid")).not.toBeInTheDocument();

    expect(screen.getByText("field-required")).toBeInTheDocument();

    expect(onStateChange).toHaveBeenCalledTimes(9);
    expect(onStateChange).toHaveBeenCalledWith(0, { mazeId: "1", nickname: "" })

    expect(onErrorChange).toHaveBeenCalledTimes(11);

    fireEvent.change(nickname, { target: { value: "nickname" } });

    expect(nickname.value).toBe("nickname");

    expect(screen.queryByText("field-required")).not.toBeInTheDocument();

    expect(onStateChange).toHaveBeenCalledTimes(10);
    expect(onStateChange).toHaveBeenCalledWith(0, { mazeId: "1", nickname: "nickname" })

    expect(onErrorChange).toHaveBeenCalledTimes(12);

    fireEvent.change(select, { target: { value: "solutionId" } });

    expect(select.value).toBe("solutionId");

    expect(mazeId).not.toBeInTheDocument();
    expect(nickname).not.toBeInTheDocument();

    expect(onStateChange).toHaveBeenCalledTimes(11);
    expect(onStateChange).toHaveBeenCalledWith(0, { solutionId: "" })

    expect(onErrorChange).toHaveBeenCalledTimes(14);

    expect(screen.getByRole("textbox", { name: "maze-generate-solution-id *" }).value).toBe("");

    fireEvent.change(select, { target: { value: "mazeId" } });

    expect(select.value).toBe("mazeId");

    expect(screen.getByRole("textbox", { name: "maze-generate-maze-id *" }).value).toBe("");

    expect(screen.getByRole("textbox", { name: "maze-generate-nickname *" }).value).toBe("");

    expect(onStateChange).toHaveBeenCalledTimes(12);
    expect(onStateChange).toHaveBeenCalledWith(0, { mazeId: "", nickname: "" })

    expect(onErrorChange).toHaveBeenCalledTimes(16);
  });
});
