/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor, act, within } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import axios from "axios";
import { BACKEND_URL } from "../utils/constants";
import TokenContext from "../utils/TokenContext";
import GenerateMaze from "./GenerateMaze";

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

//Mock the timers
jest.useFakeTimers();

//Mock SolutionIDForm
jest.mock("../components/SolutionIDForm", () => ({onErrorChange, onStateChange, index}) => <button data-testid="solution-id" type="button" onClick={() => onStateChange(1, { nickname: "noone" })}>{index}</button>);;

//Mock MazeGrid
jest.mock("../components/MazeGrid", () => ({data, disabled, save, saveError, setSaveError}) => <button data-testid="maze-grid" type="button" onClick={() => save()} disabled={disabled}>{data.id}</button>);;

//Mock MazeModal
jest.mock("../components/MazeModal", () => ({visible, setVisible, data, locations, changed}) => <div data-testid="maze-modal" />);;

//Mock axios to control API calls
jest.mock("axios");


//The test suite
describe("GenerateMaze", () => {
  it("renders and displays error when value is invalid", () => {
    //Render the component
    render(
      <TokenContext.Provider value={{ token: "" }}>
        <GenerateMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByText("maze-generate-title")).toBeInTheDocument();
    expect(screen.getByText("maze-generate-info")).toBeInTheDocument();
    expect(screen.getByText("maze-generate-info-not-logged-in")).toBeInTheDocument();
    expect(screen.getByText("maze-generate-not-yet-generated-info")).toBeInTheDocument();

    //Get the elements
    const inputWidth = screen.getByRole("combobox", { name: "maze-width *" });
    const inputHeight = screen.getByRole("combobox", { name: "maze-height *" });
    const inputOperation = screen.getByRole("combobox", { name: "maze-operation-type *" });
    const inputRange = screen.getByRole("combobox", { name: "maze-generate-range *" });
    const showPreviousButton = screen.getByRole("button", { name: "▶ maze-generate-previous-mazes-options" });
    const showAdvancedButton = screen.getByRole("button", { name: "▶ maze-generate-advanced-options" });
    const button = screen.getByRole("button", { name: "maze-generate-path-generate" });

    within(inputWidth).getAllByRole("option").forEach((option, index) => {
      expect(option.value).toBe((11 + index * 2).toString())
    });

    fireEvent.change(inputWidth, { target: { value: "11" } });

    expect(inputWidth.value).toBe("11");

    expect(screen.queryByText("maze-generate-width-error")).not.toBeInTheDocument();

    within(inputHeight).getAllByRole("option").forEach((option, index) => {
      expect(option.value).toBe((11 + index * 2).toString())
    });

    fireEvent.change(inputHeight, { target: { value: "11" } });

    expect(inputHeight.value).toBe("11");

    expect(screen.queryByText("maze-generate-height-error")).not.toBeInTheDocument();

    const operations = ["ADDITION", "SUBTRACTION", "BOTH_ADDITION_AND_SUBTRACTION", "MULTIPLICATION", "DIVISION", "BOTH_MULTIPLICATION_AND_DIVISION"];
    within(inputOperation).getAllByRole("option").forEach((option, index) => {
      expect(option.value).toBe(operations[index]);
    });

    fireEvent.change(inputOperation, { target: { value: "MULTIPLICATION" } });

    expect(inputOperation.value).toBe("MULTIPLICATION");

    expect(screen.queryByText("maze-operation-error")).not.toBeInTheDocument();

    const additionRanges = ["1-10", "1-20", "1-100"]
    const multiplicationRanges = ["1-10", "1-20", "11-20"];
    within(inputRange).getAllByRole("option").forEach((option, index) => {
      expect(option.value).toBe(multiplicationRanges[index]);
    });

    fireEvent.change(inputRange, { target: { value: "11-20" } });

    expect(inputRange.value).toBe("11-20");

    expect(screen.queryByText("maze-range-error")).not.toBeInTheDocument();

    fireEvent.change(inputOperation, { target: { value: "ADDITION" } });

    expect(inputOperation.value).toBe("ADDITION");

    expect(inputRange.value).toBe("1-10");

    within(inputRange).getAllByRole("option").forEach((option, index) => {
      expect(option.value).toBe(additionRanges[index]);
    });

    fireEvent.change(inputRange, { target: { value: "1-100" } });

    expect(inputRange.value).toBe("1-100");

    fireEvent.change(inputOperation, { target: { value: "MULTIPLICATION" } });

    expect(inputOperation.value).toBe("MULTIPLICATION");

    expect(inputRange.value).toBe("1-10");

    fireEvent.change(inputOperation, { target: { value: "DIVISION" } });

    fireEvent.click(showPreviousButton);

    expect(screen.getByText("maze-generate-generated-from-help")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    fireEvent.click(showAdvancedButton);

    const inputPathTypeEven = screen.getByRole("radio", { name: "maze-generate-path-type-even" });
    const inputPathTypeOdd = screen.getByRole("radio", { name: "maze-generate-path-type-odd" });

    expect(inputPathTypeEven.checked).toBe(true);

    fireEvent.click(inputPathTypeOdd);

    expect(inputPathTypeOdd.checked).toBe(true);

    expect(inputPathTypeEven.checked).toBe(false);

    const inputMinLength = screen.getByRole("textbox", { name: "maze-generate-path-min-length" });
    const inputMaxLength = screen.getByRole("textbox", { name: "maze-generate-path-max-length" });

    fireEvent.change(inputMinLength, { target: { value: "1" } });

    expect(inputMinLength.value).toBe("1");

    expect(screen.getByText("maze-min-length-error")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputMinLength, { target: { value: "500" } });

    expect(inputMinLength.value).toBe("500");

    expect(screen.getByText("maze-min-length-error")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputMinLength, { target: { value: "15" } });

    expect(inputMinLength.value).toBe("15");

    expect(screen.queryByText("maze-min-length-error")).not.toBeInTheDocument();

    fireEvent.change(inputMaxLength, { target: { value: "1" } });

    expect(inputMaxLength.value).toBe("1");

    expect(screen.getByText("maze-min-length-error")).toBeInTheDocument();
    expect(screen.getByText("maze-max-length-error")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputMaxLength, { target: { value: "500" } });

    expect(inputMaxLength.value).toBe("500");

    expect(screen.queryByText("maze-min-length-error")).not.toBeInTheDocument();
    expect(screen.getByText("maze-max-length-error")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputMaxLength, { target: { value: "14" } });

    expect(inputMaxLength.value).toBe("14");

    expect(screen.getByText("maze-min-length-error")).toBeInTheDocument();
    expect(screen.getByText("maze-max-length-error")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputMaxLength, { target: { value: "15" } });

    expect(inputMaxLength.value).toBe("15");

    expect(screen.queryByText("maze-min-length-error")).not.toBeInTheDocument();
    expect(screen.queryByText("maze-max-length-error")).not.toBeInTheDocument();

    fireEvent.change(inputMinLength, { target: { value: "16" } });

    expect(inputMinLength.value).toBe("16");

    expect(screen.getByText("maze-min-length-error")).toBeInTheDocument();
    expect(screen.getByText("maze-max-length-error")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputMinLength, { target: { value: "" } });

    expect(screen.queryByText("maze-min-length-error")).not.toBeInTheDocument();
    expect(screen.queryByText("maze-max-length-error")).not.toBeInTheDocument();

    expect(button).toBeEnabled();
  });


  it("renders and submits the form when the form is valid", async () => {
    //Mock the API call
    axios.post.mockResolvedValue({ data: { token: "token", maze: { id: 5 } } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <GenerateMaze />
      </TokenContext.Provider>
    );

    fireEvent.click(screen.getByRole("button", { name: "▶ maze-generate-previous-mazes-options" }));
    fireEvent.click(screen.getByRole("button", { name: "1" }));

    fireEvent.click(screen.getByRole("button", { name: "▶ maze-generate-advanced-options" }));
    fireEvent.change(screen.getByRole("textbox", { name: "maze-generate-path-min-length" }), { target: { value: "15" } });
    fireEvent.change(screen.getByRole("textbox", { name: "maze-generate-path-max-length" }), { target: { value: "20" } });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "maze-generate-path-generate" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/generate`,
        {
          width: 11,
          height: 11,
          operation: "ADDITION",
          numbersRangeStart: 1,
          numbersRangeEnd: 10,
          pathTypeEven: true,
          discardedMazes: [],
          solution1: { nickname: "noone" },
          solution2: {},
          solution3: {},
          token: "",
          minLength: 15,
          maxLength: 20
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

    expect(screen.getByTestId("maze-grid")).toBeInTheDocument();
    expect(screen.getByTestId("maze-grid").textContent).toBe("5");

    fireEvent.change(screen.getByRole("textbox", { name: "maze-generate-path-min-length" }), { target: { value: "" } });
    fireEvent.change(screen.getByRole("textbox", { name: "maze-generate-path-max-length" }), { target: { value: "" } });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "maze-generate-path-regenerate" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/generate`,
        {
          width: 11,
          height: 11,
          operation: "ADDITION",
          numbersRangeStart: 1,
          numbersRangeEnd: 10,
          pathTypeEven: true,
          discardedMazes: [5],
          solution1: { nickname: "noone" },
          solution2: {},
          solution3: {},
          token: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    expect(screen.getByTestId("maze-grid")).toBeDisabled();

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.getByTestId("maze-grid")).toBeEnabled();
  });


  it("renders and submits the form when the form is valid but receives an error", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <GenerateMaze />
      </TokenContext.Provider>
    );

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "maze-generate-path-generate" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/generate`,
        {
          width: 11,
          height: 11,
          operation: "ADDITION",
          numbersRangeStart: 1,
          numbersRangeEnd: 10,
          pathTypeEven: true,
          discardedMazes: [],
          solution1: {},
          solution2: {},
          solution3: {},
          token: "",
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


  it("renders and submits the form when the form is valid but receives InvalidMazeDimensionException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "InvalidMazeDimensionException" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <GenerateMaze />
      </TokenContext.Provider>
    );

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "maze-generate-path-generate" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/generate`,
        {
          width: 11,
          height: 11,
          operation: "ADDITION",
          numbersRangeStart: 1,
          numbersRangeEnd: 10,
          pathTypeEven: true,
          discardedMazes: [],
          solution1: {},
          solution2: {},
          solution3: {},
          token: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-invalid-maze-dimension")).toBeInTheDocument();
    });
  });


  it("renders and submits the form when the form is valid but receives InvalidPathRangeException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "InvalidPathRangeException" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <GenerateMaze />
      </TokenContext.Provider>
    );

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "maze-generate-path-generate" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/generate`,
        {
          width: 11,
          height: 11,
          operation: "ADDITION",
          numbersRangeStart: 1,
          numbersRangeEnd: 10,
          pathTypeEven: true,
          discardedMazes: [],
          solution1: {},
          solution2: {},
          solution3: {},
          token: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-invalid-path-range")).toBeInTheDocument();
    });
  });


  it("renders and submits the form when the form is valid but receives InvalidNumbersRangeException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "InvalidNumbersRangeException" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <GenerateMaze />
      </TokenContext.Provider>
    );

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "maze-generate-path-generate" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/generate`,
        {
          width: 11,
          height: 11,
          operation: "ADDITION",
          numbersRangeStart: 1,
          numbersRangeEnd: 10,
          pathTypeEven: true,
          discardedMazes: [],
          solution1: {},
          solution2: {},
          solution3: {},
          token: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-invalid-numbers-range")).toBeInTheDocument();
    });
  });


  it("renders and submits the form when the form is valid but receives InvalidSolutionDataException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "InvalidSolutionDataException" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <GenerateMaze />
      </TokenContext.Provider>
    );

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "maze-generate-path-generate" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/generate`,
        {
          width: 11,
          height: 11,
          operation: "ADDITION",
          numbersRangeStart: 1,
          numbersRangeEnd: 10,
          pathTypeEven: true,
          discardedMazes: [],
          solution1: {},
          solution2: {},
          solution3: {},
          token: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-invalid-solution-data")).toBeInTheDocument();
    });
  });


  it("renders and submits the form when the form is valid but receives NotFoundSolutionDataException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "NotFoundSolutionDataException" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <GenerateMaze />
      </TokenContext.Provider>
    );

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "maze-generate-path-generate" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/generate`,
        {
          width: 11,
          height: 11,
          operation: "ADDITION",
          numbersRangeStart: 1,
          numbersRangeEnd: 10,
          pathTypeEven: true,
          discardedMazes: [],
          solution1: {},
          solution2: {},
          solution3: {},
          token: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-not-found-solution-data")).toBeInTheDocument();
    });
  });


  it("renders and submits the form when the form is valid but receives NotCompatibleSolutionDataException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "NotCompatibleSolutionDataException" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <GenerateMaze />
      </TokenContext.Provider>
    );

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "maze-generate-path-generate" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/generate`,
        {
          width: 11,
          height: 11,
          operation: "ADDITION",
          numbersRangeStart: 1,
          numbersRangeEnd: 10,
          pathTypeEven: true,
          discardedMazes: [],
          solution1: {},
          solution2: {},
          solution3: {},
          token: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-not-compatible-solution-data")).toBeInTheDocument();
    });
  });


  it("renders and submits the form when the form is valid but receives MultipleSolutionDataException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "MultipleSolutionDataException" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <GenerateMaze />
      </TokenContext.Provider>
    );

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "maze-generate-path-generate" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/generate`,
        {
          width: 11,
          height: 11,
          operation: "ADDITION",
          numbersRangeStart: 1,
          numbersRangeEnd: 10,
          pathTypeEven: true,
          discardedMazes: [],
          solution1: {},
          solution2: {},
          solution3: {},
          token: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-multiple-solution-data")).toBeInTheDocument();
    });
  });


  it("renders and submits the form when the form is valid but receives unknown error", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <GenerateMaze />
      </TokenContext.Provider>
    );

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "maze-generate-path-generate" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/generate`,
        {
          width: 11,
          height: 11,
          operation: "ADDITION",
          numbersRangeStart: 1,
          numbersRangeEnd: 10,
          pathTypeEven: true,
          discardedMazes: [],
          solution1: {},
          solution2: {},
          solution3: {},
          token: "",
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


  it("renders and submits the form when the form is valid and saves the maze", async () => {
    //Mock the API call
    axios.post.mockResolvedValue({ data: { token: "token", maze: { id: 5 } } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <GenerateMaze />
      </TokenContext.Provider>
    );

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "maze-generate-path-generate" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/generate`,
        {
          width: 11,
          height: 11,
          operation: "ADDITION",
          numbersRangeStart: 1,
          numbersRangeEnd: 10,
          pathTypeEven: true,
          discardedMazes: [],
          solution1: {},
          solution2: {},
          solution3: {},
          token: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    expect(screen.getByTestId("maze-grid")).toBeDisabled();

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.getByTestId("maze-grid")).toBeEnabled();

    //Mock the API call
    axios.post.mockResolvedValue({ data: { token: "token", maze: { id: 5 }, locations: ["/"] } });

    await act(async () => {
      fireEvent.click(screen.getByTestId("maze-grid"));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/save`,
        {
          mazeId: 5,
          token: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });
  });


  it("renders and submits the form when the form is valid and saves the maze but receives an error", async () => {
    //Mock the API call
    axios.post.mockResolvedValue({ data: { token: "token", maze: { id: 5 } } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <GenerateMaze />
      </TokenContext.Provider>
    );

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: "maze-generate-path-generate" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/generate`,
        {
          width: 11,
          height: 11,
          operation: "ADDITION",
          numbersRangeStart: 1,
          numbersRangeEnd: 10,
          pathTypeEven: true,
          discardedMazes: [],
          solution1: {},
          solution2: {},
          solution3: {},
          token: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    expect(screen.getByTestId("maze-grid")).toBeDisabled();

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.getByTestId("maze-grid")).toBeEnabled();

    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "" } });

    await act(async () => {
      fireEvent.click(screen.getByTestId("maze-grid"));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/save`,
        {
          mazeId: 5,
          token: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });
  });
});
