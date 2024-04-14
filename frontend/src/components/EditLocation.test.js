/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import axios from "axios";
import { BACKEND_URL } from "../utils/constants";
import TokenContext from "../utils/TokenContext";
import EditLocation from "./EditLocation";

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

//Mock axios to control API calls
jest.mock("axios");


//The test suite
describe("EditLocation", () => {
  it("throws an error if visible is not provided", () => {
    expect(() => render(<EditLocation />)).toThrow("visible is required.");
  });


  it("throws an error if visible is not a boolean", () => {
    expect(() => render(<EditLocation visible="test" />)).toThrow("visible must be a boolean.");
  });


  it("throws an error if setVisible is not provided", () => {
    expect(() => render(<EditLocation visible={true} />)).toThrow("setVisible is required.");
  });


  it("throws an error if setVisible is not a function", () => {
    expect(() => render(<EditLocation visible={true} setVisible="test" />)).toThrow("setVisible must be a function.");
  });


  it("throws an error if setVisible does not have 1 parameter", () => {
    expect(() => render(<EditLocation visible={true} setVisible={() => {}} />)).toThrow("setVisible must have 1 parameter.");
  });


  it("throws an error if location is not provided", () => {
    expect(() => render(<EditLocation visible={true} setVisible={(a) => {}} />)).toThrow("location is required.");
  });


  it("throws an error if location is not an array with 2 elements", () => {
    expect(() => render(<EditLocation visible={true} setVisible={(a) => {}} location={["test"]} />)).toThrow("location must be an array with 2 elements.");
  });


  it("throws an error if location does not contain 2 strings", () => {
    expect(() => render(<EditLocation visible={true} setVisible={(a) => {}} location={[1, 2]} />)).toThrow("location must contain 2 strings.");
  });


  it("throws an error if the parent folder does not start and end with "/"", () => {
    expect(() => render(<EditLocation visible={true} setVisible={(a) => {}} location={["test", "location"]} />)).toThrow("The parent folder must start and end with '/'");
  });


  it("throws an error if changed is not provided", () => {
    expect(() => render(<EditLocation visible={true} setVisible={(a) => {}} location={["/valid/path/", "location"]} />)).toThrow("changed is required.");
  });


  it("throws an error if changed is not a function", () => {
    expect(() => render(<EditLocation visible={true} setVisible={(a) => {}} location={["/valid/path/", "location"]} changed="test" />)).toThrow("changed must be a function.");
  });


  it("throws an error if changed does not have 2 parameters", () => {
    expect(() => render(<EditLocation visible={true} setVisible={(a) => {}} location={["/valid/path/", "location"]} changed={() => {}} />)).toThrow("changed must have 2 parameters.");
  });


  it("renders but not visible", () => {
    //Render the component
    render(<EditLocation visible={false} setVisible={(a) => {}} location={["/valid/path/", "location"]} changed={(a, b) => {}} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });


  it("renders and closes when close clicked", () => {
    //Mock the setVisible function
    const setVisible = jest.fn((a) => {});

    //Render the component
    render(<EditLocation visible={true} setVisible={setVisible} location={["/valid/path/", "location"]} changed={(a, b) => {}} />);

    const closeButton = screen.getByRole("button", { name: "Close" });

    fireEvent.click(closeButton);

    expect(setVisible).toHaveBeenCalledWith(false);
  });


  it("displays error when value is invalid", async () => {
    //Render the component
    render(
      <TokenContext.Provider value={{ token: "test-token", setToken: (a) => {} }}>
        <EditLocation visible={true} setVisible={(a) => {}} location={["/valid/path/", "location"]} changed={(a, b) => {}} />
      </TokenContext.Provider>
    );

    //Get the elements
    const inputLocation = screen.getByRole("textbox", { name: "location-rename-new-name *" });
    const button = screen.getByRole("button", { name: "location-rename-save" });

    fireEvent.change(inputLocation, { target: { value: "&" } });

    expect(inputLocation.value).toBe("&");

    expect(screen.getByText("error-rename-location-invalid-format")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputLocation, { target: { value: "" } });

    expect(inputLocation.value).toBe("");

    expect(screen.getByText("field-required")).toBeInTheDocument();

    expect(button).toBeDisabled();

    fireEvent.change(inputLocation, { target: { value: "test" } });

    expect(inputLocation.value).toBe("test");

    expect(screen.queryByText("error-rename-location-invalid-format")).not.toBeInTheDocument();

    expect(button).toBeEnabled();

    expect(screen.getByText("location-rename-title")).toBeInTheDocument();
  });


  it("submits the form when the form is valid", async () => {
    //Mock the changed function
    const changed = jest.fn((a, b) => {});

    //Mock the API call
    axios.post.mockResolvedValue({ data: { token: "", mazes: "", locations: "" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "test-token", setToken: (a) => {} }}>
        <EditLocation visible={true} setVisible={(a) => {}} location={["/valid/path/", "location"]} changed={changed} />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.input(screen.getByRole("textbox", { name: "location-rename-new-name *" }), { target: { value: "test" } });

    fireEvent.submit(screen.getByRole("button", { name: "location-rename-save" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/update-location`,
        {
          parentLocation: "/valid/path/",
          originalLocation: "location",
          newLocation: "test",
          token: "test-token",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("location-renamed")).toBeInTheDocument();
    });

    expect(changed).toHaveBeenCalledWith("", "");
  });


  it("submits the form when the form is valid but receives an error", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "test-token", setToken: (a) => {} }}>
        <EditLocation visible={true} setVisible={(a) => {}} location={["/valid/path/", "location"]} changed={(a, b) => {}} />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.input(screen.getByRole("textbox", { name: "location-rename-new-name *" }), { target: { value: "test" } });

    fireEvent.submit(screen.getByRole("button", { name: "location-rename-save" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/update-location`,
        {
          parentLocation: "/valid/path/",
          originalLocation: "location",
          newLocation: "test",
          token: "test-token",
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


  it("submits the form when the form is valid but receives LocationInvalidFormatException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "LocationInvalidFormatException" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "test-token", setToken: (a) => {} }}>
        <EditLocation visible={true} setVisible={(a) => {}} location={["/valid/path/", "location"]} changed={(a, b) => {}} />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.input(screen.getByRole("textbox", { name: "location-rename-new-name *" }), { target: { value: "test" } });

    fireEvent.submit(screen.getByRole("button", { name: "location-rename-save" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/update-location`,
        {
          parentLocation: "/valid/path/",
          originalLocation: "location",
          newLocation: "test",
          token: "test-token",
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


  it("submits the form when the form is valid but receives LocationNotUniqueException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "LocationNotUniqueException" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "test-token", setToken: (a) => {} }}>
        <EditLocation visible={true} setVisible={(a) => {}} location={["/valid/path/", "location"]} changed={(a, b) => {}} />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.input(screen.getByRole("textbox", { name: "location-rename-new-name *" }), { target: { value: "test" } });

    fireEvent.submit(screen.getByRole("button", { name: "location-rename-save" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/update-location`,
        {
          parentLocation: "/valid/path/",
          originalLocation: "location",
          newLocation: "test",
          token: "test-token",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-save-location-already-exists")).toBeInTheDocument();
    });
  });


  it("submits the form when the form is valid but receives LocationNotFoundException", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "LocationNotFoundException" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "test-token", setToken: (a) => {} }}>
        <EditLocation visible={true} setVisible={(a) => {}} location={["/valid/path/", "location"]} changed={(a, b) => {}} />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.input(screen.getByRole("textbox", { name: "location-rename-new-name *" }), { target: { value: "test" } });

    fireEvent.submit(screen.getByRole("button", { name: "location-rename-save" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/update-location`,
        {
          parentLocation: "/valid/path/",
          originalLocation: "location",
          newLocation: "test",
          token: "test-token",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("error-save-location-not-found")).toBeInTheDocument();
    });
  });


  it("submits the form when the form is valid but receives an unknown error", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "" } });

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "test-token", setToken: (a) => {} }}>
        <EditLocation visible={true} setVisible={(a) => {}} location={["/valid/path/", "location"]} changed={(a, b) => {}} />
      </TokenContext.Provider>
    );

    //Fill the form
    fireEvent.input(screen.getByRole("textbox", { name: "location-rename-new-name *" }), { target: { value: "test" } });

    fireEvent.submit(screen.getByRole("button", { name: "location-rename-save" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/update-location`,
        {
          parentLocation: "/valid/path/",
          originalLocation: "location",
          newLocation: "test",
          token: "test-token",
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
