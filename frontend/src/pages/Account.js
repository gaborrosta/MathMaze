import React, { useState, useEffect, useContext, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Row, Col, Alert, Button, Tabs, Tab } from "react-bootstrap";
import { X } from "react-bootstrap-icons";
import axios from "axios";
import { BACKEND_URL } from "../utils/constants";
import TokenContext from "../utils/TokenContext";
import LoadingSpinner from "../components/LoadingSpinner";
import LocationsList from "../components/LocationsList";
import MazeModal from "../components/MazeModal";
import EditLocation from "../components/EditLocation";
import AccountSolutionsTab from "../components/AccountSolutionsTab";
import AccountSetNewPasswordTab from "../components/AccountSetNewPasswordTab";
import AccountMazeCards from "../components/AccountMazeCards";

/**
 * Account renders the set account page.
 *
 * @returns {React.Element} The Account component.
 */
export default function Account() {
  //Localisation
  const { t } = useTranslation();


  //Set the page title
  useEffect(() => { document.title = t("account-title") + " | " + t("app-name"); });


  //Token
  const { token, setToken } = useContext(TokenContext);
  const tokenRef = useRef(token);
  const setTokenRef = useRef(setToken);

  //Update refs on token change
  useEffect(() => {
    tokenRef.current = token;
    setTokenRef.current = setToken;
  }, [token, setToken]);


  //Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  //Download mazes and locations
  const [mazes, setMazes] = useState(null);
  const [locations, setLocations] = useState(null);


  //Selected location
  const [selectedLocation, setSelectedLocation] = useState("/");


  //Download mazes and locations on page load
  useEffect(() => {
    axios.get(`${BACKEND_URL}/maze/get-all?token=${tokenRef.current}`)
    .then(response => {
      setTokenRef.current(response.data.token);

      setTimeout(() => {
        setLoading(false);
        setMazes(response.data.mazes);
        setLocations(response.data.locations);
      }, 1000);
    })
    .catch(_ => {
      setError("error-unknown");
      setLoading(false);
    });
  }, []);


  //Actual tab
  const [key, setKey] = useState("maze");


  //Maze Modal
  const [maze, setMaze] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  //Open Maze Modal
  const openModal = (newMaze) => {
    setMaze(newMaze);
    setModalVisible(true);
  };

  //Close Maze Modal
  const closeModal = (_) => {
    setMaze("");
    setModalVisible(false);
  };

  //Update maze
  const mazeChanged = (newMaze) => {
    setMazes(mazes.map(maze => maze.id === newMaze.id ? newMaze : maze));
  }


  //EditLocation Modal
  const [editLocation, setEditLocation] = useState("");
  const [editLocationModalVisible, setEditLocationModalVisible] = useState(false);

  //Open EditLocation Modal
  const onEditLocation = (location) => {
    setEditLocation(location);
    setEditLocationModalVisible(true);
  }

  //Update mazes
  const mazesChanged = (newMazes) => {
    setMazes(newMazes);
  }

  //Update locations
  const locationsChanged = (newLocations) => {
    if (!newLocations.includes(selectedLocation)) {
      setSelectedLocation("/");
    }
    setLocations(newLocations);
  }


  //Downloaded solutions Tabs, data and error
  const [solutionsTabs, setSolutionsTabs] = useState([]);
  const [downloadedSolutions, setDownloadedSolutions] = useState({});
  const [downloadError, setDownloadError] = useState("");


  //Download solutions
  const addSolutionTab = (id) => {
    //Check if the tab exists
    if (!solutionsTabs.includes(id)) {
      setSolutionsTabs([...solutionsTabs, id]);
    }

    //Check if the solutions are already downloaded
    if (!downloadedSolutions[id]) {
      axios.get(`${BACKEND_URL}/maze/get-solutions?token=${token}&mazeId=${id}`)
      .then(response => {
        setTimeout(() => {
          setToken(response.data.token);
          setDownloadedSolutions({ ...downloadedSolutions, [id]: { data: response.data.solutions, selectedIndex: -1 }});
        }, 1000);
      })
      .catch(error => {
        if (!error.response) {
          setDownloadError("error-unknown");
          return;
        }

        switch (error.response.data) {
          case "InvalidMazeIdException":
            setDownloadError("error-save-maze-invalid-id");
            break;
          case "MazeOwnerException":
            setDownloadError("error-account-maze-owner");
            break;
          default:
            setDownloadError("error-unknown");
            break;
        }
      });
    }

    //Scroll to top
    window.scrollTo({top: 0, left: 0, behavior: "instant" });

    //Change tab
    setKey(id);
  };


  //Close solution tab
  const removeSolutionTab = (id) => {
    setSolutionsTabs(solutionsTabs.filter(tab => tab !== id));
    if (key === id) {
      setKey("maze");
    }
  };


  //Render the page
  return (
    <>
      <center>
        <h1>{t("account-title")}</h1>
      </center>
      <p>{t("account-info")}</p>

      {error && <Alert variant="danger">{t(error)}</Alert>}

      {loading ? <LoadingSpinner /> : error ? null : <>
        {solutionsTabs.length > 0 &&
          <div className="text-end">
            <Button className="mb-3" onClick={() => {
              setKey("maze");
              setSolutionsTabs([]);
              setDownloadedSolutions({});
            }}>
              {t("account-close-opened-solutions")}
            </Button>
          </div>
        }

        <Tabs id="profile-tab" className="mb-3" activeKey={key} onSelect={(k) => setKey(k)}>
          <Tab eventKey="maze" title={t("account-mazes")}>
            {mazes && mazes.length === 0 && <Alert variant="info">{t("no-mazes")}</Alert>}

            {mazes.length > 0 &&
              <Row>
                <Col xs={12} md={4}>
                  <div className="border p-3 m-2">
                    <p>{t("account-locations")}</p>
                    <LocationsList locations={locations} onLocationChange={setSelectedLocation} selectedLocation={selectedLocation} onEdit={onEditLocation} />
                    <Alert variant="info" className="mt-3">{t("account-locations-info")}</Alert>
                  </div>
                </Col>

                <AccountMazeCards mazes={mazes} selectedLocation={selectedLocation} addSolutionTab={addSolutionTab} openModal={openModal} />
              </Row>
            }

            <MazeModal data={maze} visible={modalVisible} setVisible={closeModal} locations={locations} changed={(maze, locations) => {mazeChanged(maze); locationsChanged(locations) }} />
            <EditLocation location={editLocation} visible={editLocationModalVisible} setVisible={setEditLocationModalVisible} changed={(mazes, locations) => {mazesChanged(mazes); locationsChanged(locations) }} />
          </Tab>
          <Tab eventKey="settings" title={t("account-settings")}>
            <AccountSetNewPasswordTab />
          </Tab>

          {solutionsTabs.map(tab =>
            <Tab
              eventKey={tab}
              title={
                <div>
                  {t("account-solution-for-maze-tab", { id: tab })}
                  <X data-testid="close" className="ms-2 border icon" size={22}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSolutionTab(tab);
                    }}
                  />
                </div>
              }
              key={tab}
            >
              <AccountSolutionsTab data={downloadedSolutions[tab]} error={downloadError} updateSelected={(newData) => {setDownloadedSolutions({ ...downloadedSolutions, [tab]: newData})}} />
            </Tab>
          )}
        </Tabs>
      </>}
    </>
  );
}
