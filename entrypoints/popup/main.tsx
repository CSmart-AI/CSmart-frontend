import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./style.css";

// biome-ignore lint/style/noNonNullAssertion: basic method from wxt
ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
