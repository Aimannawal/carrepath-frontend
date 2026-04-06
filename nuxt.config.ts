import tailwindcss from "@tailwindcss/vite";
import viteCompression from "vite-plugin-compression";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  devtools: { enabled: false },
  ssr: true,

  modules: [
    "@nuxtjs/google-fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxtjs/fontaine",
  ],

  /* 🔤 Google Fonts */
  googleFonts: {
    families: {
      Outfit: [300, 400, 500, 600, 700],
    },
    display: "swap",
    preload: true,
    download: true,
    inject: true,
  },

  /* 🔤 Font Metrics */
  fontMetrics: {
    fonts: ["Outfit"],
  },

  /* 🎨 Global CSS */
  css: [
    "~/assets/main.css",
    "~/assets/styles.css",
    "~/assets/fonts.css",
  ],

  /* ⚡ Vite */
  vite: {
    plugins: [
      tailwindcss(),

      viteCompression({
        algorithm: "gzip",
        ext: ".gz",
        threshold: 10240,
      }),

      viteCompression({
        algorithm: "brotliCompress",
        ext: ".br",
        threshold: 10240,
      }),
    ],

    build: {
      cssCodeSplit: true,
      minify: "esbuild",
      cssMinify: true,
    },
  },

  /* 🚀 Nitro */
  nitro: {
    // Agar bisa di-deploy ke Vercel tanpa error "No Output Directory named dist found"
    // preset: "node-server",

    compressPublicAssets: {
      gzip: true,
      brotli: true,
    },

    routeRules: {
      "/_nuxt/**": {
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      },
      "/fonts/**": {
        headers: {
          "Cache-Control": "public, max-age=31536000",
        },
      },
      "/images/**": {
        headers: {
          "Cache-Control": "public, max-age=86400",
        },
      },
    },

    minify: true,
  },

  /* 🌍 Runtime Config */
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
    },
  },

  /* 🧠 App Head */
  app: {
    head: {
      htmlAttrs: { lang: "id" },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "theme-color", content: "#ffffff" },
      ],
      link: [
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/logos/logo.png",
        },
      ],
    },
  },

  build: {
    analyze: false,
  },

  features: {
    inlineStyles: false,
  },

  sourcemap: {
    server: false,
    client: false,
  },

  typescript: {
    typeCheck: false,
  },
});