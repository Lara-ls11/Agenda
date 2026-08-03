import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "admin-icon-192.png",
        "admin-icon-512.png",
      ],

      manifest: {
        name: "Mónica Lima - Administração",
        short_name: "Agenda Mónica",
        description:
          "Área de administração das marcações Mónica Lima.",

        start_url: "/admin",
        scope: "/",
        display: "standalone",

        background_color: "#FAF8F6",
        theme_color: "#C8A96A",

        icons: [
          {
            src: "/admin-icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/admin-icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/admin-icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },

      workbox: {
        navigateFallback: "/index.html",
      },
    }),
  ],
});