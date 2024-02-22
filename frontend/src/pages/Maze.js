import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

const data = {
  height: 11,
  width: 11,
  start: [0, 0],
  end: [10, 10],
  data: [
    [
      "6 + 2", "1 + 0", "16 - 9", "18 - 11", "20 - 13", "17 - 10", "1 + 0", "13 - 4", "18 - 15", "12 - 11", "0 + 3",
    ],
    [
      "2 + 2", "16 - 9", "13 + 6", "1 + 12", "18 - 9", "0 + 7", "3 + 14", "13 - 8", "1 + 0", "5 + 10", "0 + 1",
    ],
    [
      "0 + 0", "17 - 16", "17 - 12", "11 + 2", "20 - 13", "7 + 4", "19 - 18", "13 - 8", "16 - 11", "0 + 1", "11 + 8",
    ],
    [
      "15 - 5", "1 + 6", "10 - 7", "0 + 1", "20 - 19", "4 + 7", "1 + 0", "11 - 4", "20 - 11", "16 - 15", "4 + 5",
    ],
    [
      "20 - 16", "11 - 10", "10 - 5", "18 - 11", "1 + 10", "11 + 8", "0 + 5", "0 + 3", "15 - 6", "12 - 9", "13 + 0",
    ],
    [
      "19 - 9", "15 - 14", "17 - 10", "10 - 3", "9 + 8", "12 - 7", "14 - 13", "15 + 0", "14 + 1", "18 - 17", "13 - 10",
    ],
    [
      "10 - 0", "10 - 1", "19 - 18", "17 + 2", "0 + 4", "13 - 3", "0 + 4", "4 + 2", "10 - 4", "15 - 9", "11 - 1",
    ],
    [
      "5 + 1", "9 + 0", "12 - 3", "2 + 1", "17 - 15", "18 - 17", "17 + 2", "13 + 4", "17 - 8", "12 - 7", "15 - 13",
    ],
    [
      "13 - 3", "4 + 4", "12 + 6", "3 + 1", "15 + 1", "1 + 14", "10 - 9", "20 - 19", "14 - 5", "20 - 19", "2 + 2",
    ],
    [
      "13 - 10", "10 - 5", "0 + 1", "17 - 12", "15 - 6", "10 - 9", "0 + 1", "1 + 14", "17 - 16", "0 + 1", "11 + 3",
    ],
    [
      "2 + 7", "3 + 2", "1 + 0", "9 + 0", "0 + 1", "3 + 4", "0 + 1", "1 + 4", "0 + 1", "4 + 3", "2 + 2",
    ],
  ],
};

export default function Maze() {
  const { t } = useTranslation();

  useEffect(() => { document.title = t("maze-title") + " | " + t("app-name"); });

  return (
    <>
      <center>
        <h1>{t("maze-title")}</h1>
      </center>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.</p>
      <div className="maze" style={{gridTemplateColumns: `repeat(${data.width}, 1fr)`, minWidth: `${75 * data.width}px`}}>
        {Array.from({length: data.height}).map((_, i) => (
          Array.from({length: data.width}).map((__, j) => {
            const isStart = data.start[0] === i && data.start[1] === j;
            const isEnd = data.end[0] === i && data.end[1] === j;
            return (
              <div key={`${i}-${j}`} className="maze-cell">
                {!isStart && !isEnd && <div className="maze-cell-corner" />}
                <div className="maze-cell-content" style={{ bottom: isStart || isEnd ? "0" : "50%" }} >
                  {isStart ? "Start" : isEnd ? "Finish" : data.data[i][j]}
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
}
