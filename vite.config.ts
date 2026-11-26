
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';

const rootDir = import.meta.dirname;

export default defineConfig(() => {
  return {
    // GitHub Pages repository path
    base: '/Bleed---For---Life./',

    plugins: [
      react(),
      tailwindcss(),

      // Copy public and unbundled source assets
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',

        closeBundle(error?: Error): void {
          if (error) return;

          const distDir = path.resolve(rootDir, 'dist');
          const srcAssets = path.resolve(rootDir, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');

          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {
              recursive: true,
              force: true,
            });
          }
        },
      },
    ],

    resolve: {
      alias: {
        '@': rootDir,
      },
    },

    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,

      hmr: process.env.DISABLE_HMR !== 'true',

      watch:
        process.env.DISABLE_HMR === 'true'
          ? null
          : {},
    },
  };
});
