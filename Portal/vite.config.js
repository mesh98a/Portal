import { defineConfig } from 'vite'

export default defineConfig({
  base: "/Portal/",
  server: {
    host: true,
    allowedHosts: [
      ".trycloudflare.com",
    ],
  },
});
