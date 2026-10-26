/**
 * Configuración de Vite. En desarrollo, redirige /api al servidor Express (puerto 3000).
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:3000' } }, // desarrollo local
});
