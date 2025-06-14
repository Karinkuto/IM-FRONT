import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import { store } from "./redux/store";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error(
		"Root element not found. Ensure there is a <div id='root'> in your HTML.",
	);
}

const root = ReactDOM.createRoot(rootElement);
root.render(
	<React.StrictMode>
		<Provider store={store}>
			<App />
		</Provider>
	</React.StrictMode>,
);
