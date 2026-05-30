import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.scss";
import "./services/i18n";

//Render the App component into the root element
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
