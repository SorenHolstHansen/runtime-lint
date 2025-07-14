import { render } from "preact";
import styles from "./output.css";
import { Widget } from "./index.js";

export function initWidget() {
  if (typeof window === "undefined") return;

  console.log("Runtime linting started");
  const rootContainer = document.createElement("div");
  rootContainer.id = "runtime-lint-root";

  const shadowRoot = rootContainer.attachShadow({ mode: "open" });
  const cssStyles = document.createElement("style");
  cssStyles.textContent = styles;

  shadowRoot.appendChild(cssStyles);

  document.body.appendChild(rootContainer);

  render(<Widget />, shadowRoot);
}
