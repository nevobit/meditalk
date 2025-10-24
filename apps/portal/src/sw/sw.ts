/// <reference lib="webworker" />
 

import { clientsClaim } from "workbox-core";
import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute, setCatchHandler, setDefaultHandler } from "workbox-routing";
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { BackgroundSyncPlugin } from "workbox-background-sync";

declare const self: ServiceWorkerGlobalScope;

self.__WB_DISABLE_DEV_LOGS = true;

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
        if ("navigationPreload" in self.registration) {
            await self.registration.navigationPreload.enable();
        }
    })());
});

const spaHandler = createHandlerBoundToURL("/index.html");
registerRoute(
    ({ request }) => request.mode === "navigate",
    async (args) => {
        try {
            const res = await new NetworkFirst({
                cacheName: "html-pages",
                networkTimeoutSeconds: 5,
            }).handle(args);

            if (!res) return await caches.match("/offline.html") ?? Response.redirect("/offline.html", 302);

            if (res.status === 404) return await spaHandler(args);

            return res;
        } catch {
            return await caches.match("/offline.html") ?? Response.redirect("/offline.html", 302);
        }
    }
);

const isApi = ({ url }: { url: URL }) =>
    url.pathname.startsWith("/api") || url.pathname.startsWith("/diagram");

registerRoute(
    ({ request, url }) => isApi({ url }) && request.method === "GET",
    new NetworkFirst({
        cacheName: "api-get",
        networkTimeoutSeconds: 5,
        plugins: [new ExpirationPlugin({ maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 })]
    })
);

const bgSync = new BackgroundSyncPlugin("api-mutations-queue", {
    maxRetentionTime: 24 * 60 // minutos
});
registerRoute(
    ({ request, url }) => isApi({ url }) && ["POST", "PUT", "PATCH", "DELETE"].includes(request.method),
    new NetworkFirst({ cacheName: "api-mutations", plugins: [bgSync] })
);

registerRoute(
    ({ request }) => request.destination === "image",
    new CacheFirst({
        cacheName: "images",
        plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 })]
    })
);

registerRoute(
    ({ request }) => request.destination === "font",
    new CacheFirst({
        cacheName: "fonts",
        plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 365 })]
    })
);

registerRoute(
    ({ url }) => /(\.jsdelivr\.net|unpkg\.com|cdn|fonts\.gstatic\.com|fonts\.googleapis\.com)/.test(url.host),
    new StaleWhileRevalidate({
        cacheName: "cdn-cache",
        plugins: [new ExpirationPlugin({ maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 30 })]
    })
);

setDefaultHandler(new StaleWhileRevalidate());

setCatchHandler(async (opts) => {
    const req = opts.request; // Request | undefined
    if (req && req.destination === "document") {
        return Response.redirect("/offline.html", 302);
    }
    return Response.error();
});

self.addEventListener("message", (event: ExtendableMessageEvent) => {
    const data = (event.data || {}) as { type?: string };
    if (data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("push", (e) => {
    const payload = e.data?.json() ?? {};
    const title = payload.title || "repo";
    const body = payload.body || "Nueva actividad";
    const url = payload.url || "/";

    const options: NotificationOptions & { renotify?: boolean } = {
        body,
        icon: "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
        data: { url },
        tag: "revoluc-push",
        renotify: true, // <- extra para TS
    };

    e.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener("notificationclick", (e) => {
    e.notification.close();
    const target = (e.notification.data && (e.notification.data as unknown as { url: string }).url) || "/";
    e.waitUntil((async () => {
        const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        for (const w of wins) {
            const win = w as WindowClient;
            if ("focus" in win) { await win.focus(); await win.navigate(target); return; }
        }
        if (self.clients.openWindow) await self.clients.openWindow(target);
    })());
});

declare global {
    interface PeriodicSyncEvent extends ExtendableEvent {
        readonly tag: string;
        waitUntil(promise: Promise<unknown>): void;
    }
}

self.addEventListener("periodicsync", (event) => {
    const e = event as PeriodicSyncEvent;
    const tag = e.tag || "";
    if (tag === "revoluc-periodic-refresh") {
        e.waitUntil((async () => {
            // Do periodic sync work here if needed
        })());
    }
});
