import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

import path from 'node:path';
resolve: {
  alias: {
    ('@');
    path.resolve(__dirname, 'src');
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
