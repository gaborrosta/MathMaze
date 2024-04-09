/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import LocationsList from "./LocationsList";

//Mock console.error
jest.spyOn(console, "error").mockImplementation(() => jest.fn());


//The test suite
describe("LocationsList", () => {
  it("throws an error if locations is not provided", () => {
    expect(() => render(<LocationsList />)).toThrow("locations is required.");
  });


  it("throws an error if locations is not an array", () => {
    expect(() => render(<LocationsList locations="test" />)).toThrow("locations must be an array.");
  });


  it("throws an error if locations is an empty array", () => {
    expect(() => render(<LocationsList locations={[]} />)).toThrow("locations must not be empty.");
  });


  it("throws an error if locations is not an array of strings", () => {
    expect(() => render(<LocationsList locations={[1, 2, 3]} />)).toThrow("locations must be an array of strings.");
  });


  it("throws an error if locations does not start with '/'", () => {
    expect(() => render(<LocationsList locations={["test"]} />)).toThrow("locations must be an array of strings that start with '/'.");
  });


  it("throws an error if locations does not end with '/'", () => {
    expect(() => render(<LocationsList locations={["/test"]} />)).toThrow("locations must be an array of strings with ends with '/'.");
  });


  it("throws an error if selectedLocation is not provided", () => {
    expect(() => render(<LocationsList locations={["/location/"]} />)).toThrow("selectedLocation is required.");
  });


  it("throws an error if selectedLocation is not a string", () => {
    expect(() => render(<LocationsList locations={["/location/"]} selectedLocation={1} />)).toThrow("selectedLocation must be a string.");
  });


  it("throws an error if selectedLocation does not start with '/'", () => {
    expect(() => render(<LocationsList locations={["/location/"]} selectedLocation="test" />)).toThrow("selectedLocation must start with '/'.");
  });


  it("throws an error if selectedLocation does not end with '/'", () => {
    expect(() => render(<LocationsList locations={["/location/"]} selectedLocation="/test" />)).toThrow("selectedLocation must end with '/'.");
  });


  it("throws an error if selectedLocation is not in locations", () => {
    expect(() => render(<LocationsList locations={["/location/"]} selectedLocation="/test/" />)).toThrow("selectedLocation must be in locations.");
  });


  it("throws an error if onLocationChange is not provided", () => {
    expect(() => render(<LocationsList locations={["/location/"]} selectedLocation="/location/" />)).toThrow("onLocationChange is required.");
  });


  it("throws an error if onLocationChange is not a function", () => {
    expect(() => render(<LocationsList locations={["/location/"]} selectedLocation="/location/" onLocationChange="test" />)).toThrow("onLocationChange must be a function.");
  });


  it("throws an error if onLocationChange does not have 1 parameter", () => {
    expect(() => render(<LocationsList locations={["/location/"]} selectedLocation="/location/" onLocationChange={() => {}} />)).toThrow("onLocationChange must have 1 parameter.");
  });


  it("throws an error if onEdit is not a function", () => {
    expect(() => render(<LocationsList locations={["/location/"]} selectedLocation="/location/" onLocationChange={(a) => {}} onEdit="test" />)).toThrow("onEdit must be a function.");
  });


  it("throws an error if onEdit does not have 1 parameter", () => {
    expect(() => render(<LocationsList locations={["/location/"]} selectedLocation="/location/" onLocationChange={(a) => {}} onEdit={() => {}} />)).toThrow("onEdit must have 1 parameter.");
  });


  it("renders", () => {
    //Render the component
    render(<LocationsList locations={["/", "/location/"]} selectedLocation="/location/" onLocationChange={(a) => {}} />);

    expect(screen.getByText("/")).toBeInTheDocument();
    expect(screen.getByText("location/")).toBeInTheDocument();
    expect(screen.getByText("location/")).toHaveClass("active");

    fireEvent.click(screen.getByText("/"));

    expect(screen.getByText("/")).toHaveClass("active");
    expect(screen.getByText("location/")).not.toHaveClass("active");
  })


  it("renders with onEdit", () => {
    //Mock the onEdit function
    const onEdit = jest.fn((a) => {});

    //Render the component
    render(<LocationsList locations={["/", "/location/", "/location/test/"]} selectedLocation="/location/" onLocationChange={(a) => {}} onEdit={onEdit} />);

    expect(screen.getByText("/")).toBeInTheDocument();
    expect(screen.getByText("location/")).toBeInTheDocument();
    expect(screen.getByText("location/")).toHaveClass("active");
    expect(screen.getByText("test/")).toBeInTheDocument();

    fireEvent.click(screen.getAllByTestId("edit")[1]);

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(["/location/", "test"]);
  })
});
