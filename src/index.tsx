import React from "react";
import App from "./App";
import "./styles/globals.css";
import ReactDOM from "react-dom/client";

// strict mode에서는 동작하지 않음.
// https://github.com/atlassian/react-beautiful-dnd/issues/2399
const rootElement = document.getElementById("root")!;
ReactDOM.createRoot(rootElement).render(
  // <React.StrictMode>
  // </React.StrictMode>
  <App />
);
