import { useMemo, useState, useEffect } from "react";
import styles from "./RecordingScreen.module.css";
import { useNavigate, useLocation } from "react-router-dom";

type Template = { id: string; name: string; description?: string };

type AudioData = {
    audioBlob: Blob;
    audioUrl: string;
    durationSec: number;
    sizeBytes: number;
    filename: string;
    selectedAI?: string;
    selectedLanguage?: string;
};

type Props = {
    audioUrl?: string | null;
    durationSec?: number;
    sizeBytes?: number;
    state?: "ready" | "recording" | "processing";
    templates: Template[];
    selectedTemplateId?: string;
    onSelectTemplate?: (id: string) => void;
    filename?: string;
};

const formatTime = (s: number = 0) => {
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(Math.floor(s % 60)).padStart(2, "0");
    return `${mm}:${ss}`;
};

const formatSize = (b?: number) => {
    if (!b && b !== 0) return "";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0, n = b;
    while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
    return `${n.toFixed(1)} ${units[i]}`;
};

const getAIName = (aiModel: string) => {
    const aiNames: Record<string, string> = {
        "whisper": "Whisper (rápido)",
        "gemini": "Gemini",
        "openai": "OpenAI Whisper 1"
    };
    return aiNames[aiModel] || aiModel;
};

const getLanguageName = (lang: string) => {
    const langNames: Record<string, string> = {
        "auto": "Auto",
        "es": "Español",
        "en": "Inglés",
        "pt": "Portugués"
    };
    return langNames[lang] || lang;
};

export default function RecordingScreen({
    durationSec: propDurationSec = 0,
    sizeBytes: propSizeBytes,
    state = "ready",
    templates,
    selectedTemplateId,
    onSelectTemplate,
    filename: propFilename = "grabacion.webm",
}: Props) {
    const [, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [durationSec, setDurationSec] = useState(propDurationSec);
    const [sizeBytes, setSizeBytes] = useState(propSizeBytes);
    const [filename, setFilename] = useState(propFilename);
    const [selectedTemplate, setSelectedTemplate] = useState<string>(selectedTemplateId || "");
    const [selectedAI, setSelectedAI] = useState<string>("whisper");
    const [selectedLanguage, setSelectedLanguage] = useState<string>("es");

    const canGenerate = Boolean(audioUrl) && Boolean(selectedTemplate) && state !== "processing";
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const audioData = location.state as AudioData | null;
        if (audioData) {
            setAudioBlob(audioData.audioBlob);
            setAudioUrl(audioData.audioUrl);
            setDurationSec(audioData.durationSec);
            setSizeBytes(audioData.sizeBytes);
            setFilename(audioData.filename);

            // Set AI and language if provided
            if (audioData.selectedAI) {
                setSelectedAI(audioData.selectedAI);
            }
            if (audioData.selectedLanguage) {
                setSelectedLanguage(audioData.selectedLanguage);
            }

            // If duration is 0 or invalid, try to get it from the audio element
            if (audioData.durationSec === 0 || isNaN(audioData.durationSec)) {
                const audio = new Audio(audioData.audioUrl);
                audio.addEventListener('loadedmetadata', () => {
                    const actualDuration = Math.floor(audio.duration);
                    if (!isNaN(actualDuration) && actualDuration > 0) {
                        setDurationSec(actualDuration);
                    }
                });
            }
        }
    }, [location.state]);

    const stateLabel = useMemo(() => {
        if (state === "recording") return { text: "Grabando…", cls: styles.stateRec };
        if (state === "processing") return { text: "Procesando audio…", cls: styles.stateProc };
        return { text: "Listo para generar", cls: "" };
    }, [state]);

    const selectedTemplateObj = templates.find(t => t.id === selectedTemplate);

    const handleNewRecording = () => {
        navigate("/");
    };

    const handleReRecord = () => {
        navigate("/");
    };

    const handleSelectTemplate = (templateId: string) => {
        setSelectedTemplate(templateId);
        onSelectTemplate?.(templateId);
    };

    const handleGenerateReport = () => {
        if (!audioUrl || !selectedTemplate) return;

        // Get current audio data
        const audioData = location.state as AudioData | null;
        if (!audioData) return;

        // Navigate to report generation with all data
        navigate("/report-generation", {
            state: {
                ...audioData,
                selectedTemplate
            }
        });
    };

    return (
        <div className={styles.surface}>
            <section className={styles.card} aria-label="Pantalla de informe por audio">
                <div className={styles.header}>
                    <div className={styles.stateChip + " " + (stateLabel.cls || "")} aria-live="polite">
                        {stateLabel.text}
                    </div>
                    <div className={styles.timer}>{formatTime(durationSec)}</div>
                </div>

                <div className={styles.row}>
                    <div className={styles.sectionLabel}>Grabación de audio</div>
                    <hr className={styles.hr} />

                    <div className={styles.audioBox}>
                        <audio
                            className={styles.player}
                            controls
                            src={audioUrl || undefined}
                            aria-label="Reproductor de la grabación"
                        />
                        <div className={styles.meta}>
                            {audioUrl ? (
                                <>
                                    Duración: <strong>{formatTime(durationSec)}</strong>
                                    {typeof sizeBytes === "number" && <> • Tamaño: <strong>{formatSize(sizeBytes)} • </strong></>}
                                    Motor de IA: <strong>{getAIName(selectedAI)}</strong> • Idioma: <strong>{getLanguageName(selectedLanguage)}</strong>
                                </>
                            ) : (
                                "Sin audio cargado todavía"
                            )}
                        </div>

                        <div className={styles.actionsRow}>
                            {audioUrl && (
                                <a
                                    className={styles.btnOutline}
                                    href={audioUrl}
                                    download={filename}
                                >
                                    Descargar audio
                                </a>
                            )}
                            <button type="button" className={styles.btnNeutral} onClick={handleReRecord} disabled={state === "recording"}>
                                Regrabar
                            </button>
                            <button type="button" className={styles.btnNeutral} onClick={handleNewRecording}>
                                Nueva grabación
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.formCol}>
                        <label className={styles.label} htmlFor="tpl">Seleccione la plantilla a utilizar:</label>
                        <select
                            id="tpl"
                            className={styles.select}
                            value={selectedTemplate || ""}
                            onChange={(e) => handleSelectTemplate(e.target.value)}
                        >
                            <option value="" disabled>Seleccione una plantilla</option>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>

                        <div className={styles.templatePreview} aria-live="polite">
                            {selectedTemplateObj
                                ? (selectedTemplateObj.description || "Plantilla seleccionada.")
                                : "Aún no ha seleccionado una plantilla. Elija una para ver un resumen del formato."}
                        </div>
                    </div>
                </div>

                <div className={styles.footerActions}>
                    <button
                        type="button"
                        className={styles.btnPrimary}
                        onClick={handleGenerateReport}
                        disabled={!canGenerate}
                        aria-disabled={!canGenerate}
                    >
                        Generar informe
                    </button>
                    <button type="button" className={styles.btnNeutral} onClick={handleNewRecording}>
                        Nueva grabación
                    </button>
                </div>

                <p className={styles.hint}>
                    Consejo: asegúrese de que el audio sea claro. Puede regrabar si es necesario.
                </p>
            </section>
        </div>
    );
}
