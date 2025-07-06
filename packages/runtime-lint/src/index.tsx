"use client";
import { createRoot } from "react-dom/client";
import styles from "./output.css";
import { Widget } from "./widget/index.js";

function lint() {
  console.log("Runtime linting started");
  const rootContainer = document.createElement("div");
  rootContainer.id = "runtime-lint-root";

  const shadowRoot = rootContainer.attachShadow({ mode: "open" });
  const cssStyles = document.createElement("style");
  cssStyles.textContent = styles;

  shadowRoot.appendChild(cssStyles);

  document.body.appendChild(rootContainer);

  const root = createRoot(shadowRoot);
  root.render(<Widget />);
}

if (typeof window !== "undefined") {
  lint();
}
