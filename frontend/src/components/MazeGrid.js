import React from "react";
import { useTranslation } from "react-i18next";

const MazeGrid = ({ data }) => {
  const { t } = useTranslation();

  return (
    <div className="maze" style={{gridTemplateColumns: `repeat(${data.width}, 1fr)`, minWidth: `${75 * data.width}px`}}>
      {Array.from({length: data.height}).map((_, i) => (
        Array.from({length: data.width}).map((__, j) => {
          const isStart = data.start[0] === j && data.start[1] === i;
          const isEnd = data.end[0] === j && data.end[1] === i;
          return (
            <div key={`${i}-${j}`} className="maze-cell">
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
  );
};

export default MazeGrid;
