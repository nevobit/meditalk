import { useMemo, useState } from "react";
import styles from "./List.module.css";

export type ReportRow = {
    id: string;
    date: string;
    durationSec: number;
    patient?: string;
    template?: string;
};

type SortKey = "date" | "time" | "duration";
type SortDir = "asc" | "desc";

type Props = {
    title?: string;
    rows: ReportRow[];
    loading?: boolean;
    error?: string | null;
    pageSizeOptions?: number[];
    initialPageSize?: number;
    onView?: (id: string) => void;
    onDownload?: (id: string) => void; // opcional si luego agregas descarga
};

const pad = (n: number) => String(n).padStart(2, "0");
const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
};
const formatTime = (iso: string) => {
    const d = new Date(iso);
    const h = d.getHours() % 12 || 12;
    const ampm = d.getHours() >= 12 ? "PM" : "AM";
    return `${h}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${ampm}`;
};
const formatDuration = (sec: number) => {
    if (sec < 60) return `${sec} sec`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m} min${s ? ` ${s} sec` : ""}`;
};

export default function ReportHistoryTable({
    title = "Historial de informes",
    rows,
    loading,
    error,
    pageSizeOptions = [10, 25, 50],
    initialPageSize = 10,
    onView,
}: Props) {
    /* filters / query */
    const [q, setQ] = useState("");
    const [from, setFrom] = useState<string>("");
    const [to, setTo] = useState<string>("");

    /* sorting */
    const [sortKey, setSortKey] = useState<SortKey>("date");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    /* pagination */
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        const qx = q.trim().toLowerCase();
        const f = rows.filter(r => {
            const d = new Date(r.date);
            if (from && d < new Date(from)) return false;
            if (to) {
                const dt = new Date(to);
                dt.setHours(23, 59, 59, 999);
                if (d > dt) return false;
            }
            if (!qx) return true;
            const hay = `${formatDate(r.date)} ${formatTime(r.date)} ${r.patient || ""} ${r.template || ""}`.toLowerCase();
            return hay.includes(qx);
        });
        return f;
    }, [rows, q, from, to]);

    const sorted = useMemo(() => {
        const cp = [...filtered];
        cp.sort((a, b) => {
            let va = 0 as number | string, vb = 0 as number | string;
            if (sortKey === "date") { va = new Date(a.date).getTime(); vb = new Date(b.date).getTime(); }
            if (sortKey === "time") { va = new Date(a.date).getTime() % (24 * 3600 * 1000); vb = new Date(b.date).getTime() % (24 * 3600 * 1000); }
            if (sortKey === "duration") { va = a.durationSec; vb = b.durationSec; }
            const res = va < vb ? -1 : va > vb ? 1 : 0;
            return sortDir === "asc" ? res : -res;
        });
        return cp;
    }, [filtered, sortKey, sortDir]);

    const total = sorted.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, pageCount);
    const slice = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(d => d === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir(key === "duration" ? "desc" : "desc");
        }
    };

    return (
        <section className={styles.card}>
            <div className={styles.header}>
                <h2 className={styles.title}>{title}</h2>
                <div className={styles.tools}>
                    <input
                        className={styles.input}
                        placeholder="Buscar… (paciente, plantilla, fecha)"
                        value={q}
                        onChange={(e) => { setQ(e.target.value); setPage(1); }}
                        aria-label="Buscar en historial"
                    />
                    <input
                        type="date"
                        className={styles.input}
                        value={from}
                        onChange={(e) => { setFrom(e.target.value); setPage(1); }}
                        aria-label="Desde"
                        title="Desde"
                    />
                    <input
                        type="date"
                        className={styles.input}
                        value={to}
                        onChange={(e) => { setTo(e.target.value); setPage(1); }}
                        aria-label="Hasta"
                        title="Hasta"
                    />
                    <select
                        className={styles.select}
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                        aria-label="Tamaño de página"
                        title="Tamaño de página"
                    >
                        {pageSizeOptions.map(n => <option key={n} value={n}>{n} / pág.</option>)}
                    </select>
                </div>
            </div>

            <div className={styles.tableWrap}>
                <table className={styles.table} role="table">
                    <thead className={styles.thead}>
                        <tr>
                            <th>
                                <button className={styles.sortBtn} onClick={() => toggleSort("date")} aria-label="Ordenar por fecha">
                                    FECHA {sortKey === "date" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                                </button>
                            </th>
                            <th>
                                <button className={styles.sortBtn} onClick={() => toggleSort("time")} aria-label="Ordenar por hora">
                                    HORA {sortKey === "time" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                                </button>
                            </th>
                            <th>
                                <button className={styles.sortBtn} onClick={() => toggleSort("duration")} aria-label="Ordenar por duración">
                                    DURACIÓN DE CONSULTA {sortKey === "duration" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                                </button>
                            </th>
                            <th style={{ width: 72, textAlign: "right" }}>ACCIONES</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading && Array.from({ length: 8 }).map((_, i) => (
                            <tr key={`sk-${i}`} className={styles.skeletonRow}>
                                <td><div className={styles.skeleton} /></td>
                                <td><div className={styles.skeleton} /></td>
                                <td><div className={styles.skeleton} /></td>
                                <td><div className={styles.skeleton} /></td>
                            </tr>
                        ))}

                        {!loading && !error && slice.map((r) => (
                            <tr key={r.id} className={styles.row}>
                                <td>{formatDate(r.date)}</td>
                                <td>{formatTime(r.date)}</td>
                                <td>{formatDuration(r.durationSec)}</td>
                                <td style={{ textAlign: "right" }}>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => onView?.(r.id)}
                                        aria-label="Ver informe"
                                        title="Ver informe"
                                    >
                                        👁️
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {!loading && !error && total === 0 && (
                            <tr><td colSpan={4} className={styles.empty}>Sin resultados. Ajusta los filtros o el rango de fechas.</td></tr>
                        )}

                        {!loading && !!error && (
                            <tr><td colSpan={4} className={styles.error}>Error: {error}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className={styles.footer}>
                <div className={styles.meta}>
                    {total > 0
                        ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, total)} de ${total}`
                        : "0 resultados"}
                </div>
                <div className={styles.pager}>
                    <button
                        className={styles.pageBtn}
                        onClick={() => setPage(1)}
                        disabled={currentPage === 1}
                        aria-label="Primera página"
                    >«</button>
                    <button
                        className={styles.pageBtn}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        aria-label="Página anterior"
                    >‹</button>
                    <span className={styles.meta}>{currentPage} / {pageCount}</span>
                    <button
                        className={styles.pageBtn}
                        onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                        disabled={currentPage === pageCount}
                        aria-label="Página siguiente"
                    >›</button>
                    <button
                        className={styles.pageBtn}
                        onClick={() => setPage(pageCount)}
                        disabled={currentPage === pageCount}
                        aria-label="Última página"
                    >»</button>
                </div>
            </div>
        </section>
    );
}
