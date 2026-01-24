import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  base: "/",
  plugins: [basicSsl()],
  server: {
    https: false,
    host: false, // wichtig für Android / AR / Netzwerk
  },
})