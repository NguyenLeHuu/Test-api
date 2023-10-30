import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import MyComponent from "./MyComponent";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <MyComponent />
  </React.StrictMode>
);
