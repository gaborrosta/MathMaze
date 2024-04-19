/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import axios from "axios";
import { BACKEND_URL } from "../utils/constants";
import TokenContext from "../utils/TokenContext";
import MazeModal from "./MazeModal";

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

//Mock PDFButtons
jest.mock("../components/PDFButtons", () => () => <div data-testid="pdf-buttons" />);

//Mock LocationsList
jest.mock("../components/LocationsList", () => ({locations, selectedLocation, onLocationChange}) => <button data-testid="locations-list" type="button" onClick={() => onLocationChange("/sth/")}>{selectedLocation}</button>);

//Mock the Link from react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Link: ({ children }) => children
}));

//Mock axios to control API calls
jest.mock("axios");


//The test suite
describe("MazeModal", () => {
  it("throws an error if visible is not provided", () => {
    expect(() => render(<MazeModal />)).toThrow("visible is required.");
  });


  it("throws an error if visible is not a boolean", () => {
    expect(() => render(<MazeModal visible="test" />)).toThrow("visible must be a boolean.");
  });


  it("throws an error if setVisible is not provided", () => {
    expect(() => render(<MazeModal visible={true} />)).toThrow("setVisible is required.");
  });


  it("throws an error if setVisible is not a function", () => {
    expect(() => render(<MazeModal visible={true} setVisible="test" />)).toThrow("setVisible must be a function.");
  });


  it("throws an error if setVisible does not have 1 parameter", () => {
    expect(() => render(<MazeModal visible={true} setVisible={() => {}} />)).toThrow("setVisible must have 1 parameter.");
  });


  it("throws an error if not authenticated and mazeData is missing", () => {
    expect(() => render(<TokenContext.Provider value={{ token: "" }}><MazeModal visible={true} setVisible={(a) => {}} /></TokenContext.Provider>)).toThrow("mazeData is required.");
  });


  it("throws an error if not authenticated and mazeData is not an object", () => {
    expect(() => render(<TokenContext.Provider value={{ token: "" }}><MazeModal visible={true} setVisible={(a) => {}} data="test" /></TokenContext.Provider>)).toThrow("mazeData must be an object.");
  });


  it("throws an error if not authenticated and mazeData is missing an id", () => {
    expect(() => render(<TokenContext.Provider value={{ token: "" }}><MazeModal visible={true} setVisible={(a) => {}} data={{}} /></TokenContext.Provider>)).toThrow("mazeData.id is required.");
  });


  it("throws an error if not authenticated and mazeData.id is not a number", () => {
    expect(() => render(<TokenContext.Provider value={{ token: "" }}><MazeModal visible={true} setVisible={(a) => {}} data={{ id: "test" }} /></TokenContext.Provider>)).toThrow("mazeData.id must be a number.");
  });


  it("throws an error if not authenticated and mazeData is missing a description", () => {
    expect(() => render(<TokenContext.Provider value={{ token: "" }}><MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1 }} /></TokenContext.Provider>)).toThrow("mazeData.description is required.");
  });


  it("throws an error if not authenticated and mazeData.description is not a string", () => {
    expect(() => render(<TokenContext.Provider value={{ token: "" }}><MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: 1 }} /></TokenContext.Provider>)).toThrow("mazeData.description must be a string.");
  });


  it("throws an error if not authenticated and mazeData is missing a location", () => {
    expect(() => render(<TokenContext.Provider value={{ token: "" }}><MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test" }} /></TokenContext.Provider>)).toThrow("mazeData.location is required.");
  });


  it("throws an error if not authenticated and mazeData.location is not a string", () => {
    expect(() => render(<TokenContext.Provider value={{ token: "" }}><MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: 1 }} /></TokenContext.Provider>)).toThrow("mazeData.location must be a string.");
  });


  it("throws an error if not authenticated and mazeData is missing an isPrivate", () => {
    expect(() => render(<TokenContext.Provider value={{ token: "" }}><MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", }} /></TokenContext.Provider>)).toThrow("mazeData.isPrivate is required.");
  });


  it("throws an error if not authenticated and mazeData.isPrivate is not a boolean", () => {
    expect(() => render(<TokenContext.Provider value={{ token: "" }}><MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", isPrivate: "test" }} /></TokenContext.Provider>)).toThrow("mazeData.isPrivate must be a boolean.");
  });


  it("throws an error if not authenticated and mazeData is missing a passcode", () => {
    expect(() => render(<TokenContext.Provider value={{ token: "" }}><MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", isPrivate: true }} /></TokenContext.Provider>)).toThrow("mazeData.passcode is required.");
  });


  it("throws an error if not authenticated and mazeData.passcode is not a string", () => {
    expect(() => render(<TokenContext.Provider value={{ token: "" }}><MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", isPrivate: true, passcode: 1 }} /></TokenContext.Provider>)).toThrow("mazeData.passcode must be a string.");
  });


  it("renders when not authenticated", () => {
    //Render the component
    render(
      <TokenContext.Provider value={{ token: "" }}>
        <MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", isPrivate: true, passcode: "" }} />
      </TokenContext.Provider>
    );

    expect(screen.getByText("maze-title #1")).toBeInTheDocument();
    expect(screen.queryByText(/solve-maze\?id=1/i)).toBeInTheDocument();
  });


  it("closes when clicked and not authenticated", () => {
    //Mock the setVisible function
    const setVisible = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "" }}>
        <MazeModal visible={true} setVisible={setVisible} data={{ id: 1, description: "test", location: "/", isPrivate: true, passcode: "" }} />
      </TokenContext.Provider>
    );

    const closeButton = screen.getByRole("button", { name: "Close" });

    fireEvent.click(closeButton);

    expect(setVisible).toHaveBeenCalledWith(false);
  });


  it("throws an error if authenticated and locations is missing", () => {
    expect(() => render(<TokenContext.Provider value={{ token: "token" }}><MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", isPrivate: true, passcode: "" }} /></TokenContext.Provider>)).toThrow("locations is required.");
  });


  it("throws an error if authenticated and locations is not an array", () => {
    expect(() => render(<TokenContext.Provider value={{ token: "token" }}><MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", isPrivate: true, passcode: "" }} locations={"test"} /></TokenContext.Provider>)).toThrow("locations must be an array.");
  });


  it("throws an error if authenticated and locations is not an array of strings", () => {
    expect(() => render(<TokenContext.Provider value={{ token: "token" }}><MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", isPrivate: true, passcode: "" }} locations={[1]} /></TokenContext.Provider>)).toThrow("locations must be an array of strings.");
  });


  it("throws an error if authenticated and locations is not an array of strings starting and ending with a slash", () => {
    expect(() => render(<TokenContext.Provider value={{ token: "token" }}><MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", isPrivate: true, passcode: "" }} locations={[""]} /></TokenContext.Provider>)).toThrow("locations must be an array of strings starting and ending with a slash.");
  })


  it("throws an error if authenticated and changed is not a functions", () => {
    expect(() => render(<TokenContext.Provider value={{ token: "token" }}><MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", isPrivate: true, passcode: "" }} locations={["/"]} changed="test" /></TokenContext.Provider>)).toThrow("changed must be a function.");
  });


  it("throws an error if authenticated and changed has less than 2 parameters", () => {
    expect(() => render(<TokenContext.Provider value={{ token: "token" }}><MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", isPrivate: true, passcode: "" }} locations={["/"]} changed={(a) => {}} /></TokenContext.Provider>)).toThrow("changed must have 2 parameters.");
  });


  it("renders when authenticated", () => {
    //Render the component
    render(
      <TokenContext.Provider value={{ token: "token" }}>
        <MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", isPrivate: true, passcode: "" }} locations={["/"]} />
      </TokenContext.Provider>
    );

    expect(screen.getByText("maze-title #1")).toBeInTheDocument();
    expect(screen.queryByText(/solve-maze\?id=1/i)).toBeInTheDocument();
    expect(screen.queryByText(/maze-private-info/i)).toBeInTheDocument();
  });


  it("renders when authenticated with changed and public", () => {
    //Render the component
    render(
      <TokenContext.Provider value={{ token: "token" }}>
        <MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", isPrivate: false, passcode: "" }} locations={["/"]} changed={(a, b) => {}} />
      </TokenContext.Provider>
    );

    expect(screen.getByText("maze-title #1")).toBeInTheDocument();
    expect(screen.queryByText(/solve-maze\?id=1/i)).toBeInTheDocument();
    expect(screen.queryByText(/maze-public-info/i)).toBeInTheDocument();
    expect(screen.queryByText(/maze-public-no-passcode/i)).toBeInTheDocument();
  });


  it("renders when authenticated with changed and public with passcode", () => {
    //Render the component
    render(
      <TokenContext.Provider value={{ token: "token" }}>
        <MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", isPrivate: false, passcode: "123" }} locations={["/"]} changed={(a, b) => {}} />
      </TokenContext.Provider>
    );

    expect(screen.getByText("maze-title #1")).toBeInTheDocument();
    expect(screen.queryByText(/solve-maze\?id=1/i)).toBeInTheDocument();
    expect(screen.queryByText(/maze-public-info/i)).toBeInTheDocument();
    expect(screen.queryByText(/maze-public-passcode/i)).toBeInTheDocument();
  });


  it("renders when authenticated and displays error when value is invalid", () => {
    //Render the component
    render(
      <TokenContext.Provider value={{ token: "token" }}>
        <MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", isPrivate: true, passcode: "" }} locations={["/"]} />
      </TokenContext.Provider>
    );

    //Get the elements
    const descriptionInput = screen.getByRole("textbox", { name: "maze-description" });
    const locationInput = screen.getByTestId("locations-list");
    const privateCheckbox = screen.getByRole("checkbox", { name: "maze-visibility maze-private" });
    const button = screen.getByRole("button", { name: "maze-save" });

    fireEvent.change(descriptionInput, { target: { value: "&" } });

    expect(descriptionInput.value).toBe("&");

    expect(screen.getByText("error-invalid-description")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(descriptionInput, { target: { value: "sth" } });

    expect(descriptionInput.value).toBe("sth");

    expect(screen.queryByText("error-invalid-description")).not.toBeInTheDocument();

    expect(button).toBeEnabled();

    fireEvent.change(descriptionInput, { target: { value: "test" } });

    expect(descriptionInput.value).toBe("test");

    expect(button).toBeDisabled();

    fireEvent.click(locationInput);

    expect(locationInput.textContent).toBe("/sth/");

    expect(button).toBeEnabled();

    fireEvent.click(privateCheckbox);

    const passcodeInput = screen.getByRole("textbox", { name: "maze-passcode" })

    fireEvent.change(passcodeInput, { target: { value: "test" } });

    expect(passcodeInput.value).toBe("test");

    expect(screen.getByText("error-invalid-passcode")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(passcodeInput, { target: { value: "123456789" } });

    expect(passcodeInput.value).toBe("123456789");

    expect(screen.queryByText("error-invalid-passcode")).not.toBeInTheDocument();

    expect(button).toBeEnabled();

    fireEvent.click(privateCheckbox);

    fireEvent.click(privateCheckbox);

    expect(screen.getByRole("textbox", { name: "maze-passcode" }).value).toBe("123456789");

    fireEvent.change(screen.getByRole("textbox", { name: "maze-passcode" }), { target: { value: "test" } });

    expect(screen.getByText("error-invalid-passcode")).toBeInTheDocument();

    fireEvent.change(privateCheckbox, { target: { checked: false } });

    fireEvent.click(privateCheckbox);

    expect(screen.getByRole("textbox", { name: "maze-passcode" }).value).toBe("test");

    expect(screen.getByText("error-invalid-passcode")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: "maze-passcode" }), { target: { value: "123456789" } });

    expect(screen.queryByText("error-invalid-passcode")).not.toBeInTheDocument();

    expect(button).toBeEnabled();
  });


  it("renders when authenticated and adds new location", () => {
    //Render the component
    render(
      <TokenContext.Provider value={{ token: "token" }}>
        <MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", isPrivate: true, passcode: "" }} locations={["/", "/asd/"]} />
      </TokenContext.Provider>
    );

    const showButton = screen.getByRole("button", { name: "▶ location-add" });

    fireEvent.click(showButton);

    const parentInput = screen.getByRole("combobox");
    const locationInput = screen.getByRole("textbox", { name: "location-add-new-location *" });
    const button = screen.getByRole("button", { name: "location-add-save" });

    fireEvent.change(locationInput, { target: { value: "test" } });

    expect(locationInput.value).toBe("test");

    expect(button).toBeEnabled();

    fireEvent.change(locationInput, { target: { value: "asd" } });

    expect(locationInput.value).toBe("asd");

    expect(screen.getByText("error-save-location-already-exists")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(locationInput, { target: { value: "&" } });

    expect(locationInput.value).toBe("&");

    expect(screen.getByText("error-rename-location-invalid-format")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(locationInput, { target: { value: "test" } });

    expect(locationInput.value).toBe("test");

    expect(screen.queryByText("error-rename-location-invalid-format")).not.toBeInTheDocument();

    expect(button).toBeEnabled();

    fireEvent.change(parentInput, { target: { value: "/asd/" } });

    expect(parentInput.value).toBe("/asd/");

    fireEvent.click(button);

    expect(parentInput.value).toBe("/");

    expect(locationInput.value).toBe("");

    expect(screen.getByText("/asd/test/")).toBeInTheDocument();

    expect(button).toBeDisabled();
  });


  it("renders when authenticated and submits the form when the form is valid", async () => {
    //Mock the API call
    axios.post.mockResolvedValue({ data: { token: "token2", maze: {}, locations: ["/"] } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "token", setToken: (a) => {} }}>
        <MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", isPrivate: true, passcode: "" }} locations={["/"]} />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.change(screen.getByRole("textbox", { name: "maze-description" }), { target: { value: "description" } });
    fireEvent.click(screen.getByTestId("locations-list"));
    fireEvent.click(screen.getByRole("checkbox", { name: "maze-visibility maze-private" }));

    fireEvent.submit(screen.getByRole("button", { name: "maze-save" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/update`,
        {
          mazeId: 1,
          description: "description",
          location: "/sth/",
          isPrivate: false,
          passcode: "",
          token: "token",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    expect(screen.getByText("maze-updated")).toBeInTheDocument();
  });


  it("renders when authenticated and submits the form when the form is valid, private and has changed", async () => {
    //Mock changed function
    const changed = jest.fn((a, b) => {});

    //Mock the API call
    axios.post.mockResolvedValue({ data: { token: "token2", maze: {}, locations: ["/"] } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "token", setToken: (a) => {} }}>
        <MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", isPrivate: false, passcode: "123456789" }} locations={["/"]} changed={changed} />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.change(screen.getByRole("textbox", { name: "maze-description" }), { target: { value: "description" } });
    fireEvent.click(screen.getByTestId("locations-list"));
    fireEvent.click(screen.getByRole("checkbox", { name: "maze-visibility maze-public" }));

    fireEvent.submit(screen.getByRole("button", { name: "maze-save" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/update`,
        {
          mazeId: 1,
          description: "description",
          location: "/sth/",
          isPrivate: false,
          passcode: "",
          token: "token",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    expect(screen.getByText("maze-updated")).toBeInTheDocument();

    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledWith({}, ["/"]);
  });


  it("renders when authenticated and submits the form when the form is valid but receives an error", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "token" }}>
        <MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", isPrivate: true, passcode: "" }} locations={["/"]} />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.change(screen.getByRole("textbox", { name: "maze-description" }), { target: { value: "description" } });
    fireEvent.click(screen.getByTestId("locations-list"));
    fireEvent.click(screen.getByRole("checkbox", { name: "maze-visibility maze-private" }));

    fireEvent.submit(screen.getByRole("button", { name: "maze-save" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/update`,
        {
          mazeId: 1,
          description: "description",
          location: "/sth/",
          isPrivate: false,
          passcode: "",
          token: "token",
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


  it("renders when authenticated and submits the form when the form is valid but receives UserNotFoundException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "UserNotFoundException" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "token" }}>
        <MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", isPrivate: true, passcode: "" }} locations={["/"]} />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.change(screen.getByRole("textbox", { name: "maze-description" }), { target: { value: "description" } });
    fireEvent.click(screen.getByTestId("locations-list"));
    fireEvent.click(screen.getByRole("checkbox", { name: "maze-visibility maze-private" }));

    fireEvent.submit(screen.getByRole("button", { name: "maze-save" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/update`,
        {
          mazeId: 1,
          description: "description",
          location: "/sth/",
          isPrivate: false,
          passcode: "",
          token: "token",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-save-maze-user-not-found")).toBeInTheDocument();
    });
  });


  it("renders when authenticated and submits the form when the form is valid but receives InvalidMazeIdException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "InvalidMazeIdException" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "token" }}>
        <MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", isPrivate: true, passcode: "" }} locations={["/"]} />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.change(screen.getByRole("textbox", { name: "maze-description" }), { target: { value: "description" } });
    fireEvent.click(screen.getByTestId("locations-list"));
    fireEvent.click(screen.getByRole("checkbox", { name: "maze-visibility maze-private" }));

    fireEvent.submit(screen.getByRole("button", { name: "maze-save" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/update`,
        {
          mazeId: 1,
          description: "description",
          location: "/sth/",
          isPrivate: false,
          passcode: "",
          token: "token",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-save-maze-invalid-id")).toBeInTheDocument();
    });
  });


  it("renders when authenticated and submits the form when the form is valid but receives MazeOwnerException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "MazeOwnerException" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "token" }}>
        <MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", isPrivate: true, passcode: "" }} locations={["/"]} />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.change(screen.getByRole("textbox", { name: "maze-description" }), { target: { value: "description" } });
    fireEvent.click(screen.getByTestId("locations-list"));
    fireEvent.click(screen.getByRole("checkbox", { name: "maze-visibility maze-private" }));

    fireEvent.submit(screen.getByRole("button", { name: "maze-save" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/update`,
        {
          mazeId: 1,
          description: "description",
          location: "/sth/",
          isPrivate: false,
          passcode: "",
          token: "token",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-save-maze-owner")).toBeInTheDocument();
    });
  });


  it("renders when authenticated and submits the form when the form is valid but receives DescriptionInvalidFormatException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "DescriptionInvalidFormatException" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "token" }}>
        <MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", isPrivate: true, passcode: "" }} locations={["/"]} />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.change(screen.getByRole("textbox", { name: "maze-description" }), { target: { value: "description" } });
    fireEvent.click(screen.getByTestId("locations-list"));
    fireEvent.click(screen.getByRole("checkbox", { name: "maze-visibility maze-private" }));

    fireEvent.submit(screen.getByRole("button", { name: "maze-save" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/update`,
        {
          mazeId: 1,
          description: "description",
          location: "/sth/",
          isPrivate: false,
          passcode: "",
          token: "token",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-save-maze-description-invalid-format")).toBeInTheDocument();
    });
  });


  it("renders when authenticated and submits the form when the form is valid but receives LocationInvalidFormatException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "LocationInvalidFormatException" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "token" }}>
        <MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", isPrivate: true, passcode: "" }} locations={["/"]} />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.change(screen.getByRole("textbox", { name: "maze-description" }), { target: { value: "description" } });
    fireEvent.click(screen.getByTestId("locations-list"));
    fireEvent.click(screen.getByRole("checkbox", { name: "maze-visibility maze-private" }));

    fireEvent.submit(screen.getByRole("button", { name: "maze-save" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/update`,
        {
          mazeId: 1,
          description: "description",
          location: "/sth/",
          isPrivate: false,
          passcode: "",
          token: "token",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-save-maze-location-invalid-format")).toBeInTheDocument();
    });
  });


  it("renders when authenticated and submits the form when the form is valid but receives PasscodeInvalidFormatException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "PasscodeInvalidFormatException" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "token" }}>
        <MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", isPrivate: true, passcode: "" }} locations={["/"]} />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.change(screen.getByRole("textbox", { name: "maze-description" }), { target: { value: "description" } });
    fireEvent.click(screen.getByTestId("locations-list"));
    fireEvent.click(screen.getByRole("checkbox", { name: "maze-visibility maze-private" }));

    fireEvent.submit(screen.getByRole("button", { name: "maze-save" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/update`,
        {
          mazeId: 1,
          description: "description",
          location: "/sth/",
          isPrivate: false,
          passcode: "",
          token: "token",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-save-maze-passcode-invalid-format")).toBeInTheDocument();
    });
  });


  it("renders when authenticated and submits the form when the form is valid but receives unknown error", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "token" }}>
        <MazeModal visible={true} setVisible={(a) => {}} data={{ id: 1, description: "test", location: "/", isPrivate: true, passcode: "" }} locations={["/"]} />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.change(screen.getByRole("textbox", { name: "maze-description" }), { target: { value: "description" } });
    fireEvent.click(screen.getByTestId("locations-list"));
    fireEvent.click(screen.getByRole("checkbox", { name: "maze-visibility maze-private" }));

    fireEvent.submit(screen.getByRole("button", { name: "maze-save" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/update`,
        {
          mazeId: 1,
          description: "description",
          location: "/sth/",
          isPrivate: false,
          passcode: "",
          token: "token",
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
