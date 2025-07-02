import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import "./index.css";
import { store } from "./redux/store";

const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error(
		"Root element not found. Ensure there is a <div id='root'> in your HTML."
	);
}

const root = createRoot(rootElement);
root.render(
	<StrictMode>
		<Provider store={store}>
			<App />
		</Provider>
	</StrictMode>
);
