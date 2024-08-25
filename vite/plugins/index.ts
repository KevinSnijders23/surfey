import react from '@vitejs/plugin-react';
// import react from '@vitejs/plugin-react-swc';
import type { ConfigEnv, PluginOption } from 'vite';
import { configMockPlugin } from './mock';

// svg配置
import { configSvgPlugin } from './svg';
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import wasm from 'vite-plugin-wasm';  // Import the WASM plugin

export function createVitePlugins(_isBuild = false, _configEnv: ConfigEnv) {
  const vitePlugins: PluginOption[] = [];

  vitePlugins.push(
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
    wasm(), 
    nodePolyfills(),
  );


  vitePlugins.push(configSvgPlugin());

  vitePlugins.push(configMockPlugin());

  return vitePlugins;
}
