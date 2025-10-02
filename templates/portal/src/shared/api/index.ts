import axios, { AxiosError, type AxiosInstance } from "axios";
import { useSession } from "../state-manager";

export const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "/api",
    headers: { "Content-Type": "application/json" },
    timeout: 15000
});

api.interceptors.request.use(cfg => {
    const token = useSession.getState().token;
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

api.interceptors.response.use(
    res => res,
    (err: AxiosError) => {
        if (err.response?.status === 401) {
            try { useSession.getState().signOut(); } catch {
                throw new Error('Error');
            }
        }
        const msg = (err.response?.data as unknown as { message: string })?.message || err.message || `HTTP ${err.response?.status ?? "ERR"}`;
        return Promise.reject(new Error(msg));
    }
);

export const getJSON = <T,>(url: string, opts?: { params?: unknown; signal?: AbortSignal; api?: AxiosInstance }) =>
    (opts?.api ?? api).get<T>(url, { params: opts?.params, signal: opts?.signal }).then(r => r.data);

export const postJSON = <T,>(url: string, body?: unknown, opts?: { signal?: AbortSignal; api?: AxiosInstance }) =>
    (opts?.api ?? api).post<T>(url, body, { signal: opts?.signal }).then(r => r.data);

export const putJSON = <T,>(url: string, body?: unknown, opts?: { signal?: AbortSignal; api?: AxiosInstance }) =>
    (opts?.api ?? api).put<T>(url, body, { signal: opts?.signal }).then(r => r.data);

export const delJSON = <T,>(url: string, opts?: { signal?: AbortSignal; api?: AxiosInstance }) =>
    (opts?.api ?? api).delete<T>(url, { signal: opts?.signal }).then(r => r.data);
