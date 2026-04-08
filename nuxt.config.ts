import tailwindcss from "@tailwindcss/vite";
import viteCompression from "vite-plugin-compression";

const isDev = process.env.NODE_ENV === 'development'

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  ssr: true,

  // ✅ Fix IPC: Dev pakai SPA mode, Prod tetap SSR
  $development: {
    ssr: false,
  },

  modules: [
    "@nuxtjs/google-fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxtjs/fontaine",
  ],

  googleFonts: {
    families: { Outfit: [300, 400, 500, 600, 700] },
    display: "swap",
    preload: true,
    download: true,
    inject: true,
  },

  fontMetrics: {
    fonts: ["Outfit"],
  },

  css: [
    "~/assets/main.css",
    "~/assets/styles.css",
    "~/assets/fonts.css",
  ],

  vite: {
    plugins: [
      tailwindcss(),
      ...(!isDev ? [
        viteCompression({ algorithm: "gzip", ext: ".gz", threshold: 10240 }),
        viteCompression({ algorithm: "brotliCompress", ext: ".br", threshold: 10240 }),
      ] : []),
    ],
    build: {
      cssCodeSplit: true,
      minify: "esbuild",
      cssMinify: true,
    },
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost',
      }
    }
  },

  nitro: {
    compressPublicAssets: { gzip: true, brotli: true },
    routeRules: {
      "/_nuxt/**": { headers: { "Cache-Control": "public, max-age=31536000, immutable" } },
      "/fonts/**": { headers: { "Cache-Control": "public, max-age=31536000" } },
      "/images/**": { headers: { "Cache-Control": "public, max-age=86400" } },
    },
    minify: true,
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: "id" },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "theme-color", content: "#ffffff" },
      ],
      link: [
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/logos/logo.png" },
      ],
    },
  },

  experimental: {
    viteNode: false,  // ✅ Fix IPC: matikan vite-node mode
  },

  build: { analyze: false },
  features: { inlineStyles: false },
  sourcemap: { server: false, client: false },
  typescript: { typeCheck: false },
});