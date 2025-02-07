import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import react from '@vitejs/plugin-react';

const packages = fs.readdirSync(path.resolve(__dirname, '../../packages'));
const aliases = packages.reduce((acc, dirName) => {
    if (dirName === 'demo') return acc;
    const packageJson = require(path.resolve(
        __dirname,
        '../../packages',
        dirName,
        'package.json'
    ));
    acc[packageJson.name] = path.resolve(
        __dirname,
        `${path.resolve('../..')}/packages/${packageJson.name}/src`
    );
    return acc;
}, {});

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    define: {
        'process.env': process.env,
    },
    server: {
        port: 8000,
        open: true,
    },
    base: './',
    esbuild: {
        keepNames: true,
    },
    build: {
        sourcemap: true,
    },
    resolve: {
        preserveSymlinks: true,
        alias: [
            {
                find: 'ra-core',
                replacement: path.resolve(
                    __dirname,
                    '../../node_modules/ra-core/src'
                ),
            },
            {
                find: 'ra-i18n-polyglot',
                replacement: path.resolve(
                    __dirname,
                    '../../node_modules/ra-i18n-polyglot/src'
                ),
            },
            {
                find: 'ra-language-english',
                replacement: path.resolve(
                    __dirname,
                    '../../node_modules/ra-language-english/src'
                ),
            },
            {
                find: 'ra-ui-materialui',
                replacement: path.resolve(
                    __dirname,
                    '../../node_modules/ra-ui-materialui/src'
                ),
            },
            {
                find: 'react-admin',
                replacement: path.resolve(
                    __dirname,
                    '../../node_modules/react-admin/src'
                ),
            },
            // we need to manually follow the symlinks for local packages to allow deep HMR
            ...Object.keys(aliases).map(packageName => ({
                find: packageName,
                replacement: aliases[packageName],
            })),
        ],
    },
});
