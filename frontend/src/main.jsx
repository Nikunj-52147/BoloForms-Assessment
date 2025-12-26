import './index.css'
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

createRoot(document.getElementById("root")).render(
  
    <App />
  
);
