import React, { useState, useEffect, useRef } from "react";
import { ListGroup } from "react-bootstrap";
import { Pencil } from "react-bootstrap-icons";

export default function LocationList({ locations, selectedLocation, onLocationChange, onEdit }) {
  const [actualSelectedLocation, setActualSelectedLocation] = useState(selectedLocation);

  const onLocationChangeRef = useRef(onLocationChange);

  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  useEffect(() => {
    setActualSelectedLocation(selectedLocation);
  }, [selectedLocation]);

  useEffect(() => {
    if (onLocationChangeRef.current) {
      onLocationChangeRef.current(actualSelectedLocation);
    }
  }, [actualSelectedLocation]);

  return (
    <ListGroup>
      {locations.sort().map((location, index) => {
        const split = location.split("/");
        const indentation = split.length - 1;
        const displayableLocation = split[split.length - 2] + "/";
        return (
          <ListGroup.Item 
            key={index}
            action
            active={location === actualSelectedLocation}
            onClick={(event) => {
              event.preventDefault();
              setActualSelectedLocation(location);
            }}
            style={{ paddingLeft: `${indentation}em` }}
            className="d-flex justify-content-between align-items-center"
          >
            {displayableLocation}
            {(location !== "/" && onEdit) && (
              <Pencil className="p-1 border icon" size={22} onClick={(event) => {
                event.stopPropagation();
                onEdit([split.slice(0,-2).join("/") + "/", displayableLocation.slice(0, -1)]);
              }} />
            )}
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
};
