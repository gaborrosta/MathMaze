import React, { useState, useEffect, useRef } from "react";
import { ListGroup } from "react-bootstrap";
import { Pencil } from "react-bootstrap-icons";

/**
 * LocationsList displays a list of locations.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Array} props.locations - The array of locations to display.
 * @param {string} props.selectedLocation - The currently selected location.
 * @param {Function} props.onLocationChange - The function to call when the selected location changes.
 * @param {Function} props.onEdit - An optional function to call when the edit icon is clicked. If it is not present, the edit icon is not displayed.
 *
 * @returns {React.Element} The LocationsList component.
 */
export default function LocationsList({ locations, selectedLocation, onLocationChange, onEdit }) {
  //Check the parameters
  checkParameters(locations, selectedLocation, onLocationChange, onEdit);


  //The actually selected location
  const [actualSelectedLocation, setActualSelectedLocation] = useState(selectedLocation);

  //Update the actually selected location state when the selectedLocation changes
  useEffect(() => {
    setActualSelectedLocation(selectedLocation);
  }, [selectedLocation]);


  //A ref to the onLocationChange function
  const onLocationChangeRef = useRef(onLocationChange);

  //Update the ref when the onLocationChange changes
  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);


  //Call the onLocationChange function when the selected location changes
  useEffect(() => {
    if (onLocationChangeRef.current) {
      onLocationChangeRef.current(actualSelectedLocation);
    }
  }, [actualSelectedLocation]);


  //Render the component
  return (
    <ListGroup>
      {locations.sort().map((location, index) => {
        //Split the location string into parts
        const split = location.split("/");

        //Calculate the indentation level based on the number of parts
        const indentation = split.length - 1;

        //Get the displayable location string
        const displayableLocation = split[split.length - 2] + "/";

        return (
          <ListGroup.Item 
            key={index}
            action
            active={location === actualSelectedLocation}
            onClick={(e) => {
              e.preventDefault();
              setActualSelectedLocation(location);
            }}
            style={{ paddingLeft: `${indentation}em` }}
            className="d-flex justify-content-between align-items-center"
          >
            {displayableLocation}
            {(location !== "/" && onEdit) && (
              <Pencil data-testid="edit" className="p-1 border icon" size={22} onClick={(e) => {
                e.stopPropagation();
                onEdit([split.slice(0,-2).join("/") + "/", displayableLocation.slice(0, -1)]);
              }} />
            )}
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
};


/**
 * Checks the parameters passed to the LocationsList component.
 */
function checkParameters(locations, selectedLocation, onLocationChange, onEdit) {
  if (locations === undefined) {
    throw new Error("locations is required.");
  }
  if (!Array.isArray(locations)) {
    throw new Error("locations must be an array.");
  }
  if (locations.length === 0) {
    throw new Error("locations must not be empty.");
  }
  if (locations.some(x => typeof x !== "string")) {
    throw new Error("locations must be an array of strings.");
  }
  if (locations.some(x => !x.startsWith("/"))) {
    throw new Error("locations must be an array of strings that start with '/'.");
  }
  if (locations.some(x => !x.endsWith("/"))) {
    throw new Error("locations must be an array of strings with ends with '/'.");
  }

  if (selectedLocation === undefined) {
    throw new Error("selectedLocation is required.");
  }
  if (typeof selectedLocation !== "string") {
    throw new Error("selectedLocation must be a string.");
  }
  if (!selectedLocation.startsWith("/")) {
    throw new Error("selectedLocation must start with '/'.");
  }
  if (!selectedLocation.endsWith("/")) {
    throw new Error("selectedLocation must end with '/'.");
  }
  if (!locations.includes(selectedLocation)) {
    throw new Error("selectedLocation must be in locations.");
  }

  if (onLocationChange === undefined) {
    throw new Error("onLocationChange is required.");
  }
  if (typeof onLocationChange !== "function") {
    throw new Error("onLocationChange must be a function.");
  }
  if (onLocationChange.length !== 1) {
    throw new Error("onLocationChange must have 1 parameter.");
  }

  if (onEdit !== undefined) {
    if (typeof onEdit !== "function") {
      throw new Error("onEdit must be a function.");
    }
    if (onEdit.length !== 1) {
      throw new Error("onEdit must have 1 parameter.");
    }
  }
}
