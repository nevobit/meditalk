import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";

type RecState = "idle" | "recording" | "paused" | "processing";

const MicIcon = ({ size = 32 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M12 1.5a3.5 3.5 0 0 0-3.5 3.5v6A3.5 3.5 0 0 0 12 14.5 3.5 3.5 0 0 0 15.5 11V5A3.5 3.5 0 0 0 12 1.5Z" />
        <path d="M5 11a7 7 0 0 0 14 0" />
        <path d="M12 19v3" />
    </svg>
);

export default function Dashboard() {
    const [state, setState] = useState<RecState>("idle");
    const [seconds, setSeconds] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [selectedAI, setSelectedAI] = useState("whisper");
    const [selectedLanguage, setSelectedLanguage] = useState("es");
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (state !== "recording") return;
        const t = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(t);
    }, [state]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === " " || e.code === "Space") {
                e.preventDefault();
                toggleRecord();
            }
            if (e.key.toLowerCase() === "p") {
                e.preventDefault();
                if (state === "recording") setState("paused");
                else if (state === "paused") setState("recording");
            }
            if (e.key === "Escape") {
                e.preventDefault();
                reset();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [state]);

    // Cleanup effect
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    const timeLabel = useMemo(() => {
        const m = String(Math.floor(seconds / 60)).padStart(2, "0");
        const s = String(seconds % 60).padStart(2, "0");
        return `${m}:${s}`;
    }, [seconds]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunks.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
                setAudioUrl(URL.createObjectURL(audioBlob));

                navigate("/recording", {
                    state: {
                        audioBlob,
                        audioUrl: URL.createObjectURL(audioBlob),
                        durationSec: seconds,
                        sizeBytes: audioBlob.size,
                        filename: `grabacion_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`,
                        selectedAI,
                        selectedLanguage
                    }
                });
            };

            mediaRecorder.start();
            setState("recording");
        } catch {
            alert("No se pudo acceder al micrófono. Por favor, verifica los permisos.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && state === "recording") {
            mediaRecorderRef.current.stop();
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            setState("processing");
        }
    };

    const toggleRecord = () => {
        if (state === "idle" || state === "paused") {
            startRecording();
        } else if (state === "recording") {
            stopRecording();
        } else if (state === "processing") {
            // Do nothing while processing
        }
    };

    const pauseResume = () => {
        if (state === "recording") setState("paused");
        else if (state === "paused") setState("recording");
    };

    const getAudioDuration = (file: File): Promise<number> => {
        return new Promise((resolve) => {
            const audio = new Audio();
            const audioUrl = URL.createObjectURL(file);

            const cleanup = () => {
                URL.revokeObjectURL(audioUrl);
            };

            audio.addEventListener('loadedmetadata', () => {
                const duration = Math.floor(audio.duration);
                cleanup();
                resolve(duration);
            });

            audio.addEventListener('error', () => {
                cleanup();
                // Fallback: estimate duration based on file size
                // This is a rough approximation for common audio formats
                const estimatedDuration = Math.max(1, Math.floor(file.size / 16000));
                resolve(estimatedDuration);
            });

            // Set a timeout to prevent hanging
            setTimeout(() => {
                cleanup();
                const estimatedDuration = Math.max(1, Math.floor(file.size / 16000));
                resolve(estimatedDuration);
            }, 5000);

            audio.src = audioUrl;
        });
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        if (!file.type.startsWith('audio/')) {
            alert('Por favor, selecciona un archivo de audio válido.');
            return;
        }

        try {
            const durationSec = await getAudioDuration(file);
            const audioUrl = URL.createObjectURL(file);

            navigate("/recording", {
                state: {
                    audioBlob: file,
                    audioUrl: audioUrl,
                    durationSec: durationSec,
                    sizeBytes: file.size,
                    filename: file.name,
                    selectedAI,
                    selectedLanguage
                }
            });
        } catch {
            alert('Error al procesar el archivo de audio. Por favor, intenta con otro archivo.');
        }

        // Reset the input
        event.target.value = '';
    };

    const handleUploadClick = () => {
        const fileInput = document.getElementById('audio-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.click();
        }
    };

    const reset = () => {
        // Stop recording if active
        if (mediaRecorderRef.current && state === "recording") {
            mediaRecorderRef.current.stop();
        }

        // Stop all tracks
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        // Clean up audio URL
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }

        setState("idle");
        setSeconds(0);
        setAudioUrl(null);
        audioChunks.current = [];
    };

    return (
        <div className={styles.surface}>
            <div className={styles.layout}>
                <section className={styles.card} aria-label="Grabadora">
                    <header className={styles.header}>
                        <p className={styles.title}>¡Comencemos!</p>
                        <div className={styles.timer}>{timeLabel}</div>
                        <div
                            className={`${styles.status} ${state === "recording"
                                ? styles.statusRec
                                : state === "paused"
                                    ? styles.statusPause
                                    : state === "processing"
                                        ? styles.statusProc
                                        : styles.statusIdle
                                }`}
                            aria-live="polite"
                        >
                            {state === "recording" && "Grabando…"}
                            {state === "paused" && "Pausado"}
                            {state === "processing" && "Procesando…"}
                            {state === "idle" && "Listo para grabar"}
                        </div>
                    </header>

                    <div className={styles.center}>
                        <button
                            type="button"
                            onClick={toggleRecord}
                            className={`${styles.micBtn} ${state === "recording" ? styles.micRec : styles.micIdle
                                }`}
                            aria-label={
                                state === "recording" ? "Detener grabación" : "Iniciar grabación"
                            }
                        >
                            <MicIcon />
                        </button>
                        <p className={styles.subtext}>
                            {state === "idle" && "Presiona el botón para comenzar a grabar"}
                            {state === "recording" && "Presiona para detener • Pulsa “P” para pausar"}
                            {state === "paused" && "Pulsa para reanudar • “Esc” para cancelar"}
                            {state === "processing" && "Convirtiendo audio a texto…"}
                        </p>
                    </div>

                    <div className={styles.controls}>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnWarn}`}
                            onClick={pauseResume}
                            disabled={state !== "recording" && state !== "paused"}
                        >
                            {state === "paused" ? "Reanudar" : "Pausar"}
                        </button>
                        <label className={styles.btn} htmlFor="audio-upload" onClick={handleUploadClick}>
                            Subir audio
                        </label>
                        <input
                            id="audio-upload"
                            type="file"
                            accept="audio/*"
                            style={{ display: "none" }}
                            onChange={handleFileUpload}
                        />

                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnDanger}`}
                            onClick={reset}
                            disabled={state === "idle"}
                        >
                            Reiniciar
                        </button>
                    </div>

                    <div className={styles.grid}>
                        <div>
                            <label className={styles.label}>Motor de IA</label>
                            <select
                                className={styles.select}
                                value={selectedAI}
                                onChange={(e) => setSelectedAI(e.target.value)}
                            >
                                <option value="whisper">Whisper (rápido)</option>
                                <option value="gemini">Gemini</option>
                                <option value="openai">OpenAI Whisper 1</option>
                            </select>
                        </div>
                        <div>
                            <label className={styles.label}>Micrófono</label>
                            <select className={styles.select} defaultValue="default">
                                <option value="default">Predeterminado</option>
                                <option value="ext">Micrófono USB</option>
                            </select>
                        </div>
                        <div>
                            <label className={styles.label}>Idioma</label>
                            <select
                                className={styles.select}
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                            >
                                <option value="auto">Auto</option>
                                <option value="es">Español</option>
                                <option value="en">Inglés</option>
                                <option value="pt">Portugués</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.statusStrip}>
                        {state === "idle" && "Consejo: usa “Espacio” para iniciar/detener rápidamente."}
                        {state === "recording" && "Grabando… el silencio prolongado pausará automáticamente."}
                        {state === "paused" && "Grabación en pausa. Reanuda cuando estés listo."}
                        {state === "processing" && "Procesando audio. Esto puede tardar unos segundos."}
                    </div>
                </section>
            </div>
        </div>
    );
}
