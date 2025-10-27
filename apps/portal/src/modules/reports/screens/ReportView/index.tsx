import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReport, useUpdateReport } from "../../../../shared/api/report-queries";
import { generatePDFWithAI, type PDFGenerationData } from "../../../../services/pdfService";
import RichTextEditor from "../../components/RichTextEditor";
import styles from "./ReportView.module.css";
import { Menus } from "@mdi/design-system";
import { BookOpenCheck, Copy, FileText, PillBottle, Save, ArrowLeft } from "lucide-react";

export const htmlToPlainText = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
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
        "whisper-large": "Whisper Large",
        "gemini-pro": "Gemini Pro",
        "gpt-4": "GPT-4"
    };
    return aiNames[aiModel] || aiModel;
};

const getLanguageName = (lang: string) => {
    const langNames: Record<string, string> = {
        "es": "Español",
        "en": "Inglés",
        "fr": "Francés",
        "de": "Alemán",
        "it": "Italiano",
        "pt": "Portugués"
    };
    return langNames[lang] || lang;
};

export default function ReportView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: report, isLoading, error } = useReport(id || '');
    const updateReportMutation = useUpdateReport();

    const [activeView, setActiveView] = useState<"medical" | "transcription">("medical");
    const [editableSummary, setEditableSummary] = useState<string>("");
    const [editableReport, setEditableReport] = useState<string>("");
    const [isEditing, setIsEditing] = useState(false);

    // Initialize editable content when report loads
    useEffect(() => {
        if (report) {
            setEditableSummary(report.medicalSummary);
            setEditableReport(report.generalReport);
        }
    }, [report]);

    const handleBack = () => {
        navigate("/informs");
    };

    const handleSaveChanges = async () => {
        if (!report?.id) return;

        try {
            await updateReportMutation.mutateAsync({
                id: report.id,
                data: {
                    userId: report.userId,
                    medicalSummary: editableSummary,
                    generalReport: editableReport,
                }
            });

            setIsEditing(false);
            alert("Cambios guardados exitosamente");
        } catch (err) {
            console.error("Error saving changes:", err);
            alert("Error al guardar los cambios");
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditableSummary(report?.medicalSummary || '');
        setEditableReport(report?.generalReport || '');
        setIsEditing(false);
    };

    const copyPlainText = async () => {
        const plainSummary = htmlToPlainText(editableSummary);
        const plainReport = htmlToPlainText(editableReport);
        const textToCopy = `Resumen: ${plainSummary}\n\nInforme: ${plainReport}`;

        try {
            await navigator.clipboard.writeText(textToCopy);
            alert("Texto copiado al portapapeles");
        } catch {
            alert('Error al copiar al portapapeles');
        }
    };

    const generatePDF = async (type: 'informe' | 'receta' | 'examen') => {
        if (!report) return;

        try {
            const plainSummary = htmlToPlainText(editableSummary);
            const plainReport = htmlToPlainText(editableReport);

            const pdfData: PDFGenerationData = {
                type,
                patientName: 'Paciente',
                patientId: 'N/A',
                doctorName: 'Dr. Médico',
                doctorId: 'N/A',
                date: new Date().toLocaleDateString('es-ES'),
                content: {
                    transcription: report.transcription,
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
            alert(`Error al generar ${type}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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

    if (isLoading) {
        return <div className={styles.loading}>Cargando reporte...</div>;
    }

    if (error || !report) {
        return (
            <div className={styles.error}>
                <h2>Error al cargar el reporte</h2>
                <p>{error?.message || "Reporte no encontrado"}</p>
                <button onClick={handleBack} className={styles.btnPrimary}>
                    Volver a la lista
                </button>
            </div>
        );
    }

    return (
        <div className={styles.surface}>
            <div className={styles.layout}>
                <section className={styles.mainContent}>
                    <div className={styles.header}>
                        <div className={styles.headerLeft}>
                            <button onClick={handleBack} className={styles.backBtn}>
                                <ArrowLeft size={20} />
                                Volver
                            </button>
                            <h1>Reporte Médico</h1>
                        </div>

                        <div className={styles.headerActions}>
                            {isEditing ? (
                                <div className={styles.editActions}>
                                    <button onClick={handleCancel} className={styles.btnSecondary}>
                                        Cancelar
                                    </button>
                                    <button onClick={handleSaveChanges} className={styles.btnPrimary}>
                                        <Save size={16} />
                                        Guardar
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.viewActions}>
                                    <button onClick={handleEdit} className={styles.btnSecondary}>
                                        Editar
                                    </button>
                                    <Menus.Toggle id="actions-menu" />
                                    <Menus.List id="actions-menu">
                                        <Menus.Item id="copy" leadingIcon={<Copy strokeWidth={1.5} width={16} />} onClick={copyPlainText}>
                                            Copiar
                                        </Menus.Item>
                                        <Menus.Divider />
                                        <Menus.Label>Descargar:</Menus.Label>
                                        <Menus.Item id="report" leadingIcon={<FileText strokeWidth={1.5} width={16} />} onClick={() => generatePDF('informe')}>
                                            Informe PDF
                                        </Menus.Item>
                                        <Menus.Item id="recipe" leadingIcon={<PillBottle strokeWidth={1.5} width={16} />} onClick={() => generatePDF('receta')}>
                                            Receta Médica
                                        </Menus.Item>
                                        <Menus.Item id="exams" leadingIcon={<BookOpenCheck strokeWidth={1.5} width={16} />} onClick={() => generatePDF('examen')}>
                                            Solicitud de Exámenes
                                        </Menus.Item>
                                    </Menus.List>
                                </div>
                            )}
                        </div>
                    </div>

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
                                            // readOnly={!isEditing}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.medicalSection}>
                                        <h3>Informe Médico Estructurado</h3>
                                        <div className={styles.reportCard}>
                                            <RichTextEditor
                                                content={editableReport}
                                                onChange={setEditableReport}
                                                placeholder="Informe médico estructurado..."
                                                className={styles.richEditor}
                                            // readOnly={!isEditing}
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
                                            <pre className={styles.textContent}>{report.transcription}</pre>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <aside className={styles.sidebar}>
                    <div className={styles.sidebarContent}>
                        <h3 className={styles.sidebarTitle}>Información</h3>

                        <div className={styles.infoSection}>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Duración:</span>
                                <span className={styles.infoValue}>{formatTime(report.audioMetadata.duration)}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Tamaño:</span>
                                <span className={styles.infoValue}>{formatSize(report.audioMetadata.size)}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Archivo:</span>
                                <span className={styles.infoValue}>{report.audioMetadata.filename}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Motor IA:</span>
                                <span className={styles.infoValue}>{getAIName(report.aiConfig.model)}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Idioma:</span>
                                <span className={styles.infoValue}>{getLanguageName(report.aiConfig.language)}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Plantilla:</span>
                                <span className={styles.infoValue}>Plantilla {report.templateId}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Estado:</span>
                                <span className={styles.infoValue}>
                                    <span className={`${styles.status} ${styles[report.status]}`}>
                                        {report.status === 'completed' ? 'Completado' :
                                            report.status === 'processing' ? 'Procesando' : 'Error'}
                                    </span>
                                </span>
                            </div>
                        </div>

                        <h3 className={styles.sidebarTitle}>Tiempos de Procesamiento</h3>
                        <div className={styles.infoSection}>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Transcripción:</span>
                                <span className={styles.infoValue}>
                                    {formatProcessingTime(report.processingTimes.transcriptionTime)}
                                </span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Generación IA:</span>
                                <span className={styles.infoValue}>
                                    {formatProcessingTime(report.processingTimes.generationTime)}
                                </span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Total:</span>
                                <span className={styles.infoValue}>
                                    {formatProcessingTime(report.processingTimes.totalTime)}
                                </span>
                            </div>
                        </div>

                        <div className={styles.sidebarActions}>
                            <button className={styles.sidebarBtn} onClick={handleBack}>
                                ← Volver a la lista
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
