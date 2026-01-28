import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  base: "/",
  plugins: [basicSsl()],
  server: {
    https: true,
<<<<<<< HEAD
    port: 5173,
=======
>>>>>>> 0fc2b4d93b7cda1c0d7d8ec2301313d3ccebbb59
    host: true, // wichtig für Android / AR / Netzwerk
  },
})