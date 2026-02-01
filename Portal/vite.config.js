import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  base: "/",
  plugins: [basicSsl()],
  server: {
    https: true,
    port: 5173,
    host: true, // wichtig für Android / AR / Netzwerk
  },
})
