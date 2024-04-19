/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import axios from "axios";
import { BACKEND_URL } from "../utils/constants";
import TokenContext from "../utils/TokenContext";
import CheckMaze from "./CheckMaze";

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
  }
}));

//Mock the File constructor
const originalFile = global.File;
global.File = jest.fn((content, fileName, options) => {
  return {
    content: content,
    name: fileName,
    ...options,
  };
});

//Mock TokenRefresher
jest.mock("../utils/TokenRefresher", () => () => <div data-testid="token-refresher" />);

//Mock CheckUploadMaze
jest.mock("../components/CheckUploadMaze", () => ({initialId, handleSubmit}) => <button data-testid="check-upload-maze" onClick={() => {
  const data = new FormData();
  data.append("mazeId", 5);
  data.append("image", new global.File(["hello"], "hello.png", { type: "image/png" }));
  data.append("rotation", 90);

  handleSubmit(data);
}} />);

//Mock CheckRecognisedMaze
jest.mock("../components/CheckRecognisedMaze", () => ({ data, initialNickname, handleSubmit }) => <button data-testid="check-recognised-maze" onClick={() => {
  handleSubmit({ mazeId: 5, data: [], path: [{x: 1, y:1}], nickname: initialNickname });
}} />);

//Mock CheckResults
jest.mock("../components/CheckResults", () => () => <div data-testid="check-results" />);

//Mock axios to control API calls
jest.mock("axios");


//The test suite
describe("CheckMaze", () => {
  afterAll(() => {
    global.File = originalFile;
  });

  afterEach(() => {
    jest.resetAllMocks();
  })


  it("renders and gets to step 1 from step 0", async () => {
    //Mock the API call
    axios.post.mockResolvedValue({ data: { token: "newToken", recognisedMaze: {} } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <CheckMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByText("maze-check-title")).toBeInTheDocument();
    expect(screen.getByText("maze-check-info")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("check-upload-maze"));

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/recognise`,
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    })

    expect(setToken).toHaveBeenCalledWith("newToken");

    expect(screen.queryByTestId("check-upload-maze")).not.toBeInTheDocument();
    expect(screen.getByTestId("check-recognised-maze")).toBeInTheDocument();
    expect(screen.getByTestId("token-refresher")).toBeInTheDocument();
  });


  it("renders but receives an error in step 0", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({});

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <CheckMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByText("maze-check-title")).toBeInTheDocument();
    expect(screen.getByText("maze-check-info")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("check-upload-maze"));

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/recognise`,
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      expect(screen.getByText("error-unknown")).toBeInTheDocument();
      expect(screen.getByTestId("check-upload-maze")).toBeInTheDocument();
    })
  });


  it("renders but receives a 413 error in step 0", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { status: 413 } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <CheckMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByText("maze-check-title")).toBeInTheDocument();
    expect(screen.getByText("maze-check-info")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("check-upload-maze"));

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/recognise`,
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      expect(screen.getByText("error-file-too-large")).toBeInTheDocument();
      expect(screen.getByTestId("check-upload-maze")).toBeInTheDocument();
    })
  });


  it("renders but receives InvalidMazeIdException in step 0", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "InvalidMazeIdException" } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <CheckMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByText("maze-check-title")).toBeInTheDocument();
    expect(screen.getByText("maze-check-info")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("check-upload-maze"));

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/recognise`,
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      expect(screen.getByText("error-invalid-maze-id")).toBeInTheDocument();
      expect(screen.getByTestId("check-upload-maze")).toBeInTheDocument();
    })
  });


  it("renders but receives InvalidRotationException in step 0", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "InvalidRotationException" } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <CheckMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByText("maze-check-title")).toBeInTheDocument();
    expect(screen.getByText("maze-check-info")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("check-upload-maze"));

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/recognise`,
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      expect(screen.getByText("error-invalid-rotation")).toBeInTheDocument();
      expect(screen.getByTestId("check-upload-maze")).toBeInTheDocument();
    })
  });


  it("renders but receives CouldNotRecogniseMazeException in step 0", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "CouldNotRecogniseMazeException" } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <CheckMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByText("maze-check-title")).toBeInTheDocument();
    expect(screen.getByText("maze-check-info")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("check-upload-maze"));

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/recognise`,
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      expect(screen.getByText("error-could-not-recognise-maze")).toBeInTheDocument();
      expect(screen.getByTestId("check-upload-maze")).toBeInTheDocument();
    })
  });


  it("renders but receives unknown error in step 0", async () => {
    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "" } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <CheckMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByText("maze-check-title")).toBeInTheDocument();
    expect(screen.getByText("maze-check-info")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("check-upload-maze"));

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/recognise`,
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      expect(screen.getByText("error-unknown-form")).toBeInTheDocument();
      expect(screen.getByTestId("check-upload-maze")).toBeInTheDocument();
    })
  });


  it("renders and gets to step 2 from step 0", async () => {
    //Mock the API call
    axios.post.mockResolvedValue({ data: { token: "newToken", recognisedMaze: {} } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <CheckMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByText("maze-check-title")).toBeInTheDocument();
    expect(screen.getByText("maze-check-info")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("check-upload-maze"));

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/recognise`,
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    })

    expect(setToken).toHaveBeenCalledWith("newToken");

    expect(screen.queryByTestId("check-upload-maze")).not.toBeInTheDocument();
    expect(screen.getByTestId("check-recognised-maze")).toBeInTheDocument();
    expect(screen.getByTestId("token-refresher")).toBeInTheDocument();

    //Mock the API call
    axios.post.mockResolvedValue({ data: { token: "newToken2", checkedMaze: {} } });

    fireEvent.click(screen.getByTestId("check-recognised-maze"));

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


  it("renders but receives an error in step 1", async () => {
    //Mock the API call
    axios.post.mockResolvedValue({ data: { token: "newToken", recognisedMaze: {} } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <CheckMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByText("maze-check-title")).toBeInTheDocument();
    expect(screen.getByText("maze-check-info")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("check-upload-maze"));

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/recognise`,
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    })

    expect(setToken).toHaveBeenCalledWith("newToken");

    expect(screen.queryByTestId("check-upload-maze")).not.toBeInTheDocument();
    expect(screen.getByTestId("check-recognised-maze")).toBeInTheDocument();
    expect(screen.getByTestId("token-refresher")).toBeInTheDocument();

    //Mock the API call
    axios.post.mockRejectedValue({});

    fireEvent.click(screen.getByTestId("check-recognised-maze"));

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

      expect(screen.getByText("error-unknown")).toBeInTheDocument();
      expect(screen.getByTestId("check-recognised-maze")).toBeInTheDocument();
      expect(screen.getByTestId("token-refresher")).toBeInTheDocument();
    })
  });


  it("renders but receives NicknameInvalidFormatException in step 1", async () => {
    //Mock the API call
    axios.post.mockResolvedValue({ data: { token: "newToken", recognisedMaze: {} } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <CheckMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByText("maze-check-title")).toBeInTheDocument();
    expect(screen.getByText("maze-check-info")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("check-upload-maze"));

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/recognise`,
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    })

    expect(setToken).toHaveBeenCalledWith("newToken");

    expect(screen.queryByTestId("check-upload-maze")).not.toBeInTheDocument();
    expect(screen.getByTestId("check-recognised-maze")).toBeInTheDocument();
    expect(screen.getByTestId("token-refresher")).toBeInTheDocument();

    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "NicknameInvalidFormatException" } });

    fireEvent.click(screen.getByTestId("check-recognised-maze"));

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

      expect(screen.getByText("error-nickname-invalid-format")).toBeInTheDocument();
      expect(screen.getByTestId("check-recognised-maze")).toBeInTheDocument();
      expect(screen.getByTestId("token-refresher")).toBeInTheDocument();
    })
  });


  it("renders but receives NicknameNotUniqueException in step 1", async () => {
    //Mock the API call
    axios.post.mockResolvedValue({ data: { token: "newToken", recognisedMaze: {} } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <CheckMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByText("maze-check-title")).toBeInTheDocument();
    expect(screen.getByText("maze-check-info")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("check-upload-maze"));

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/recognise`,
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    })

    expect(setToken).toHaveBeenCalledWith("newToken");

    expect(screen.queryByTestId("check-upload-maze")).not.toBeInTheDocument();
    expect(screen.getByTestId("check-recognised-maze")).toBeInTheDocument();
    expect(screen.getByTestId("token-refresher")).toBeInTheDocument();

    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "NicknameNotUniqueException" } });

    fireEvent.click(screen.getByTestId("check-recognised-maze"));

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

      expect(screen.getByText("error-nickname-not-unique")).toBeInTheDocument();
      expect(screen.getByTestId("check-recognised-maze")).toBeInTheDocument();
      expect(screen.getByTestId("token-refresher")).toBeInTheDocument();
    })
  });


  it("renders but receives InvalidMazeIdException in step 1", async () => {
    //Mock the API call
    axios.post.mockResolvedValue({ data: { token: "newToken", recognisedMaze: {} } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <CheckMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByText("maze-check-title")).toBeInTheDocument();
    expect(screen.getByText("maze-check-info")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("check-upload-maze"));

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/recognise`,
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    })

    expect(setToken).toHaveBeenCalledWith("newToken");

    expect(screen.queryByTestId("check-upload-maze")).not.toBeInTheDocument();
    expect(screen.getByTestId("check-recognised-maze")).toBeInTheDocument();
    expect(screen.getByTestId("token-refresher")).toBeInTheDocument();

    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "InvalidMazeIdException" } });

    fireEvent.click(screen.getByTestId("check-recognised-maze"));

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

      expect(screen.getByText("error-invalid-maze-id")).toBeInTheDocument();
      expect(screen.getByTestId("check-recognised-maze")).toBeInTheDocument();
      expect(screen.getByTestId("token-refresher")).toBeInTheDocument();
    })
  });


  it("renders but receives InvalidPathException in step 1", async () => {
    //Mock the API call
    axios.post.mockResolvedValue({ data: { token: "newToken", recognisedMaze: {} } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <CheckMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByText("maze-check-title")).toBeInTheDocument();
    expect(screen.getByText("maze-check-info")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("check-upload-maze"));

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/recognise`,
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    })

    expect(setToken).toHaveBeenCalledWith("newToken");

    expect(screen.queryByTestId("check-upload-maze")).not.toBeInTheDocument();
    expect(screen.getByTestId("check-recognised-maze")).toBeInTheDocument();
    expect(screen.getByTestId("token-refresher")).toBeInTheDocument();

    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "InvalidPathException" } });

    fireEvent.click(screen.getByTestId("check-recognised-maze"));

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

      expect(screen.getByText("error-invalid-path")).toBeInTheDocument();
      expect(screen.getByTestId("check-recognised-maze")).toBeInTheDocument();
      expect(screen.getByTestId("token-refresher")).toBeInTheDocument();
    })
  });


  it("renders but receives InvalidMazeDimensionException in step 1", async () => {
    //Mock the API call
    axios.post.mockResolvedValue({ data: { token: "newToken", recognisedMaze: {} } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <CheckMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByText("maze-check-title")).toBeInTheDocument();
    expect(screen.getByText("maze-check-info")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("check-upload-maze"));

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/recognise`,
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    })

    expect(setToken).toHaveBeenCalledWith("newToken");

    expect(screen.queryByTestId("check-upload-maze")).not.toBeInTheDocument();
    expect(screen.getByTestId("check-recognised-maze")).toBeInTheDocument();
    expect(screen.getByTestId("token-refresher")).toBeInTheDocument();

    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "InvalidMazeDimensionException" } });

    fireEvent.click(screen.getByTestId("check-recognised-maze"));

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

      expect(screen.getByText("error-invalid-maze-dimension")).toBeInTheDocument();
      expect(screen.getByTestId("check-recognised-maze")).toBeInTheDocument();
      expect(screen.getByTestId("token-refresher")).toBeInTheDocument();
    })
  });


  it("renders but receives NotNumberInMazeException in step 1", async () => {
    //Mock the API call
    axios.post.mockResolvedValue({ data: { token: "newToken", recognisedMaze: {} } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <CheckMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByText("maze-check-title")).toBeInTheDocument();
    expect(screen.getByText("maze-check-info")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("check-upload-maze"));

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/recognise`,
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    })

    expect(setToken).toHaveBeenCalledWith("newToken");

    expect(screen.queryByTestId("check-upload-maze")).not.toBeInTheDocument();
    expect(screen.getByTestId("check-recognised-maze")).toBeInTheDocument();
    expect(screen.getByTestId("token-refresher")).toBeInTheDocument();

    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "NotNumberInMazeException" } });

    fireEvent.click(screen.getByTestId("check-recognised-maze"));

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

      expect(screen.getByText("error-not-number-in-maze")).toBeInTheDocument();
      expect(screen.getByTestId("check-recognised-maze")).toBeInTheDocument();
      expect(screen.getByTestId("token-refresher")).toBeInTheDocument();
    })
  });


  it("renders but receives unknown error in step 1", async () => {
    //Mock the API call
    axios.post.mockResolvedValue({ data: { token: "newToken", recognisedMaze: {} } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <CheckMaze />
      </TokenContext.Provider>
    );

    expect(screen.getByText("maze-check-title")).toBeInTheDocument();
    expect(screen.getByText("maze-check-info")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("check-upload-maze"));

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${BACKEND_URL}/maze/recognise`,
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    })

    expect(setToken).toHaveBeenCalledWith("newToken");

    expect(screen.queryByTestId("check-upload-maze")).not.toBeInTheDocument();
    expect(screen.getByTestId("check-recognised-maze")).toBeInTheDocument();
    expect(screen.getByTestId("token-refresher")).toBeInTheDocument();

    //Mock the API call
    axios.post.mockRejectedValue({ response: { data: "" } });

    fireEvent.click(screen.getByTestId("check-recognised-maze"));

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

      expect(screen.getByText("error-unknown-form")).toBeInTheDocument();
      expect(screen.getByTestId("check-recognised-maze")).toBeInTheDocument();
      expect(screen.getByTestId("token-refresher")).toBeInTheDocument();
    })
  });
});
