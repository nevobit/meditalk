import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig(({ mode }) => {
  const isDev = mode !== "production";

  return {
    plugins: [
      react(),
      VitePWA({
        // En dev: NO registres SW; en prod: sí.
        devOptions: { enabled: true, type: "module" },

        registerType: "autoUpdate",
        injectRegister: "auto",

        includeAssets: [
          "favicon.ico",
          "robots.txt",
          "apple-touch-icon.png"
        ],

        manifest: {
          id: "/",
          name: "repo App",
          short_name: "repo",
          description: "Professional suite modules offline-first for repo.",
          theme_color: "#0b0b0c",
          background_color: "#0b0b0c",
          display: "standalone",
          start_url: "/",
          scope: "/",
          orientation: "portrait",
          lang: "es-CO",
          categories: ["productivity", "business"],
          launch_handler: { client_mode: "navigate-existing" },
          icons: [
            { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
            { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
            { src: "/pwa-512x512-maskable.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
          ],
          screenshots: [
            { src: "/screenshots/home.png", sizes: "1280x800", type: "image/png" } // <- sin "public/"
          ],
          shortcuts: [
            { name: "Dashboard", url: "/dashboard", icons: [{ src: "/icons/shortcut-dashboard.png", sizes: "96x96" }] },
            { name: "Contacts", url: "/contacts", icons: [{ src: "/icons/shortcut-contacts.png", sizes: "96x96" }] }
          ]
        },

        workbox: isDev
          ? undefined
          : {
            globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
            cleanupOutdatedCaches: true,
            sourcemap: true,
            runtimeCaching: [
              {
                urlPattern: ({ request }) => request.mode === "navigate",
                handler: "NetworkFirst",
                options: {
                  cacheName: "html-pages",
                  networkTimeoutSeconds: 5,
                  expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
                  fetchOptions: { credentials: "same-origin" }
                }
              },
              {
                urlPattern: ({ url }) =>
                  url.pathname.startsWith("/api") || url.pathname.startsWith("/diagram"),
                handler: "NetworkFirst",
                options: {
                  cacheName: "api-cache",
                  networkTimeoutSeconds: 5,
                  expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
                  cacheableResponse: { statuses: [0, 200] }
                }
              },
              {
                urlPattern: ({ request }) => request.destination === "image",
                handler: "CacheFirst",
                options: {
                  cacheName: "images",
                  expiration: { maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 * 30 },
                  cacheableResponse: { statuses: [0, 200] }
                }
              },
              {
                urlPattern: ({ request }) => request.destination === "font",
                handler: "CacheFirst",
                options: {
                  cacheName: "fonts",
                  expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 365 }
                }
              },
              {
                urlPattern: ({ url }) => /(\.jsdelivr\.net|unpkg\.com|cdn)/.test(url.host),
                handler: "StaleWhileRevalidate",
                options: {
                  cacheName: "cdn-cache",
                  expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }
                }
              }
            ]
          }
      })
    ],
    resolve: {
      alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }]
    }
  };
});
