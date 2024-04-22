/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../utils/constants";
import TokenContext from "../utils/TokenContext";
import SolveMaze from "./SolveMaze";

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

// Mock the useSearchParams hook
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useSearchParams: jest.fn(),
}));

//Mock the timers
jest.useFakeTimers();

//Mock PDFButtons
jest.mock("../components/PDFButtons", () => () => <div data-testid="pdf-buttons" />);

//Mock MazeOnlineSolve
jest.mock("../components/MazeOnlineSolve", () => ({ data, initialNickname, initialMaze, initialPath, handleSubmit, submitError }) => <button data-testid="maze-online-solve" onClick={() => {
  handleSubmit({ mazeId: 5, data: [], path: [{x: 1, y:1}], nickname: initialNickname });
}}>{submitError}</button>);

//Mock CheckResults
jest.mock("../components/CheckResults", () => () => <div data-testid="check-results" />);

//Mock axios to control API calls
jest.mock("axios");


//The test suite
describe("SolveMaze", () => {
  it("renders and displays error when value is invalid for maze ID", () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams()]);

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "" }}>
        <SolveMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByText("maze-solve-title")).toBeInTheDocument();
    expect(screen.getByText("maze-solve-info")).toBeInTheDocument();
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    //Get the elements
    const inputMazeId = screen.getByRole("textbox", { name: "maze-check-id-label *" });
    const button = screen.getByRole("button", { name: "maze-solve-submit-id" });

    fireEvent.change(inputMazeId, { target: { value: "invalid" } });

    expect(inputMazeId.value).toBe("invalid");

    expect(screen.getByText("error-invalid-maze-id")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputMazeId, { target: { value: "" } });

    expect(inputMazeId.value).toBe("");

    expect(screen.queryByText("error-invalid-maze-id")).not.toBeInTheDocument();

    expect(screen.getByText("field-required")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputMazeId, { target: { value: "123" } });

    expect(inputMazeId.value).toBe("123");

    expect(screen.queryByText("error-invalid-maze-id")).not.toBeInTheDocument();

    expect(screen.queryByText("field-required")).not.toBeInTheDocument();

    expect(button).toBeEnabled();
  });


  it("renders and submits the form when the form is valid for maze ID", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams()]);

    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", maze: { id: 5 } } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <SolveMaze />
      </TokenContext.Provider>
    );

    fireEvent.change(screen.getByRole("textbox", { name: "maze-check-id-label *" }), { target: { value: "123" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "maze-solve-submit-id" }));
    });

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/open?mazeId=123&token=`);
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    expect(screen.getByText("maze-check-id-label: 5")).toBeInTheDocument();
    expect(screen.getByText("maze-size")).toBeInTheDocument();
    expect(screen.getByText("maze-length-of-the-path")).toBeInTheDocument();
    expect(screen.getByText("maze-generate-path-type: maze-generate-path-type-odd")).toBeInTheDocument();
    expect(screen.getByText("maze-description: -")).toBeInTheDocument();
    expect(screen.getByText("maze-generated-by")).toBeInTheDocument();

    expect(screen.getByTestId("pdf-buttons")).toBeInTheDocument();

    expect(screen.getByText("or")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "maze-solve-online" })).toBeInTheDocument();
  });


  it("submits the form when the ID is in the URL", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams([["id", "123"]])]);

    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", maze: { id: 5, pathTypeEven: true, description: "hi" } } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <SolveMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/open?mazeId=123&token=`);
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    expect(screen.getByText("maze-check-id-label: 5")).toBeInTheDocument();
    expect(screen.getByText("maze-size")).toBeInTheDocument();
    expect(screen.getByText("maze-length-of-the-path")).toBeInTheDocument();
    expect(screen.getByText("maze-generate-path-type: maze-generate-path-type-even")).toBeInTheDocument();
    expect(screen.getByText("maze-description: hi")).toBeInTheDocument();
    expect(screen.getByText("maze-generated-by")).toBeInTheDocument();

    expect(screen.getByTestId("pdf-buttons")).toBeInTheDocument();

    expect(screen.getByText("or")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "maze-solve-online" })).toBeInTheDocument();
  });


  it("submits the form when the ID is in the URL but receives an error", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams([["id", "123"]])]);

    //Mock the API call
    axios.get.mockRejectedValue({});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <SolveMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/open?mazeId=123&token=`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("error-unknown")).toBeInTheDocument();
    });
  });


  it("submits the form when the ID is in the URL but receives an InvalidMazeIdException", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams([["id", "123"]])]);

    //Mock the API call
    axios.get.mockRejectedValue({ response: { data: "InvalidMazeIdException" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <SolveMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/open?mazeId=123&token=`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("error-invalid-maze-id-or-private")).toBeInTheDocument();
    });
  });


  it("submits the form when the ID is in the URL but receives an unknown error", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams([["id", "123"]])]);

    //Mock the API call
    axios.get.mockRejectedValue({ response: { data: "" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: (a) => {} }}>
        <SolveMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/open?mazeId=123&token=`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("error-unknown-form")).toBeInTheDocument();
    });
  });


  it("submits the form and returns to enter the passcode when the ID is in the URL", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams([["id", "123"]])]);

    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", maze: { passcode: false } } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <SolveMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/open?mazeId=123&token=`);
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    //Get the elements
    const inputPasscode = screen.getByRole("textbox", { name: "maze-passcode *" });
    const button = screen.getByRole("button", { name: "maze-solve-submit-passcode" });

    fireEvent.change(inputPasscode, { target: { value: "123" } });

    expect(inputPasscode.value).toBe("123");

    expect(screen.getByText("error-invalid-passcode")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputPasscode, { target: { value: "" } });

    expect(inputPasscode.value).toBe("");

    expect(screen.queryByText("error-invalid-passcode")).not.toBeInTheDocument();

    expect(screen.getByText("field-required")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputPasscode, { target: { value: "12345678" } });

    expect(inputPasscode.value).toBe("12345678");

    expect(screen.queryByText("error-invalid-passcode")).not.toBeInTheDocument();

    expect(screen.queryByText("field-required")).not.toBeInTheDocument();

    expect(button).toBeEnabled();
  });


  it("submits the passcode form when the ID is in the URL", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams([["id", "123"]])]);

    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", maze: { passcode: false } } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <SolveMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/open?mazeId=123&token=`);
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: "maze-passcode *" }), { target: { value: "12345678" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "maze-solve-submit-passcode" }));
    });

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/open?mazeId=123&token=&passcode=12345678`);
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    expect(screen.getByText("error-invalid-passcode-solve")).toBeInTheDocument();
  });


  it("submits the passcode form when the ID is in the URL and everything is fine", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams([["id", "123"]])]);

    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", maze: { passcode: false } } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <SolveMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/open?mazeId=123&token=`);
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", maze: { id: 5 } } });

    fireEvent.change(screen.getByRole("textbox", { name: "maze-passcode *" }), { target: { value: "12345678" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "maze-solve-submit-passcode" }));
    });

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/open?mazeId=123&token=&passcode=12345678`);
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    expect(screen.getByTestId("pdf-buttons")).toBeInTheDocument();
  });


  it("checks the maze when the ID is in the URL", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams([["id", "123"]])]);

    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", maze: { id: 5 } } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <SolveMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/open?mazeId=123&token=`);
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    //Mock the API call
    axios.post.mockResolvedValue({ data: { token: "newToken2", checkedMaze: {} } });

    fireEvent.click(screen.getByRole("button", { name: "maze-solve-online" }));

    await act(async () => {
      fireEvent.click(screen.getByTestId("maze-online-solve"));
    });

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/check`,
        { mazeId: 5, data: [], path: [{x: 1, y:1}], nickname: "", token: "" },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    })

    expect(setToken).toHaveBeenCalledWith("newToken2");

    expect(screen.getByTestId("check-results")).toBeInTheDocument();
    expect(screen.queryByTestId("token-refresher")).not.toBeInTheDocument();
  });


  it("checks the maze when the ID is in the URL and receives an error", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams([["id", "123"]])]);

    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", maze: { id: 5 } } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <SolveMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/open?mazeId=123&token=`);
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    //Mock the API call
    axios.post.mockRejectedValue({});

    fireEvent.click(screen.getByRole("button", { name: "maze-solve-online" }));

    await act(async () => {
      fireEvent.click(screen.getByTestId("maze-online-solve"));
    });

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/check`,
        { mazeId: 5, data: [], path: [{x: 1, y:1}], nickname: "", token: "" },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    })

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    expect(screen.getByText("error-unknown")).toBeInTheDocument();
  });


  it("checks the maze when the ID is in the URL and receives a NicknameInvalidFormatException", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams([["id", "123"]])]);

    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", maze: { id: 5 } } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <SolveMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/open?mazeId=123&token=`);
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "NicknameInvalidFormatException" } });

    fireEvent.click(screen.getByRole("button", { name: "maze-solve-online" }));

    await act(async () => {
      fireEvent.click(screen.getByTestId("maze-online-solve"));
    });

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/check`,
        { mazeId: 5, data: [], path: [{x: 1, y:1}], nickname: "", token: "" },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    })

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    expect(screen.getByText("error-nickname-invalid-format")).toBeInTheDocument();
  });


  it("checks the maze when the ID is in the URL and receives a NicknameNotUniqueException", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams([["id", "123"]])]);

    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", maze: { id: 5 } } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <SolveMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/open?mazeId=123&token=`);
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "NicknameNotUniqueException" } });

    fireEvent.click(screen.getByRole("button", { name: "maze-solve-online" }));

    await act(async () => {
      fireEvent.click(screen.getByTestId("maze-online-solve"));
    });

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/check`,
        { mazeId: 5, data: [], path: [{x: 1, y:1}], nickname: "", token: "" },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    })

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    expect(screen.getByText("error-nickname-not-unique")).toBeInTheDocument();
  });


  it("checks the maze when the ID is in the URL and receives a InvalidMazeIdException", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams([["id", "123"]])]);

    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", maze: { id: 5 } } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <SolveMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/open?mazeId=123&token=`);
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "InvalidMazeIdException" } });

    fireEvent.click(screen.getByRole("button", { name: "maze-solve-online" }));

    await act(async () => {
      fireEvent.click(screen.getByTestId("maze-online-solve"));
    });

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/check`,
        { mazeId: 5, data: [], path: [{x: 1, y:1}], nickname: "", token: "" },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    })

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    expect(screen.getByText("error-invalid-maze-id")).toBeInTheDocument();
  });


  it("checks the maze when the ID is in the URL and receives a InvalidPathException", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams([["id", "123"]])]);

    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", maze: { id: 5 } } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <SolveMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/open?mazeId=123&token=`);
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "InvalidPathException" } });

    fireEvent.click(screen.getByRole("button", { name: "maze-solve-online" }));

    await act(async () => {
      fireEvent.click(screen.getByTestId("maze-online-solve"));
    });

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/check`,
        { mazeId: 5, data: [], path: [{x: 1, y:1}], nickname: "", token: "" },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    })

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    expect(screen.getByText("error-invalid-path")).toBeInTheDocument();
  });


  it("checks the maze when the ID is in the URL and receives a InvalidMazeDimensionException", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams([["id", "123"]])]);

    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", maze: { id: 5 } } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <SolveMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/open?mazeId=123&token=`);
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "InvalidMazeDimensionException" } });

    fireEvent.click(screen.getByRole("button", { name: "maze-solve-online" }));

    await act(async () => {
      fireEvent.click(screen.getByTestId("maze-online-solve"));
    });

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/check`,
        { mazeId: 5, data: [], path: [{x: 1, y:1}], nickname: "", token: "" },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    })

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    expect(screen.getByText("error-invalid-maze-dimension")).toBeInTheDocument();
  });


  it("checks the maze when the ID is in the URL and receives a NotNumberInMazeException", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams([["id", "123"]])]);

    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", maze: { id: 5 } } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <SolveMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/open?mazeId=123&token=`);
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "NotNumberInMazeException" } });

    fireEvent.click(screen.getByRole("button", { name: "maze-solve-online" }));

    await act(async () => {
      fireEvent.click(screen.getByTestId("maze-online-solve"));
    });

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/check`,
        { mazeId: 5, data: [], path: [{x: 1, y:1}], nickname: "", token: "" },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    })

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    expect(screen.getByText("error-not-number-in-maze")).toBeInTheDocument();
  });


  it("check the maze when the ID is in the URL and receives an unknown error", async () => {
    //Mock useSearchParams
    useSearchParams.mockReturnValue([new URLSearchParams([["id", "123"]])]);

    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", maze: { id: 5 } } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <SolveMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/open?mazeId=123&token=`);
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "" } });

    fireEvent.click(screen.getByRole("button", { name: "maze-solve-online" }));

    await act(async () => {
      fireEvent.click(screen.getByTestId("maze-online-solve"));
    });

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/check`,
        { mazeId: 5, data: [], path: [{x: 1, y:1}], nickname: "", token: "" },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    })

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    expect(screen.getByText("error-unknown-form")).toBeInTheDocument();
  });
});
