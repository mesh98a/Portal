import { defineConfig } from "vite";

console.log("Vite config loaded!");

export default defineConfig({
  server: {
    host: true,
    allowedHosts: [
      ".trycloudflare.com",
    ],
  },
});