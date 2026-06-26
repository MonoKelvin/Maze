import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron/simple';
import path from 'path';

export default defineConfig({
    plugins: [
        vue(),
        electron({
            main: {
                entry: 'electron/main.ts',
            },
            preload: {
                input: 'electron/preload.ts',
            },
            renderer: {},
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    clearScreen: false,
    server: {
        port: 5173,
        strictPort: false,
    },
    envPrefix: ['VITE_', 'ELECTRON_'],
    build: {
        target: 'es2020',
        outDir: 'dist',
        assetsInlineLimit: 4096,
        sourcemap: false,
        rollupOptions: {
            output: {
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
            },
        },
    },
});
