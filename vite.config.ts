import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import {AntDesignVueResolver} from 'unplugin-vue-components/resolvers'
import AutoImport from 'unplugin-auto-import/vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import Config from './config/config'

import * as path from 'path'


// https://vitejs.dev/config/
export default defineConfig(({ mode}) => {
  const env: Partial<ImportMetaEnv> = loadEnv(mode, process.cwd());
  return {
      base: './',
      resolve: {
          alias: {
              '@': path.resolve(__dirname, 'src'),
              'styles': path.resolve(__dirname, 'src/style'),
              'layouts': path.resolve(__dirname, 'src/layouts'),
              'components': path.resolve(__dirname, 'src/components'),
              'store': path.resolve(__dirname, 'src/store'),
          }
      },
      build: {
          outDir: 'dist',
          assetsDir: 'assets',
          sourcemap: true,
          cssCodeSplit: false,
          manifest: true,
          chunkSizeWarningLimit: 2000,
          assetsInlineLimit: 1000,
          rollupOptions: {
              output: {
                  entryFileNames: `assets/[name].${new Date().getTime()}.js`,
                  chunkFileNames: `assets/[name].${new Date().getTime()}.js`,
                  assetFileNames: `assets/[name].${new Date().getTime()}.[ext]`,
                  compact: true,
                  manualChunks: {
                      vue: ['vue', 'vue-router', 'pinia']
                  },
              },
          },
      },
      plugins: [
          vue(),
          Components({
              resolvers: [AntDesignVueResolver({ importStyle: 'less' })],
              directoryAsNamespace: true
          }),
          AutoImport({
              imports: [
                  'vue',
                  'vue-router'
              ],
              dts: 'src/auto-imports.d.ts'
          }),
          createHtmlPlugin({
              inject: {
                  data: {
                      title: Config.title,
                      favicon: `<link rel="icon" type="image/svg+xml" href="${Config.logo}" />`
                  }
              }
          })
      ],
      server: {
          host:'0.0.0.0',

          proxy: {
              [env.VITE_APP_BASE_API]: {
                  // target: 'http://192.168.33.22:8800',
                  // target: 'http://192.168.32.244:8881',
                  target: 'http://47.112.135.104:5096', // opcua
                  changeOrigin: true,
                  rewrite: (path) => path.replace('^'+env.VITE_APP_BASE_API, '')
              }
          }
      },
      css: {
          preprocessorOptions: {
              less: {
                  modifyVars: {
                      ...Config.theme,
                      hack: `true; @import (reference) "${path.resolve('src/style/variable.less')}";`
                  },
                  javascriptEnabled: true,
              }
          }
      }
  }
})
