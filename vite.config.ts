import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@/redux": path.resolve(__dirname, "./src/redux"),
			"@/components": path.resolve(__dirname, "./src/components"),
			"@/ui": path.resolve(__dirname, "./src/components/ui"),
		},
	},
});
