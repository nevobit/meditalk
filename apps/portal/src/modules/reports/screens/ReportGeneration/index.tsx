import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import RichTextEditor from "../../components/RichTextEditor";
import { useProcessAudio } from "../../../../shared/api/audio-queries";
import { useUpdateReport } from "../../../../shared/api/report-queries";
import { generatePDFWithAI, type PDFGenerationData } from "../../../../services/pdfService";
import type { ProcessAudioRequest } from "../../../../services/audioService";
import styles from "./ReportGeneration.module.css";
import { Menus } from "@mdi/design-system";
import { BookOpenCheck, Copy, FileText, PillBottle, Save } from "lucide-react";
import { useSession } from "@/shared";
export const htmlToPlainText = (html: string): string => {
    // Primero convertir elementos HTML de salto de línea a saltos de línea reales
    const withLineBreaks = html
        .replace(/<br\s*\/?>/gi, '\n')  // <br> y <br/> a \n
        .replace(/<\/p>/gi, '\n')       // </p> a \n
        .replace(/<p[^>]*>/gi, '')      // <p> (sin cerrar) se elimina
        .replace(/<\/div>/gi, '\n')     // </div> a \n
        .replace(/<div[^>]*>/gi, '')    // <div> (sin cerrar) se elimina
        .replace(/<[^>]*>/g, '');       // Eliminar cualquier otro tag HTML

    return withLineBreaks;
};
type AudioData = {
    audioBlob: Blob;
    audioUrl: string;
    durationSec: number;
    sizeBytes: number;
    filename: string;
    selectedAI?: string;
    selectedLanguage?: string;
    selectedTemplate?: string;
};

type ReportData = {
    id?: string;
    medicalSummary: string;
    generalReport: string;
    transcription: string;
    status: "processing" | "completed" | "error";
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

export default function ReportGeneration() {
    const [audioData, setAudioData] = useState<AudioData | null>(null);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<"medical" | "transcription">("medical");
    const [editableSummary, setEditableSummary] = useState<string>("");
    const [editableReport, setEditableReport] = useState<string>("");
    const [transcriptionTime, setTranscriptionTime] = useState<number>(0);
    const [generationTime, setGenerationTime] = useState<number>(0);

    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSession();
    const processAudioMutation = useProcessAudio();
    const updateReportMutation = useUpdateReport();

    useEffect(() => {
        const data = location.state as AudioData | null;
        if (!data) {
            navigate("/");
            return;
        }

        setAudioData(data);
        generateReport(data);
    }, [location.state, navigate]);

    const generateReport = async (data: AudioData) => {
        setIsGenerating(true);
        setError(null);

        try {
            // Convert Blob to File for API call
            const audioFile = new File([data.audioBlob], data.filename || 'audio.mp3', {
                type: data.audioBlob.type || 'audio/mpeg'
            });

            const processRequest: ProcessAudioRequest = {
                audioFile,
                audioMetadata: {
                    duration: data.durationSec,
                    size: data.sizeBytes,
                    filename: data.filename || 'audio.mp3',
                    mimeType: data.audioBlob.type || 'audio/mpeg'
                },
                aiConfig: {
                    model: (data.selectedAI as "whisper" | "gemini-pro" | "gpt-4") || 'whisper',
                    language: (data.selectedLanguage as "es" | "en" | "fr" | "de" | "it" | "pt") || 'es'
                },
                templateId: data.selectedTemplate || '1',
                userId: 'current-user'
            };

            const response = await processAudioMutation.mutateAsync(processRequest);

            if (response.status === 'failed') {
                throw new Error(response.error || 'Failed to process audio');
            }

            if (response.processingTimes) {
                setTranscriptionTime(response.processingTimes.transcriptionTime);
                setGenerationTime(response.processingTimes.generationTime);
            }

            setReportData({
                id: response.reportId,
                medicalSummary: response.medicalSummary || '',
                generalReport: response.generalReport || '',
                transcription: response.transcription || '',
                status: "completed"
            });

            // Initialize editable content
            setEditableSummary(response.medicalSummary || '');
            setEditableReport(response.generalReport || '');
        } catch (err) {
            setError("Error al generar el informe. Por favor, intenta nuevamente.");
            console.error("Error generating report:", err);
        } finally {
            setIsGenerating(false);
        }
    };


    const handleNewRecording = () => {
        navigate("/");
    };

    const handleBackToRecording = () => {
        navigate("/recording", { state: audioData });
    };

    const handleSaveChanges = async () => {
        if (!reportData?.id) {
            setError("No hay un reporte para guardar");
            return;
        }

        console.log('user', user);
        try {
            await updateReportMutation.mutateAsync({
                id: reportData.id,
                data: {
                    userId: user?.id || '',
                    medicalSummary: editableSummary,
                    generalReport: editableReport,
                }
            });

            // Update local state
            setReportData(prev => prev ? {
                ...prev,
                medicalSummary: editableSummary,
                generalReport: editableReport,
            } : null);

            alert("Cambios guardados exitosamente");
        } catch (err) {
            setError("Error al guardar los cambios. Por favor, intenta nuevamente.");
            console.error("Error saving changes:", err);
        }
    };

    const formatProcessingTime = (ms: number): string => {
        if (ms < 1000) {
            return `${ms}ms`;
        } else if (ms < 60000) {
            return `${(ms / 1000).toFixed(1)}s`;
        } else {
            const minutes = Math.floor(ms / 60000);
            const seconds = Math.floor((ms % 60000) / 1000);
            return `${minutes}m ${seconds}s`;
        }
    };

    const formatMedicalReport = (content: string | Record<string, unknown>): string => {
        if (typeof content === 'object' && content !== null) {
            const formatArray = (arr: unknown[]): string => {
                if (!Array.isArray(arr)) return String(arr);
                return arr.join(', ');
            };

            const formatValue = (value: string | unknown[] | Record<string, unknown> | undefined): string => {
                if (Array.isArray(value)) {
                    return formatArray(value);
                }
                if (typeof value === 'string') {
                    return value;
                }
                return String(value);
            };

            // Extraer el tipo de consulta del objeto
            const consultaType = Object.keys(content)[0] || 'Consulta General';
            console.log('consultaType', content);

            // Helper function to safely access possible keys in content/sections
            const getValue = (section: unknown, keys: string[]) => {
                if (!section || typeof section !== 'object') return undefined;
                for (const key of keys) {
                    if (Object.prototype.hasOwnProperty.call(section, key)) {
                        return section[key as keyof typeof section];
                    }
                }
                return undefined;
            };

            // For handling both actual main section and root-level props
            const section = (content as Record<string, unknown>)[consultaType] || {};

            return `<h2><strong>${consultaType}</strong></h2>
<p><strong>Motivo de Consulta:</strong> ${
                formatValue(
                    getValue(section, ['Motivo de Consulta', 'Motivo_de_Consulta']) ??
                    getValue(content, ['Motivo de Consulta', 'Motivo_de_Consulta']) ??
                    'No se discutió'
                )
                }</p>
<p><strong>Síntomas:</strong> ${formatValue(
                    getValue(section, ['Síntomas']) ??
                    getValue(content, ['Síntomas']) ??
                    'No se discutieron'
                )
                }</p>
<p><strong>Historia Personal:</strong> ${formatValue(
                    getValue(section, ['Historia Personal', 'Historia_Personal']) ??
                    getValue(content, ['Historia Personal', 'Historia_Personal']) ??
                    'No se discutió'
                )
                }</p>
<p><strong>Historia Familiar:</strong> ${formatValue(
                    getValue(section, ['Historia Familiar', 'Historia_Familiar']) ??
                    getValue(content, ['Historia Familiar', 'Historia_Familiar']) ??
                    'No se discutió'
                )
                }</p>
<p><strong>Exploración Física:</strong> ${formatValue(
                    getValue(section, ['Exploración Física', 'Exploración_Física']) ??
                    getValue(content, ['Exploración Física', 'Exploración_Física']) ??
                    'No se realizó ninguna exploración física'
                )
                }</p>
<p><strong>Diagnóstico:</strong> ${formatValue(
                    getValue(section, ['Diagnóstico']) ??
                    getValue(content, ['Diagnóstico']) ??
                    'No se proporcionó ningún diagnóstico'
                )
                }</p>
<p><strong>Tratamiento Prescrito:</strong> ${formatValue(
                    getValue(section, ['Tratamiento Prescrito', 'Tratamiento_Prescrito']) ??
                    getValue(content, ['Tratamiento Prescrito', 'Tratamiento_Prescrito']) ??
                    'No se prescribió ningún tratamiento'
                )
                }</p>
<p><strong>Exámenes Solicitados:</strong> ${formatValue(
                    getValue(section, ['Exámenes Solicitados', 'Exámenes_Solicitados']) ??
                    getValue(content, ['Exámenes Solicitados', 'Exámenes_Solicitados']) ??
                    'No se solicitaron exámenes'
                )
                }</p>
<p><strong>Derivaciones:</strong> ${formatValue(
                    getValue(section, ['Derivaciones']) ??
                    getValue(content, ['Derivaciones']) ??
                    'No se indicaron derivaciones'
                )
                }</p>
<p><strong>Receta Médica:</strong> ${formatValue(
                    getValue(section, ['Receta Médica', 'Receta_Médica']) ??
                    getValue(content, ['Receta Médica', 'Receta_Médica']) ??
                    'No se recetaron medicamentos'
                )
                }</p>`;
        }

        // Si es un string y ya está en formato estructurado, lo mantenemos
        if (typeof content === 'string' && content.includes('Informe') && content.includes('Motivo de Consulta:')) {
            return content;
        }

        return `<h2><strong>Informe Consulta Médica</strong></h2>
<p><strong>Motivo de Consulta:</strong> ${typeof content === 'string' ? content.substring(0, 100) : 'No se discutió'}...</p>
<p><strong>Síntomas:</strong> No se discutieron.</p>
<p><strong>Historia Personal:</strong> No se discutió.</p>
<p><strong>Historia Familiar:</strong> No se discutió.</p>
<p><strong>Exploración Física:</strong> No se realizó ninguna exploración física.</p>
<p><strong>Diagnóstico:</strong> No se proporcionó ningún diagnóstico.</p>
<p><strong>Tratamiento Prescrito:</strong> No se prescribió ningún tratamiento.</p>
<p><strong>Exámenes Solicitados:</strong> No se solicitaron exámenes.</p>
<p><strong>Derivaciones:</strong> No se indicaron derivaciones.</p>
<p><strong>Receta Médica:</strong> No se recetaron medicamentos.</p>`;
    };

    if (!audioData) {
        return <div>Cargando...</div>;
    }

    const copyPlainText = async () => {
        const plainSummary = htmlToPlainText(editableSummary);
        const plainReport = htmlToPlainText(editableReport);
        const textToCopy = `Resumen: ${plainSummary}\n\nInforme: ${plainReport}`;

        try {
            await navigator.clipboard.writeText(textToCopy);
        } catch {
            setError('Error al copiar al portapapeles');
        }
    };
    const generatePDF = async (type: 'informe' | 'receta' | 'examen') => {
        try {
            const plainSummary = htmlToPlainText(editableSummary);
            const plainReport = JSON.stringify(editableReport);
            const transcription = reportData?.transcription || '';

            const pdfData: PDFGenerationData = {
                type,
                patientName: 'Paciente',
                patientId: 'N/A',
                doctorName: 'Dr. Médico',
                doctorId: 'N/A',
                date: new Date().toLocaleDateString('es-ES'),
                content: {
                    transcription,
                    medicalSummary: plainSummary,
                    generalReport: plainReport
                },
                medications: [],
                exams: []
            };

            const fileName = getFileName(type);

            // Usar la nueva función con IA para extracción automática
            await generatePDFWithAI(pdfData, fileName);

        } catch (error) {
            console.error('Error generating PDF:', error);
            setError(`Error al generar ${type}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    };


    const getFileName = (type: 'informe' | 'receta' | 'examen') => {
        const date = new Date().toISOString().split('T')[0];
        switch (type) {
            case 'informe': return `Informe_Médico_${date}.html`;
            case 'receta': return `Receta_Médica_${date}.html`;
            case 'examen': return `Solicitud_Exámenes_${date}.html`;
            default: return `Documento_${date}.html`;
        }
    };


    return (
        <div className={styles.surface}>
            <div className={styles.layout}>
                <section className={styles.mainContent} aria-label="Generación de informe médico">
                    {error && (
                        <div className={styles.errorBox}>
                            <p>{error}</p>
                            <button onClick={() => audioData && generateReport(audioData)} className={styles.btnPrimary}>
                                Reintentar
                            </button>
                        </div>
                    )}

                    {isGenerating && (
                        <div className={styles.loadingBox}>
                            <div className={styles.spinner}></div>
                            <p>Procesando audio y generando informe médico...</p>
                            <p className={styles.loadingSubtext}>Esto puede tomar unos minutos</p>
                        </div>
                    )}

                    {!isGenerating && reportData && reportData.status === "completed" && (
                        <>
                            <div className={styles.header} >

                            <div className={styles.viewToggle}>
                                <button
                                    className={`${styles.toggleBtn} ${activeView === "medical" ? styles.active : ""}`}
                                    onClick={() => setActiveView("medical")}
                                >
                                    Informe Médico
                                </button>
                                <button
                                    className={`${styles.toggleBtn} ${activeView === "transcription" ? styles.active : ""}`}
                                    onClick={() => setActiveView("transcription")}
                                >
                                    Transcripción
                                    </button>
                                </div>

                                <div className={styles.headerActions}>
                                    <Menus.Toggle id="actions-menu" />
                                    <Menus.List id="actions-menu">
                                        <Menus.Item id="save" leadingIcon={<Save strokeWidth={1.5} width={16} />} onClick={handleSaveChanges}>Guardar</Menus.Item>
                                        <Menus.Item id="copy" leadingIcon={<Copy strokeWidth={1.5} width={16} />} onClick={copyPlainText} >Copiar</Menus.Item>
                                        <Menus.Divider />
                                        <Menus.Label>Descargar:</Menus.Label>
                                        <Menus.Item id="report" leadingIcon={<FileText strokeWidth={1.5} width={16} />} onClick={(e) => { generatePDF('informe'); e.preventDefault(); }}>Informe PDF</Menus.Item>
                                        <Menus.Item id="recipe" leadingIcon={<PillBottle strokeWidth={1.5} width={16} />} onClick={(e) => { generatePDF('receta'); e.preventDefault(); }}>Receta Médica</Menus.Item>
                                        <Menus.Item id="exams" leadingIcon={<BookOpenCheck strokeWidth={1.5} width={16} />} onClick={(e) => { generatePDF('examen'); e.preventDefault(); }}>Solicitud de Exámenes</Menus.Item>
                                    </Menus.List>
                                </div>
                            </div>


                            {/* Content Display */}
                            <div className={styles.contentArea}>
                                <div className={styles.contentBox}>
                                    {activeView === "medical" && (
                                        <div className={styles.content}>
                                            <div className={styles.medicalSection}>
                                                <h3>Resumen Ejecutivo</h3>
                                                <div className={styles.summaryCard}>
                                                    <RichTextEditor
                                                        content={editableSummary}
                                                        onChange={setEditableSummary}
                                                        placeholder="Resumen ejecutivo del caso médico..."
                                                        className={styles.richEditor}
                                                    />
                                                </div>
                                            </div>

                                            <div className={styles.medicalSection}>
                                                <h3>Informe Médico Estructurado</h3>
                                                <div className={styles.reportCard}>
                                                    <RichTextEditor
                                                        content={formatMedicalReport(editableReport)}
                                                        onChange={setEditableReport}
                                                        placeholder="Informe médico estructurado generado automáticamente..."
                                                        className={styles.richEditor}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeView === "transcription" && (
                                        <div className={styles.content}>
                                            <div className={styles.medicalSection}>
                                                <h3>Transcripción Completa</h3>
                                                <div className={styles.transcriptionCard}>
                                                    <pre className={styles.textContent}>{reportData.transcription}</pre>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {/* <div className={styles.actions}>
                                <button className={styles.btnSecondary} onClick={handleBackToRecording}>
                                    ← Volver a Grabación
                                </button>
                                {activeView === "medical" && (
                                    <button className={styles.btnSave} >
                                        Guardar Cambios
                                    </button>
                                )}
                                <button className={styles.btnPrimary} onClick={handleNewRecording}>
                                    Nueva Grabación
                                </button>
                            </div> */}
                        </>
                    )}
                </section>

                <aside className={styles.sidebar}>
                    <div className={styles.sidebarContent}>
                        <h3 className={styles.sidebarTitle}>Información</h3>

                        <div className={styles.infoSection}>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Duración:</span>
                                <span className={styles.infoValue}>{formatTime(audioData.durationSec)}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Tamaño:</span>
                                <span className={styles.infoValue}>{formatSize(audioData.sizeBytes)}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Motor IA:</span>
                                <span className={styles.infoValue}>{getAIName(audioData.selectedAI || "whisper")}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Idioma:</span>
                                <span className={styles.infoValue}>{getLanguageName(audioData.selectedLanguage || "es")}</span>
                            </div>
                        </div>

                        {reportData && reportData.status === "completed" && (
                            <>
                                <h3 className={styles.sidebarTitle}>Tiempos de Procesamiento</h3>

                                <div className={styles.infoSection}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Transcripción:</span>
                                        <span className={styles.infoValue}>{formatProcessingTime(transcriptionTime)}</span>
                                    </div>

                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Generación IA:</span>
                                        <span className={styles.infoValue}>{formatProcessingTime(generationTime)}</span>
                                    </div>

                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Total:</span>
                                        <span className={styles.infoValue}>{formatProcessingTime(transcriptionTime + generationTime)}</span>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className={styles.sidebarActions}>
                            <button className={styles.sidebarBtn} onClick={handleBackToRecording}>
                                ← Volver a Grabación
                            </button>
                            <button className={styles.sidebarBtn} onClick={handleNewRecording}>
                                Nueva Grabación
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
