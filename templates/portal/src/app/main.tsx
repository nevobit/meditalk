import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@mdi/design-system/css/web.css";
import { buildProvidersTree, ToastProvider, Modal } from "@mdi/design-system";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { CurrencyProvider, I18nProvider, PersistedQueryProvider } from "./providers";

import { PWAEvents } from "./pwa/PWAEvents";
import Application from "./Application";

const ProvidersTree = buildProvidersTree([
  [Modal, {}],
  [ToastProvider, {}],
  [I18nProvider, {}],
  [CurrencyProvider, {}],
  [PersistedQueryProvider, {}],
]);

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

const root = createRoot(container);

root.render(
  <StrictMode>
    <ProvidersTree>
      <Application />
      <PWAEvents />
      <ReactQueryDevtools initialIsOpen={false} />
    </ProvidersTree>
  </StrictMode>
);
