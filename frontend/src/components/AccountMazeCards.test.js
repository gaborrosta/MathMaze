/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import AccountMazeCards from "./AccountMazeCards";

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
describe("AccountMazeCards", () => {
  const mockMaze = {
    id: 1,
    description: "Test maze",
    height: 10,
    width: 10,
    operation: 1,
    numbersRangeStart: 1,
    numbersRangeEnd: 10,
    pathLength: 5,
    pathTypeEven: true,
    solved: 0,
    createdAt: 1,
    location: "/",
  };
  const mockMaze2 = {
    id: 2,
    description: "",
    height: 10,
    width: 10,
    operation: 1,
    numbersRangeStart: 1,
    numbersRangeEnd: 10,
    pathLength: 5,
    pathTypeEven: false,
    solved: 5,
    createdAt: 2,
    location: "/",
  };


  it("throws error when mazes is undefined", () => {
    expect(() => render(<AccountMazeCards />)).toThrow("mazes is required.");
  });


  it("throws error when mazes is not an array", () => {
    expect(() => render(<AccountMazeCards mazes="not an array" />)).toThrow("mazes must be an array.");
  });


  it("throws error when mazes is not an array of objects", () => {
    expect(() => render(<AccountMazeCards mazes={["not an object"]} />)).toThrow("mazes must be an array of objects.");
  });


  it("throws error when maze.id is missing from at least one maze", () => {
    expect(() => render(<AccountMazeCards mazes={[{ }]} />)).toThrow("mazes must have an id property.");
  })


  it("throws error when maze.id is not a number in at least one maze", () => {
    expect(() => render(<AccountMazeCards mazes={[{ id: "not a number" }]} />)).toThrow("mazes must have an id property of type number.");
  })


  it("throws error when maze.description is missing from at least one maze", () => {
    expect(() => render(<AccountMazeCards mazes={[{ id: 1 }]} />)).toThrow("mazes must have a description property.");
  })


  it("throws error when maze.description is not a string in at least one maze", () => {
    expect(() => render(<AccountMazeCards mazes={[{ id: 1, description: 123 }]} />)).toThrow("mazes must have a description property of type string.");
  })


  it("throws error when maze.height is missing from at least one maze", () => {
    expect(() => render(<AccountMazeCards mazes={[{ id: 1, description: "Test maze" }]} />)).toThrow("mazes must have a height property.");
  })


  it("throws error when maze.height is not a number in at least one maze", () => {
    expect(() => render(<AccountMazeCards mazes={[{ id: 1, description: "Test maze", height: "not a number" }]} />)).toThrow("mazes must have a height property of type number.");
  })


  it("throws error when maze.width is missing from at least one maze", () => {
    expect(() => render(<AccountMazeCards mazes={[{ id: 1, description: "Test maze", height: 10 }]} />)).toThrow("mazes must have a width property.");
  })


  it("throws error when maze.width is not a number in at least one maze", () => {
    expect(() => render(<AccountMazeCards mazes={[{ id: 1, description: "Test maze", height: 10, width: "not a number" }]} />)).toThrow("mazes must have a width property of type number.");
  })


  it("throws error when maze.operation is missing from at least one maze", () => {
    expect(() => render(<AccountMazeCards mazes={[{ id: 1, description: "Test maze", height: 10, width: 10 }]} />)).toThrow("mazes must have an operation property.");
  })


  it("throws error when maze.operation is not a number in at least one maze", () => {
    expect(() => render(<AccountMazeCards mazes={[{ id: 1, description: "Test maze", height: 10, width: 10, operation: "not a number" }]} />)).toThrow("mazes must have an operation property of type number.");
  })


  it("throws error when maze.numbersRangeStart is missing from at least one maze", () => {
    expect(() => render(<AccountMazeCards mazes={[{ id: 1, description: "Test maze", height: 10, width: 10, operation: 1 }]} />)).toThrow("mazes must have a numbersRangeStart property.");
  })


  it("throws error when maze.numbersRangeStart is not a number in at least one maze", () => {
    expect(() => render(<AccountMazeCards mazes={[{ id: 1, description: "Test maze", height: 10, width: 10, operation: 1, numbersRangeStart: "not a number" }]} />)).toThrow("mazes must have a numbersRangeStart property of type number.");
  })


  it("throws error when maze.numbersRangeEnd is missing from at least one maze", () => {
    expect(() => render(<AccountMazeCards mazes={[{ id: 1, description: "Test maze", height: 10, width: 10, operation: 1, numbersRangeStart: 1 }]} />)).toThrow("mazes must have a numbersRangeEnd property.");
  })


  it("throws error when maze.numbersRangeEnd is not a number in at least one maze", () => {
    expect(() => render(<AccountMazeCards mazes={[{ id: 1, description: "Test maze", height: 10, width: 10, operation: 1, numbersRangeStart: 1, numbersRangeEnd: "not a number" }]} />)).toThrow("mazes must have a numbersRangeEnd property of type number.");
  })


  it("throws error when maze.pathLength is missing from at least one maze", () => {
    expect(() => render(<AccountMazeCards mazes={[{ id: 1, description: "Test maze", height: 10, width: 10, operation: 1, numbersRangeStart: 1, numbersRangeEnd: 10 }]} />)).toThrow("mazes must have a pathLength property.");
  })


  it("throws error when maze.pathLength is not a number in at least one maze", () => {
    expect(() => render(<AccountMazeCards mazes={[{ id: 1, description: "Test maze", height: 10, width: 10, operation: 1, numbersRangeStart: 1, numbersRangeEnd: 10, pathLength: "not a number" }]} />)).toThrow("mazes must have a pathLength property of type number.");
  })


  it("throws error when maze.pathTypeEven is missing from at least one maze", () => {
    expect(() => render(<AccountMazeCards mazes={[{ id: 1, description: "Test maze", height: 10, width: 10, operation: 1, numbersRangeStart: 1, numbersRangeEnd: 10, pathLength: 5 }]} />)).toThrow("mazes must have a pathTypeEven property.");
  })


  it("throws error when maze.pathTypeEven is not a boolean in at least one maze", () => {
    expect(() => render(<AccountMazeCards mazes={[{ id: 1, description: "Test maze", height: 10, width: 10, operation: 1, numbersRangeStart: 1, numbersRangeEnd: 10, pathLength: 5, pathTypeEven: "not a boolean" }]} />)).toThrow("mazes must have a pathTypeEven property of type boolean.");
  })


  it("throws error when maze.solved is missing from at least one maze", () => {
    expect(() => render(<AccountMazeCards mazes={[{ id: 1, description: "Test maze", height: 10, width: 10, operation: 1, numbersRangeStart: 1, numbersRangeEnd: 10, pathLength: 5, pathTypeEven: true }]} />)).toThrow("mazes must have a solved property.");
  })


  it("throws error when maze.solved is not a number in at least one maze", () => {
    expect(() => render(<AccountMazeCards mazes={[{ id: 1, description: "Test maze", height: 10, width: 10, operation: 1, numbersRangeStart: 1, numbersRangeEnd: 10, pathLength: 5, pathTypeEven: true, solved: "not a number" }]} />)).toThrow("mazes must have a solved property of type number.");
  })


  it("throws error when maze.createdAt is missing from at least one maze", () => {
    expect(() => render(<AccountMazeCards mazes={[{ id: 1, description: "Test maze", height: 10, width: 10, operation: 1, numbersRangeStart: 1, numbersRangeEnd: 10, pathLength: 5, pathTypeEven: true, solved: 0 }]} />)).toThrow("mazes must have a createdAt property.");
  })


  it("throws error when maze.createdAt is not a string in at least one maze", () => {
    expect(() => render(<AccountMazeCards mazes={[{ id: 1, description: "Test maze", height: 10, width: 10, operation: 1, numbersRangeStart: 1, numbersRangeEnd: 10, pathLength: 5, pathTypeEven: true, solved: 0, createdAt: "not a number" }]} />)).toThrow("mazes must have a createdAt property of type number.");
  })


  it("throws error when maze.location is missing from at least one maze", () => {
    expect(() => render(<AccountMazeCards mazes={[{ id: 1, description: "Test maze", height: 10, width: 10, operation: 1, numbersRangeStart: 1, numbersRangeEnd: 10, pathLength: 5, pathTypeEven: true, solved: 0, createdAt: 1 }]} />)).toThrow("mazes must have a location property.");
  })


  it("throws error when maze.location is not a string in at least one maze", () => {
    expect(() => render(<AccountMazeCards mazes={[{ id: 1, description: "Test maze", height: 10, width: 10, operation: 1, numbersRangeStart: 1, numbersRangeEnd: 10, pathLength: 5, pathTypeEven: true, solved: 0, createdAt: 1, location: 1 }]} />)).toThrow("mazes must have a location property of type string.");
  })


  it("throws error when selectedLocation is undefined", () => {
    expect(() => render(<AccountMazeCards mazes={[mockMaze]} />)).toThrow("selectedLocation is required.");
  });


  it("throws error when selectedLocation is not a string", () => {
    expect(() => render(<AccountMazeCards mazes={[mockMaze]} selectedLocation={123} />)).toThrow("selectedLocation must be a string.");
  });


  it("throws error when addSolutionTab is undefined", () => {
    expect(() => render(<AccountMazeCards mazes={[mockMaze]} selectedLocation="/" />)).toThrow("addSolutionTab is required.");
  });


  it("throws error when addSolutionTab is not a function", () => {
    expect(() => render(<AccountMazeCards mazes={[mockMaze]} selectedLocation="/" addSolutionTab="not a function" />)).toThrow("addSolutionTab must be a function.");
  });


  it("throws error when addSolutionTab does not have 1 parameter", () => {
    expect(() => render(<AccountMazeCards mazes={[mockMaze]} selectedLocation="/" addSolutionTab={() => {}} />)).toThrow("addSolutionTab must have 1 parameter.");
  });


  it("throws error when openModal is undefined", () => {
    expect(() => render(<AccountMazeCards mazes={[mockMaze]} selectedLocation="/" addSolutionTab={(a) => {}} />)).toThrow("openModal is required.");
  });


  it("throws error when openModal is not a function", () => {
    expect(() => render(<AccountMazeCards mazes={[mockMaze]} selectedLocation="/" addSolutionTab={(a) => {}} openModal="not a function" />)).toThrow("openModal must be a function.");
  });


  it("throws error when openModal does not have 1 parameter", () => {
    expect(() => render(<AccountMazeCards mazes={[mockMaze]} selectedLocation="/" addSolutionTab={(a) => {}} openModal={() => {}} />)).toThrow("openModal must have 1 parameter.");
  });


  it("renders", async () => {
    //Mock the addSolutionTab, openModal functions
    const addSolutionTab = jest.fn((a) => {});
    const openModal = jest.fn((a) => {});

    //Render the component
    render(<AccountMazeCards mazes={[mockMaze, mockMaze2, mockMaze, mockMaze2, mockMaze, mockMaze2, mockMaze, mockMaze2, mockMaze, mockMaze2, mockMaze, mockMaze2, mockMaze, mockMaze2, mockMaze, mockMaze2, mockMaze, mockMaze2, mockMaze, mockMaze2, mockMaze, mockMaze2, mockMaze, mockMaze2, mockMaze, mockMaze2, mockMaze, mockMaze2, mockMaze, mockMaze2, mockMaze, mockMaze2, mockMaze, mockMaze2, mockMaze, mockMaze2, mockMaze, mockMaze2, mockMaze, mockMaze2, mockMaze, mockMaze2]} selectedLocation="/" addSolutionTab={addSolutionTab} openModal={openModal} />);

    fireEvent.click(screen.getByText("sort-order-desc"));

    expect(screen.getByText("sort-order-asc")).toBeInTheDocument();

    fireEvent.click(screen.getByText("sort-order-asc"));

    expect(screen.getAllByText("sort-order-asc").length).toBe(2);

    expect(screen.getByText("sort-order-desc")).toBeInTheDocument();

    expect(screen.getAllByText("2").length).toBe(2);

    fireEvent.click(screen.getAllByText("2")[0]);

    screen.getAllByText("1").forEach((element) => {
      expect(element).not.toHaveClass("active");
    });

    fireEvent.click(screen.getAllByText("3")[1]);

    screen.getAllByText("2").forEach((element) => {
      expect(element).not.toHaveClass("active");
    });

    screen.getAllByText("3").forEach((element) => {
      expect(element).toHaveClass("page-link");
    });

    screen.getAllByText("4").forEach((element) => {
      expect(element).not.toHaveClass("active");
    });

    screen.getAllByText("4").forEach((element) => {
      expect(element).not.toHaveClass("active");
    });

    fireEvent.click(screen.getAllByText("maze-check-solutions")[0]);

    await waitFor(() => {
      expect(addSolutionTab).toHaveBeenCalledTimes(1);
      expect(addSolutionTab).toHaveBeenCalledWith(2);
    });

    fireEvent.click(screen.getAllByText("maze-edit-details")[0]);

    await waitFor(() => {
      expect(openModal).toHaveBeenCalledTimes(1);
      expect(openModal).toHaveBeenCalledWith(mockMaze);
  });
  });
});