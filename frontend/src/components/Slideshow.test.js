/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import Slideshow from "./Slideshow";

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


//Data
const data = [
  { title: "title1", description: "description1", image: "image1.jpg", alt: "alt1" },
  { title: "title2", description: "description2", image: "image2.jpg", alt: "alt2" },
];


//The test suite
describe("Slideshow", () => {
  it("throws an error if data is missing", () => {
    expect(() => render(<Slideshow />)).toThrow("The data parameter is required.");
  });


  it("throws an error if data is not an array", () => {
    expect(() => render(<Slideshow data={{}} />)).toThrow("The data parameter must be an array.");
  });


  it("throws an error if data is empty", () => {
    expect(() => render(<Slideshow data={[]} />)).toThrow("The data parameter must not be empty.");
  });


  it("throws an error if an item is missing the title", () => {
    const data = [{}];
    expect(() => render(<Slideshow data={data} />)).toThrow("The title property is required in each item.");
  });


  it("throws an error if an item is missing the description", () => {
    const data = [{ title: "title" }];
    expect(() => render(<Slideshow data={data} />)).toThrow("The description property is required in each item.");
  });


  it("throws an error if an item is missing the image", () => {
    const data = [{ title: "title", description: "description" }];
    expect(() => render(<Slideshow data={data} />)).toThrow("The image property is required in each item.");
  });


  it("throws an error if an item is missing the alt", () => {
    const data = [{ title: "title", description: "description", image: "image.jpg" }];
    expect(() => render(<Slideshow data={data} />)).toThrow("The alt property is required in each item.");
  });


  it("throws an error if an item has a non-number time", () => {
    const data = [{ title: "title", description: "description", image: "image.jpg", alt: "alt", time: "time" }];
    expect(() => render(<Slideshow data={data} />)).toThrow("The time property must be a number.");
  });


  it("displays the first slide initially", () => {
    render(<Slideshow data={data} />);

    expect(screen.getByText("title1")).toBeInTheDocument();
    expect(screen.getByText("description1")).toBeInTheDocument();
    expect(screen.getByAltText("alt1")).toBeInTheDocument();
  });


  it("changes slide when the next button is clicked", () => {
    render(<Slideshow data={data} />);

    fireEvent.click(screen.getByText("Next"));

    expect(screen.getByText("title2")).toBeInTheDocument();
    expect(screen.getByText("description2")).toBeInTheDocument();
  });
});
