import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Form } from "react-bootstrap";

const GRID_WINDOW_SIZE = 5;

export default function MazeOnlineSolve({ data })  {
  const { t } = useTranslation();

  const mazeRef = useRef(null);
  const inputRef = useRef(null);

  const [selectedCell, setSelectedCell] = useState({x: 0, y: 0});
  const [gridShift, setGridShift] = useState({x: 0, y: 0});
  const [isInputActive, setIsInputActive] = useState(false);
  const [isKeyActive, setIsKeyActive] = useState(true);

  const start = {x: data.start[0], y: data.start[1]};
  const end = {x: data.end[0], y: data.end[1]};

  const [tempValue, setTempValue] = useState("");
  const [grid, setGrid] = useState(Array(data.height).fill().map(() => Array(data.width).fill("")));
  const [path, setPath] = useState([start, end]);

  useEffect(() => {
    mazeRef.current.scrollIntoView({ behavior: "smooth" });
    document.getElementById("cell-0-0").focus();
  }, []);

  useEffect(() => {
    if (isInputActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInputActive]);

  useEffect(() => {
    if (isKeyActive && mazeRef.current) {
      mazeRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isKeyActive]);

  const handleCellSelection = (x, y) => {
    if ((x !== start.x || y !== start.y) && (x !== end.x || y !== end.y)) {
      if (path.some(cell => cell.x === x && cell.y === y)) {
        setPath(prevPath => prevPath.filter(cell => cell.x !== x || cell.y !== y));
      } else {
        setPath(prevPath => [...prevPath, {x: x, y: y}]);
      }
    }
  };

  const handleKeyDown = (event) => {
    if (!isKeyActive) return;

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Enter", "x", "X"].includes(event.key)) {
      event.preventDefault();
    }

    if (isInputActive) {
      if (event.key === "Enter") {
        setIsInputActive(false);
        const newGrid = [...grid];
        newGrid[gridShift.y + selectedCell.y][gridShift.x + selectedCell.x] = tempValue;
        setGrid(newGrid);
        setTempValue("");
        document.getElementById(`cell-${selectedCell.x}-${selectedCell.y}`).focus();
      }
      return;
    }

    let {x, y} = selectedCell;
    let {x: shiftX, y: shiftY} = gridShift;

    switch(event.key) {
      case "ArrowUp":
        if(y > 0) y--;
        else if(shiftY > 0) shiftY--;
        break;
      case "ArrowDown":
        if(y < GRID_WINDOW_SIZE - 1) y++;
        else if(shiftY < data.height - GRID_WINDOW_SIZE) shiftY++;
        break;
      case "ArrowLeft":
        if(x > 0) x--;
        else if(shiftX > 0) shiftX--;
        break;
      case "ArrowRight":
        if(x < GRID_WINDOW_SIZE - 1) x++;
        else if(shiftX < data.width - GRID_WINDOW_SIZE) shiftX++;
        break;
      case " ":
        setIsInputActive(true);
        setTempValue(grid[shiftY + y][shiftX + x]);
        break;
      case "Enter":
        setIsInputActive(false);
        break;
      case "x":
      case "X":
        handleCellSelection(shiftX + x, shiftY + y);
        break;
      case "Escape":
        setIsKeyActive(false);
        break;
      default:
        return;
    }
    setSelectedCell({x, y});
    setGridShift({x: shiftX, y: shiftY});
    document.getElementById(`cell-${x}-${y}`).focus();
  };

  const handleInputChange = (event) => {
    setTempValue(event.target.value);
  };

  return (
    <center>
      <div ref={mazeRef} className="maze mb-3" style={{width: "100vw", height: "100vh", maxWidth: "100vh", maxHeight: "100vw", gridTemplateColumns: `repeat(${GRID_WINDOW_SIZE}, 1fr)`}}>
        {Array.from({length: GRID_WINDOW_SIZE}).map((_, i) => (
          Array.from({length: GRID_WINDOW_SIZE}).map((__, j) => {
            const actualX = gridShift.x + j;
            const actualY = gridShift.y + i;
            const isStart = data.start[0] === actualX && data.start[1] === actualY;
            const isEnd = data.end[0] === actualX && data.end[1] === actualY;
            const isPath = path.some(cell => cell.x === actualX && cell.y === actualY);

            return (
              <div 
                id={`cell-${j}-${i}`} 
                key={`${j}-${i}`} 
                className={`maze-cell-solving ${selectedCell.x === j && selectedCell.y === i ? "yellow" : ""} ${isPath ? "path" : ""}`} 
                tabIndex="0"
                onKeyDown={handleKeyDown}
                onClick={() => { setSelectedCell({x: j, y: i}); setIsKeyActive(true); }}
                onDoubleClick={() => { handleCellSelection(actualX, actualY); setIsKeyActive(true); }}
                style={{ userSelect: "none" }}
              >
                <div className="maze-cell-content" style={{ height: "100%" }}>
                  <div style={{ display: "block" }}>
                    {isStart ? t("maze-start") : isEnd ? t("maze-end") : data.data[actualY][actualX]}
                    <br />
                    {(selectedCell.x === j && selectedCell.y === i && isInputActive && !isStart && !isEnd) ? <>
                      <Form.Control
                        ref={inputRef}
                        type="number"
                        value={tempValue || grid[actualY][actualX]}
                        onChange={handleInputChange}
                        style={{ width: "50%" }}
                      />
                    </> : grid[actualY][actualX]}
                  </div>
                </div>
              </div>
            );
          })
        ))}
      </div>
    </center>
  );
};
