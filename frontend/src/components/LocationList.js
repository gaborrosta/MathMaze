import React, { useState, useEffect, useRef } from "react";
import { ListGroup } from "react-bootstrap";

export default function LocationList({ locations, onLocationChange }) {
  const [selectedLocation, setSelectedLocation] = useState("/");

  const onLocationChangeRef = useRef(onLocationChange);

  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  useEffect(() => {
    if (onLocationChangeRef.current) {
      onLocationChangeRef.current(selectedLocation);
    }
  }, [selectedLocation]);

  return (
    <ListGroup>
      {locations.sort().map((location, index) => {
        const splitted = location.split("/");
        const indentation = splitted.length - 1;
        const displayableLocation = splitted[splitted.length - 2] + "/";
        return (
          <ListGroup.Item 
            key={index}
            action
            active={location === selectedLocation}
            onClick={(event) => {
              event.preventDefault();
              setSelectedLocation(location);
            }}
            style={{ paddingLeft: `${indentation}em` }}
          >
            {displayableLocation}
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
};
