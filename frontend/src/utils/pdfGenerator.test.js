/**
 * @jest-environment jsdom
 */

import pdfGenerator from "./pdfGenerator";

//Mock html2canvas with different size
let mockCanvasWidth = jest.fn();
let mockCanvasHeight = jest.fn();
jest.mock("html2canvas", () => {
  return jest.fn(() => {
    return new Promise((resolve) => {
      const canvas = {
        width: mockCanvasWidth(),
        height: mockCanvasHeight(),
        toBlob: jest.fn((callback, type, quality) => {
          callback(new Blob());
        }),
      };
      resolve(canvas);
    });
  });
});

//Mock jsPDF with different size
let mockGetWidth = jest.fn();
let mockGetHeight = jest.fn();
jest.mock("jspdf", () => {
  return jest.fn().mockImplementation(() => {
    return {
      addImage: jest.fn(),
      save: jest.fn(),
      internal: {
        pageSize: {
          getWidth: mockGetWidth,
          getHeight: mockGetHeight,
        },
      },
    };
  });
});


//The test suite
describe("pdfGenerator", () => {
  let originalCreateObjectURL;
  let originalRevokeObjectURL;
  let originalRemoveChild;

  beforeEach(() => {
    originalCreateObjectURL = global.URL.createObjectURL;
    originalRevokeObjectURL = global.URL.revokeObjectURL;
    originalRemoveChild = document.body.removeChild;

    global.URL.createObjectURL = jest.fn(() => "blob-url");
    global.URL.revokeObjectURL = jest.fn();
    document.body.removeChild = jest.fn();
  });

  afterEach(() => {
    global.URL.createObjectURL = originalCreateObjectURL;
    global.URL.revokeObjectURL = originalRevokeObjectURL;
    document.body.removeChild = originalRemoveChild;
    document.body.innerHTML = "";
  });


  it("throws an error if data is missing", async () => {
    await expect(() => pdfGenerator(undefined)).rejects.toThrow("data is required.");
  });


  it("throws an error if data is not an object", async () => {
    await expect(() => pdfGenerator("test")).rejects.toThrow("data must be an object.");
  });


  it("throws an error if data is missing an id", async () => {
    await expect(() => pdfGenerator({})).rejects.toThrow("data.id is required.");
  });


  it("throws an error if data.id is not a number", async () => {
    await expect(() => pdfGenerator({id: "1"})).rejects.toThrow("data.id must be a number.");
  });


  it("throws an error if data is missing a width", async () => {
    await expect(() => pdfGenerator({id: 1})).rejects.toThrow("data.width is required.");
  });


  it("throws an error if data.width is not a number", async () => {
    await expect(() => pdfGenerator({id: 1, width: "5"})).rejects.toThrow("data.width must be a number.");
  });


  it("throws an error if data is missing a height", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5})).rejects.toThrow("data.height is required.");
  });


  it("throws an error if data.height is not a number", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: "5"})).rejects.toThrow("data.height must be a number.");
  });


  it("throws an error if data is missing a start", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5})).rejects.toThrow("data.start is required.");
  });


  it("throws an error if data.start is not an array", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: "test"})).rejects.toThrow("data.start must be an array.");
  });


  it("throws an error if data.start has only one element", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0]})).rejects.toThrow("data.start must have 2 elements.");
  });


  it("throws an error if data is missing an end", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0, 0]})).rejects.toThrow("data.end is required.");
  });


  it("throws an error if data.end is not an array", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0, 0], end: "test"})).rejects.toThrow("data.end must be an array.");
  });


  it("throws an error if data.end has only one element", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0, 0], end: [4]})).rejects.toThrow("data.end must have 2 elements.");
  });


  it("throws an error if data is missing a digits", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4]})).rejects.toThrow("data.digits is required.");
  });


  it("throws an error if data.digits is not a number", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: "2"})).rejects.toThrow("data.digits must be a number.");
  });


  it("throws an error if data is missing a pathTypeEven", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2})).rejects.toThrow("data.pathTypeEven is required.");
  });


  it("throws an error if data.pathTypeEven is not a boolean", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: "true"})).rejects.toThrow("data.pathTypeEven must be a boolean.");
  });


  it("throws an error if data is missing a pathLength", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true})).rejects.toThrow("data.pathLength is required.");
  });


  it("throws an error if data.pathLength is not a number", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: "10"})).rejects.toThrow("data.pathLength must be a number.");
  });


  it("throws an error if data is missing a description", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10})).rejects.toThrow("data.description is required.");
  });


  it("throws an error if data.description is not a string", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10, description: 10})).rejects.toThrow("data.description must be a string.");
  });


  it("throws an error if data is missing a user", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10, description: "test"})).rejects.toThrow("data.user is required.");
  });


  it("throws an error if data.user is not a string", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10, description: "test", user: 10})).rejects.toThrow("data.user must be a string.");
  });


  it("throws an error if data is missing a data", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10, description: "test", user: "test"})).rejects.toThrow("data.data is required.");
  });


  it("throws an error if data.data is not an array", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10, description: "test", user: "test", data: "test"})).rejects.toThrow("data.data must be an array.");
  });


  it("throws an error if data.data does not have the same height as data.height", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10, description: "test", user: "test", data: []})).rejects.toThrow("data.data must have the same height as data.height.");
  });


  it("throws an error if data.data is not an array of arrays", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10, description: "test", user: "test", data: ["1", "2", "3", "4", "5"]})).rejects.toThrow("data.data must be an array of arrays.");
  });


  it("throws an error if data.data does not have the same width as data.width", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10, description: "test", user: "test", data: [[1], [2], [3], [4], [5]]})).rejects.toThrow("data.data must have the same width as data.width.");
  });


  it("throws an error if data.data is not an array of arrays of strings", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10, description: "test", user: "test", data: [["1", "2", "3", "4", "5"], ["1", 2, "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]})).rejects.toThrow("data.data must be an array of arrays of strings.");
  });


  it("throws an error if t is missing", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10, description: "test", user: "test", data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]})).rejects.toThrow("t is required.");
  });


  it("throws an error if t is not a function", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10, description: "test", user: "test", data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}, "test")).rejects.toThrow("t must be a function.");
  });


  it("throws an error t has less than 1 parameter", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10, description: "test", user: "test", data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}, () => {})).rejects.toThrow("t must have 1 parameter.");
  });


  it("throws an error if size is missing", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10, description: "test", user: "test", data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}, (a) => {})).rejects.toThrow("size is required.");
  });


  it("throws an error if size is not a string", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10, description: "test", user: "test", data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}, (a) => {}, 10)).rejects.toThrow("size must be a string.");
  });


  it("throws an error if size is not A4 or A3", async () => {
    await expect(() => pdfGenerator({id: 1, width: 5, height: 5, start: [0, 0], end: [4, 4], digits: 2, pathTypeEven: true, pathLength: 10, description: "test", user: "test", data: [["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"], ["1", "2", "3", "4", "5"]]}, (a) => {}, "A5")).rejects.toThrow("size must be either 'A4' or 'A3'.");
  });


  it("creates the correct DOM structure for A4", async () => {
    mockCanvasWidth.mockReturnValue(500);
    mockCanvasHeight.mockReturnValue(800);
    mockGetWidth.mockReturnValue(595.28); //A4 page width in points
    mockGetHeight.mockReturnValue(841.89); //A4 page height in points

    const data = {
      width: 5,
      height: 5,
      digits: 2,
      start: [0, 0],
      end: [4, 4],
      data: Array(5).fill().map(() => Array(5).fill("0")),
      id: 1,
      pathTypeEven: true,
      pathLength: 10,
      description: "test",
      user: "test",
    };
    const t = key => key;
    const size = "A4";

    await pdfGenerator(data, t, size);

    const maze = document.querySelector(".maze");
    expect(maze).not.toBeNull();
    expect(maze.style.gridTemplateColumns).toBe("repeat(5, 1fr)");
    expect(maze.style.minWidth).toBe("300px");

    const cells = document.querySelectorAll(".maze-cell");
    expect(cells.length).toBe(25);
  });


  it("creates the correct DOM structure for A3", async () => {
    mockCanvasWidth.mockReturnValue(700);
    mockCanvasHeight.mockReturnValue(800);
    mockGetWidth.mockReturnValue(841.89); //A3 page width in points
    mockGetHeight.mockReturnValue(1190.55); //A3 page height in points

    const data = {
      width: 11,
      height: 49,
      digits: 3,
      start: [0, 0],
      end: [4, 4],
      data: Array(49).fill().map(() => Array(11).fill("0")),
      id: 2,
      pathTypeEven: false,
      pathLength: 10,
      description: "",
      user: "test",
    };
    const t = key => key;
    const size = "A3";

    await pdfGenerator(data, t, size);

    const maze = document.querySelector(".maze");
    expect(maze).not.toBeNull();
    expect(maze.style.gridTemplateColumns).toBe("repeat(11, 1fr)");
    expect(maze.style.minWidth).toBe("990px");

    const cells = document.querySelectorAll(".maze-cell");
    expect(cells.length).toBe(11*49);
  });
});
