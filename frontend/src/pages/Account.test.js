/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { toBeInTheDocument } from "@testing-library/jest-dom";
import axios from "axios";
import { BACKEND_URL } from "../utils/constants";
import TokenContext from "../utils/TokenContext";
import Account from "./Account";

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

//Mock the timers
jest.useFakeTimers();

//Mock LocationsList
jest.mock("../components/LocationsList", () => ({ locations, selectedLocation, onLocationChange, onEdit }) => <button data-testid="locations-lists" onClick={() => {onEdit("/edit")}}>{selectedLocation}</button>);

//Mock AccountMazeCards
jest.mock("../components/AccountMazeCards", () => ({ mazes, selectedLocation, addSolutionTab, openModal }) => <div><button onClick={() => {addSolutionTab(1)}}>add-tab</button><button onClick={() => {openModal({ id: 1 })}}>open-modal</button></div>);

//Mock MazeModal
jest.mock("../components/MazeModal", () => ({ visible, setVisible, data, locations, changed }) => <div>{visible && <><button data-testid="maze-modal" onClick={() => {changed({ id: 1 }, ["/"])}}>{data.id}</button><button data-testid="maze-modal-close" onClick={() => {setVisible(false)}} /></>}</div>);

//Mock EditLocation
jest.mock("../components/EditLocation", () => ({ visible, setVisible, location, changed }) => <button data-testid="edit-location" onClick={() => {changed([], [])}}>{location}</button>);

//Mock AccountSetNewPasswordTab
jest.mock("../components/AccountSetNewPasswordTab", () => () => <div data-testid="password" />);

//Mock AccountSolutionsTab
jest.mock("../components/AccountSolutionsTab", () => ({ data, updateSelected, error }) => <div><div data-testid="solutions">{error}</div><button data-testid="solutions-tab" onClick={() => {updateSelected({})}} /></div>);

//Mock axios to control API calls
jest.mock("axios");


//The test suite
describe("Account", () => {
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


  it("renders with error", async () => {
    //Mock the API call
    axios.get.mockRejectedValue({});

    //Render the component
    render(<Account />);

    await waitFor(() => {
      expect(screen.getByText("account-title")).toBeInTheDocument();
      expect(screen.getByText("account-info")).toBeInTheDocument();
      expect(screen.getByText("error-unknown")).toBeInTheDocument();
    });
  });


  it("renders properly with no maze", async () => {
    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", mazes: [], locations: [] } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <Account />
      </TokenContext.Provider>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/get-all?token=`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
      expect(setToken).toHaveBeenCalledWith("token");
    });

    await waitFor(() => {
      expect(screen.getByText("no-mazes")).toBeInTheDocument();
    });
  });


  it("renders properly with no maze and clicks on settings", async () => {
    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", mazes: [], locations: [] } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <Account />
      </TokenContext.Provider>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/get-all?token=`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
      expect(setToken).toHaveBeenCalledWith("token");
    });

    await waitFor(() => {
      expect(screen.getByText("no-mazes")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("account-settings"));
  });


  it("renders properly with 2 mazes for edit location", async () => {
    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", mazes: [ mockMaze, mockMaze2 ], locations: [ "/" ] } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <Account />
      </TokenContext.Provider>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/get-all?token=`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
      expect(setToken).toHaveBeenCalledWith("token");
    });

    expect(screen.getByTestId("locations-lists")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("locations-lists"));

    await waitFor(() => {
      expect(screen.getByTestId("edit-location")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("edit-location"));

    await waitFor(() => {
      expect(screen.getByText("no-mazes")).toBeInTheDocument();
    });
  });


  it("renders properly with 2 mazes for maze modal", async () => {
    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", mazes: [ mockMaze, mockMaze2 ], locations: [ "/" ] } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <Account />
      </TokenContext.Provider>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/get-all?token=`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
      expect(setToken).toHaveBeenCalledWith("token");
    });

    expect(screen.getByText("open-modal")).toBeInTheDocument;

    fireEvent.click(screen.getByText("open-modal"));

    await waitFor(() => {
      expect(screen.getByTestId("maze-modal")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("maze-modal"));
    fireEvent.click(screen.getByTestId("maze-modal-close"));

    await waitFor(() => {
      expect(screen.queryByTestId("maze-modal")).not.toBeInTheDocument();
    });
  });


  it("renders properly with 2 mazes and adds tab", async () => {
    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", mazes: [ mockMaze, mockMaze2 ], locations: [ "/" ] } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <Account />
      </TokenContext.Provider>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/get-all?token=`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
      expect(setToken).toHaveBeenCalledWith("token");
    });

    expect(screen.getByText("add-tab")).toBeInTheDocument();

    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", solutions: [{ id: 1 }] } });

    fireEvent.click(screen.getByText("add-tab"));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/get-solutions?token=&mazeId=1`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByText("account-solution-for-maze-tab")).toBeInTheDocument();
      expect(screen.getByTestId("solutions")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("add-tab"));

    await waitFor(() => {
      expect(setToken).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByText("account-solution-for-maze-tab")).toBeInTheDocument();
      expect(screen.getByTestId("solutions")).toBeInTheDocument();
    });
  });


  it("renders properly with 2 mazes and adds tab but receives an error", async () => {
    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", mazes: [ mockMaze, mockMaze2 ], locations: [ "/" ] } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <Account />
      </TokenContext.Provider>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/get-all?token=`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
      expect(setToken).toHaveBeenCalledWith("token");
    });

    expect(screen.getByText("add-tab")).toBeInTheDocument();

    //Mock the API call
    axios.get.mockRejectedValue({});

    fireEvent.click(screen.getByText("add-tab"));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/get-solutions?token=&mazeId=1`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText("account-solution-for-maze-tab")).toBeInTheDocument();
      expect(screen.getByText("error-unknown")).toBeInTheDocument();
    });
  });


  it("renders properly with 2 mazes and adds tab but receives InvalidMazeIdException", async () => {
    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", mazes: [ mockMaze, mockMaze2 ], locations: [ "/" ] } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <Account />
      </TokenContext.Provider>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/get-all?token=`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
      expect(setToken).toHaveBeenCalledWith("token");
    });

    expect(screen.getByText("add-tab")).toBeInTheDocument();

    //Mock the API call
    axios.get.mockRejectedValue({ response: { data: "InvalidMazeIdException" } });

    fireEvent.click(screen.getByText("add-tab"));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/get-solutions?token=&mazeId=1`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText("account-solution-for-maze-tab")).toBeInTheDocument();
      expect(screen.getByText("error-save-maze-invalid-id")).toBeInTheDocument();
    });
  });


  it("renders properly with 2 mazes and adds tab but receives MazeOwnerException", async () => {
    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", mazes: [ mockMaze, mockMaze2 ], locations: [ "/" ] } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <Account />
      </TokenContext.Provider>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/get-all?token=`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
      expect(setToken).toHaveBeenCalledWith("token");
    });

    expect(screen.getByText("add-tab")).toBeInTheDocument();

    //Mock the API call
    axios.get.mockRejectedValue({ response: { data: "MazeOwnerException" } });

    fireEvent.click(screen.getByText("add-tab"));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/get-solutions?token=&mazeId=1`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText("account-solution-for-maze-tab")).toBeInTheDocument();
      expect(screen.getByText("error-account-maze-owner")).toBeInTheDocument();
    });
  });


  it("renders properly with 2 mazes and adds tab but receives unknown error", async () => {
    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", mazes: [ mockMaze, mockMaze2 ], locations: [ "/" ] } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <Account />
      </TokenContext.Provider>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/get-all?token=`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
      expect(setToken).toHaveBeenCalledWith("token");
    });

    expect(screen.getByText("add-tab")).toBeInTheDocument();

    //Mock the API call
    axios.get.mockRejectedValue({ response: { data: "" } });

    fireEvent.click(screen.getByText("add-tab"));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/get-solutions?token=&mazeId=1`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText("account-solution-for-maze-tab")).toBeInTheDocument();
      expect(screen.getByText("error-unknown")).toBeInTheDocument();
    });
  });


  it("renders properly with 2 mazes, adds tab and remove all", async () => {
    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", mazes: [ mockMaze, mockMaze2 ], locations: [ "/" ] } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <Account />
      </TokenContext.Provider>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/get-all?token=`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
      expect(setToken).toHaveBeenCalledWith("token");
    });

    expect(screen.getByText("add-tab")).toBeInTheDocument();

    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", solutions: [{ id: 1 }] } });

    fireEvent.click(screen.getByText("add-tab"));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/get-solutions?token=&mazeId=1`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByText("account-solution-for-maze-tab")).toBeInTheDocument();
      expect(screen.getByTestId("solutions")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("add-tab"));

    await waitFor(() => {
      expect(setToken).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByText("account-solution-for-maze-tab")).toBeInTheDocument();
      expect(screen.getByTestId("solutions")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("account-close-opened-solutions"));

    await waitFor(() => {
      expect(screen.queryByText("account-solution-for-maze-tab")).not.toBeInTheDocument();
      expect(screen.queryByTestId("solutions")).not.toBeInTheDocument();
    });
  });


  it("renders properly with 2 mazes, adds tab and remove one", async () => {
    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", mazes: [ mockMaze, mockMaze2 ], locations: [ "/" ] } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <Account />
      </TokenContext.Provider>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/get-all?token=`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
      expect(setToken).toHaveBeenCalledWith("token");
    });

    expect(screen.getByText("add-tab")).toBeInTheDocument();

    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", solutions: [{ id: 1 }] } });

    fireEvent.click(screen.getByText("add-tab"));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/get-solutions?token=&mazeId=1`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByText("account-solution-for-maze-tab")).toBeInTheDocument();
      expect(screen.getByTestId("solutions")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("add-tab"));

    await waitFor(() => {
      expect(setToken).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByText("account-solution-for-maze-tab")).toBeInTheDocument();
      expect(screen.getByTestId("solutions")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("close"));

    await waitFor(() => {
      expect(screen.queryByText("account-solution-for-maze-tab")).not.toBeInTheDocument();
      expect(screen.queryByTestId("solutions")).not.toBeInTheDocument();
    });
  });


  it("renders properly with 2 mazes, adds tab and remove one while displaying maze list", async () => {
    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", mazes: [ mockMaze, mockMaze2 ], locations: [ "/" ] } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <Account />
      </TokenContext.Provider>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/get-all?token=`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
      expect(setToken).toHaveBeenCalledWith("token");
    });

    expect(screen.getByText("add-tab")).toBeInTheDocument();

    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", solutions: [{ id: 1 }] } });

    fireEvent.click(screen.getByText("add-tab"));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/get-solutions?token=&mazeId=1`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByText("account-solution-for-maze-tab")).toBeInTheDocument();
      expect(screen.getByTestId("solutions")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("add-tab"));

    await waitFor(() => {
      expect(setToken).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByText("account-solution-for-maze-tab")).toBeInTheDocument();
      expect(screen.getByTestId("solutions")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("account-mazes"));

    fireEvent.click(screen.getByTestId("close"));

    await waitFor(() => {
      expect(screen.queryByText("account-solution-for-maze-tab")).not.toBeInTheDocument();
      expect(screen.queryByTestId("solutions")).not.toBeInTheDocument();
    });
  });


  it("renders properly with 2 mazes, adds tab and update", async () => {
    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", mazes: [ mockMaze, mockMaze2 ], locations: [ "/" ] } });

    //Mock the setToken function
    const setToken = jest.fn((a) => {});

    //Render the component
    render(
      <TokenContext.Provider value={{ token: "", setToken: setToken }}>
        <Account />
      </TokenContext.Provider>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/get-all?token=`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
      expect(setToken).toHaveBeenCalledWith("token");
    });

    expect(screen.getByText("add-tab")).toBeInTheDocument();

    //Mock the API call
    axios.get.mockResolvedValue({ data: { token: "token", solutions: [{ id: 1 }] } });

    fireEvent.click(screen.getByText("add-tab"));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/get-solutions?token=&mazeId=1`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByText("account-solution-for-maze-tab")).toBeInTheDocument();
      expect(screen.getByTestId("solutions")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("add-tab"));

    await waitFor(() => {
      expect(setToken).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByText("account-solution-for-maze-tab")).toBeInTheDocument();
      expect(screen.getByTestId("solutions")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("solutions-tab"));

    fireEvent.click(screen.getByText("add-tab"));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${BACKEND_URL}/maze/get-solutions?token=&mazeId=1`);
    });

    await act(async () => {
      //Fast-forward timers
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(setToken).toHaveBeenCalledTimes(2);
    });
  });
});
