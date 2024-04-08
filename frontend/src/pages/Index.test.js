/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import Index from "./Index";

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

//Mock Menu
jest.mock("../components/Menu", () => () => <div data-testid="menu"></div>);

//Mock Slideshow
jest.mock("../components/Slideshow", () => ({ data }) => (
  <div data-testid="slideshow">
    {data.map((item, index) => (
      <div key={index}>
        {item.title}, {item.description}, {item.alt}, {item.image}
      </div>
    ))}
  </div>
));

//Mock ContactForm
jest.mock("../components/ContactForm", () => () => <div data-testid="contact-form"></div>);


//The test suite
describe("Index", () => {
  it("renders", () =>{
    //Render the component
    render(<Index />)

    expect(screen.getByTestId("menu")).toBeInTheDocument();
    expect(screen.getByText("welcome")).toBeInTheDocument();
    expect(screen.getByText("welcome-text-1")).toBeInTheDocument();
    expect(screen.getByText("welcome-text-2")).toBeInTheDocument();
    expect(screen.getByText("welcome-how-title")).toBeInTheDocument();
    expect(screen.getByText("welcome-how-1-title")).toBeInTheDocument();
    expect(screen.getByText("welcome-how-1-text")).toBeInTheDocument();
    expect(screen.getByText("welcome-how-2-title")).toBeInTheDocument();
    expect(screen.getByText("welcome-how-2-text")).toBeInTheDocument();
    expect(screen.getByText("welcome-how-3-title")).toBeInTheDocument();
    expect(screen.getByText("welcome-how-3-text")).toBeInTheDocument();
    expect(screen.getByTestId("slideshow")).toBeInTheDocument();
    expect(screen.getByTestId("contact-form")).toBeInTheDocument();
  });


  it("renders Slideshow with correct data", () => {
    const data = [
      { title: "welcome-slides-1-title", description: "welcome-slides-1-text", alt: "welcome-slides-1-alt", image: "welcome-slides-1-image" },
      { title: "welcome-slides-2-title", description: "welcome-slides-2-text", alt: "welcome-slides-2-alt", image: "welcome-slides-2-image" },
      { title: "welcome-slides-3-title", description: "welcome-slides-3-text", alt: "welcome-slides-3-alt", image: "welcome-slides-3-image" },
    ];

    //Render the component
    render(<Index />);

    data.forEach(item => {
      const itemText = `${item.title}, ${item.description}, ${item.alt}, ${item.image}`;
      expect(screen.getByText(itemText)).toBeInTheDocument();
    });
  });
});
