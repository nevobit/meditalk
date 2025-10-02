import { useEffect } from "react";
import { registerSW } from "virtual:pwa-register";

type Options = {
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
};

export function usePWAUpdate({ onNeedRefresh, onOfflineReady }: Options = {}) {
    useEffect(() => {
        registerSW({
            immediate: true,
            onNeedRefresh,
            onOfflineReady,
            onRegisteredSW(swUrl, r) {
                // Puedes loggear o hacer métricas aquí
                // eslint-disable-next-line no-console
                console.log("SW Registrado:", swUrl, r);
            }
        });
        return () => { /* nada */ };
    }, [onNeedRefresh, onOfflineReady]);
}
