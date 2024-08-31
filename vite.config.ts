import type { ConfigEnv, UserConfig } from 'vite';
import { createViteResolve } from './build/vite/resolve';
import { createVitePlugins } from './build/vite/plugins';
import { createViteBuild } from './build/vite/build';
import { createViteServer } from './build/vite/server';
import NodeGlobalsPolyfillPlugin from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

// https://vitejs.dev/config/
export default (configEnv: ConfigEnv): UserConfig => {
  const { command } = configEnv;

  const isBuild = command === 'build';

  return {
    // 解析配置
    resolve: createViteResolve(__dirname),
    // 插件配置
    plugins: createVitePlugins(isBuild, configEnv),
    // 打包配置
    build: createViteBuild(),
    // 服务配置
    server: createViteServer(),
    optimizeDeps: {
      esbuildOptions: {
          // Node.js global to browser globalThis
          define: {
            global: 'globalThis',
            'process.env': '{}',  // Define process.env as an empty object
          },
          plugins: [
          ],
      }
  }, 
  base: '/surfey/'
  };
};
