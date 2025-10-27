import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// IMPORTAR ESTILOS EN ORDEN CORRECTO
import "./styles/global.css";  // Estilos globales primero
import "./styles.css";          // Layout después

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);