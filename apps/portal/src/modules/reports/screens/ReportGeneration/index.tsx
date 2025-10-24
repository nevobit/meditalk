import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import RichTextEditor from "../../components/RichTextEditor";
import { useProcessAudio } from "../../../../shared/api/audio-queries";
import type { ProcessAudioRequest } from "../../../../services/audioService";
import styles from "./ReportGeneration.module.css";
import { Menus } from "@mdi/design-system";
import { BookOpenCheck, Copy, FileText, PillBottle, Save } from "lucide-react";
export const htmlToPlainText = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
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
    const processAudioMutation = useProcessAudio();

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

    const handleSaveChanges = () => {
        // Aquí puedes implementar la lógica para guardar los cambios
        // Por ejemplo, enviar a la API o guardar en localStorage
        console.log("Guardando cambios:", { editableSummary, editableReport });
        alert("Cambios guardados exitosamente");
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

            return `<h2><strong>${consultaType}</strong></h2>
<p><strong>Motivo de Consulta:</strong> ${formatValue(content[consultaType]?.['Motivo de Consulta'] || content['Motivo de Consulta'] || content[consultaType]?.Motivo_de_Consulta || content.Motivo_de_Consulta || 'No se discutió')}</p>
<p><strong>Síntomas:</strong> ${formatValue(content[consultaType]?.Síntomas || content.Síntomas || 'No se discutieron')}</p>
<p><strong>Historia Personal:</strong> ${formatValue(content[consultaType]?.['Historia Personal'] || content['Historia Personal'] || content[consultaType]?.Historia_Personal || content.Historia_Personal || 'No se discutió')}</p>
<p><strong>Historia Familiar:</strong> ${formatValue(content[consultaType]?.['Historia Familiar'] || content['Historia Familiar'] || content[consultaType]?.Historia_Familiar || content.Historia_Familiar || 'No se discutió')}</p>
<p><strong>Exploración Física:</strong> ${formatValue(content[consultaType]?.['Exploración Física'] || content['Exploración Física'] || content[consultaType]?.Exploración_Física || content.Exploración_Física || 'No se realizó ninguna exploración física')}</p>
<p><strong>Diagnóstico:</strong> ${formatValue(content[consultaType]?.Diagnóstico || content.Diagnóstico || 'No se proporcionó ningún diagnóstico')}</p>
<p><strong>Tratamiento Prescrito:</strong> ${formatValue(content[consultaType]?.['Tratamiento Prescrito'] || content['Tratamiento Prescrito'] || content[consultaType]?.Tratamiento_Prescrito || content.Tratamiento_Prescrito || 'No se prescribió ningún tratamiento')}</p>
<p><strong>Exámenes Solicitados:</strong> ${formatValue(content[consultaType]?.['Exámenes Solicitados'] || content['Exámenes Solicitados'] || content[consultaType]?.Exámenes_Solicitados || content.Exámenes_Solicitados || 'No se solicitaron exámenes')}</p>
<p><strong>Derivaciones:</strong> ${formatValue(content[consultaType]?.Derivaciones || content.Derivaciones || 'No se indicaron derivaciones')}</p>
<p><strong>Receta Médica:</strong> ${formatValue(content[consultaType]?.['Receta Médica'] || content['Receta Médica'] || content[consultaType]?.Receta_Médica || content.Receta_Médica || 'No se recetaron medicamentos')}</p>`;
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
            const plainReport = htmlToPlainText(editableReport);
            const transcription = reportData?.transcription || '';

            // Crear el prompt según el tipo de documento
            let prompt = '';
            let fileName = '';

            switch (type) {
                case 'informe':
                    prompt = `Genera un informe médico profesional basado en la siguiente información:

Transcripción de la consulta:
${transcription}

Resumen médico:
${plainSummary}

Informe médico:
${plainReport}

Formato el contenido como un informe médico profesional con:
- Encabezado con datos del paciente
- Motivo de consulta
- Antecedentes
- Examen físico
- Diagnóstico
- Tratamiento
- Recomendaciones
- Firma del médico`;
                    fileName = 'Informe Médico.pdf';
                    break;

                case 'receta':
                    prompt = `Genera una receta médica basada en la siguiente información:

Transcripción de la consulta:
${transcription}

Informe médico:
${plainReport}

Extrae todos los medicamentos mencionados y crea una receta médica profesional con:
- Datos del paciente
- Medicamentos con dosis y frecuencia
- Instrucciones de uso
- Firma del médico
- Fecha de emisión`;
                    fileName = 'Receta Médica.pdf';
                    break;

                case 'examen':
                    prompt = `Genera una solicitud de exámenes médicos basada en la siguiente información:

Transcripción de la consulta:
${transcription}

Informe médico:
${plainReport}

Crea una solicitud de exámenes con:
- Datos del paciente
- Exámenes solicitados con indicaciones
- Instrucciones de preparación
- Firma del médico
- Fecha de emisión`;
                    fileName = 'Solicitud de Exámenes.pdf';
                    break;
            }

            // Llamar a la API para generar el PDF
            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    type,
                    transcription,
                    summary: plainSummary,
                    report: plainReport
                })
            });

            if (!response.ok) {
                throw new Error('Error al generar el PDF');
            }

            // Descargar el PDF
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error('Error generating PDF:', error);
            setError(`Error al generar ${type}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
