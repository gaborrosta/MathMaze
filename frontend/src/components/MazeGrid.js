import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ToggleButton } from "react-bootstrap";

const MazeGrid = ({ data }) => {
  const { t } = useTranslation();

  const [showPath, setShowPath] = useState(false);

  useEffect(() => {
    setShowPath(false);
  }, [data]);

  return (
    <>
      <ToggleButton
        id="toggle-check"
        type="checkbox"
        variant="outline-primary"
        checked={showPath}
        value="1"
        onChange={(e) => setShowPath(e.currentTarget.checked)}
        className="mb-2"
      >
        {showPath ? t("maze-path-hide") : t("maze-path-show")}
      </ToggleButton>

      <p>
        {t("maze-path-length", { length: data.path.length - 2 })}
      </p>

      <div className="maze" style={{gridTemplateColumns: `repeat(${data.width}, 1fr)`, minWidth: `${75 * data.width}px`}}>
        {Array.from({length: data.height}).map((_, i) => (
          Array.from({length: data.width}).map((__, j) => {
            const isStart = data.start[0] === j && data.start[1] === i;
            const isEnd = data.end[0] === j && data.end[1] === i;
            const isPath = data.path.some(coord => coord.x === j && coord.y === i);
            return (
              <div key={`${i}-${j}`} className={isPath && showPath ? "maze-cell yellow" : "maze-cell" }>
                {!isStart && !isEnd && <div className="maze-cell-corner" />}
                <div className="maze-cell-content" style={{ bottom: isStart || isEnd ? "0" : "50%" }} >
                  {isStart ? t("maze-start") : isEnd ? t("maze-end") : data.data[i][j]}
                </div>
                {!isStart && !isEnd && (
                  <div className="maze-cell-bottom">
                    <div className="maze-cell-bottom-left" />
                    <div className="maze-cell-bottom-right" />
                  </div>
                )}
              </div>
            );
          })
        ))}
      </div>
    </>
  );
};

export default MazeGrid;
