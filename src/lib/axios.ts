import axios from "axios";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api", // Vite-compatible
	// You can add default headers, timeouts, etc. here
});

export default api;
