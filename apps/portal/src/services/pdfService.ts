export interface PDFGenerationData {
    type: 'informe' | 'receta' | 'examen';
    patientName?: string;
    patientId?: string;
    doctorName?: string;
    doctorId?: string;
    date: string;
    content: {
        transcription?: string;
        medicalSummary?: string;
        generalReport?: string | Record<string, unknown>;
    };
    medications?: Array<{
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions?: string;
    }>;
    exams?: Array<{
        name: string;
        description: string;
        instructions?: string;
    }>;
}

const formatReportContent = (content: string | Record<string, unknown> | undefined): string => {
    console.log('content', content);
    console.log('formatReportContent input:', content, 'type:', typeof content);

    if (!content) return 'No disponible';

    if (typeof content === 'string') {
        // Si es un JSON string, intentar parsearlo y formatearlo
        try {
            const parsed = JSON.parse(content);
            return formatMedicalReport(parsed);
        } catch {
            // Si no es JSON válido, devolver el string tal como está
            return content;
        }
    }

    if (typeof content === 'object' && content !== null) {
        return formatMedicalReport(content);
    }

    return String(content);
};

const formatMedicalReport = (content: Record<string, unknown>): string => {
    const formatValue = (value: unknown): string => {
        if (typeof value === 'string') {
            return value;
        }
        if (Array.isArray(value)) {
            return value.join(', ');
        }
        return String(value);
    };

    // Extraer el tipo de consulta del objeto
    const consultaType = Object.keys(content)[0] || 'Consulta General';
    console.log('consultaType', content);

    // Obtener la sección de datos
    const section = content[consultaType] as Record<string, unknown> || {};

    return `
        <div style="margin-bottom: 20px;">
            <h3 style="color: #1f2937; font-size: 1.3rem; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                ${consultaType}
            </h3>
            
            <div style="line-height: 1.6;">
                <p style="margin: 8px 0;"><strong>Motivo de Consulta:</strong> ${formatValue(section['Motivo de Consulta'] || 'No se discutió')}</p>
                <p style="margin: 8px 0;"><strong>Síntomas:</strong> ${formatValue(section['Síntomas'] || 'No se discutieron')}</p>
                <p style="margin: 8px 0;"><strong>Historia Personal:</strong> ${formatValue(section['Historia Personal'] || 'No se discutió')}</p>
                <p style="margin: 8px 0;"><strong>Historia Familiar:</strong> ${formatValue(section['Historia Familiar'] || 'No se discutió')}</p>
                <p style="margin: 8px 0;"><strong>Exploración Física:</strong> ${formatValue(section['Exploración Física'] || 'No se realizó ninguna exploración física')}</p>
                <p style="margin: 8px 0;"><strong>Diagnóstico:</strong> ${formatValue(section['Diagnóstico'] || 'No se proporcionó ningún diagnóstico')}</p>
                <p style="margin: 8px 0;"><strong>Tratamiento Prescrito:</strong> ${formatValue(section['Tratamiento Prescrito'] || 'No se prescribió ningún tratamiento')}</p>
                <p style="margin: 8px 0;"><strong>Exámenes Solicitados:</strong> ${formatValue(section['Exámenes Solicitados'] || 'No se solicitaron exámenes')}</p>
                <p style="margin: 8px 0;"><strong>Derivaciones:</strong> ${formatValue(section['Derivaciones'] || 'No se indicaron derivaciones')}</p>
                <p style="margin: 8px 0;"><strong>Receta Médica:</strong> ${formatValue(section['Receta Médica'] || 'No se recetaron medicamentos')}</p>
            </div>
        </div>
    `;
};

const generateHTML = (data: PDFGenerationData): string => {
    const { type, patientName = 'Paciente', patientId = 'N/A', doctorName = 'Dr. Médico', doctorId = 'N/A', date, content, medications = [], exams = [] } = data;

    console.log('content.generalReport', content);
    const baseStyles = `
        <style>
            @media print {
                @page {
                    margin: 20px;
                }
                body {
                    margin: 0;
                    padding: 20px;
                }
            }
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                line-height: 1.4;
                color: #333;
            }
            .header {
                text-align: center;
                margin-bottom: 2rem;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 1rem;
            }
            .clinic-name {
                font-size: 1.8rem;
                font-weight: bold;
                color: #1f2937;
                margin: 0 0 0.5rem 0;
            }
            .title {
                font-size: 1.4rem;
                font-weight: 600;
                color: #374151;
                margin: 0 0 1rem 0;
            }
            .info-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
                margin-bottom: 2rem;
                padding: 1rem;
                background: #f9fafb;
                border-radius: 8px;
            }
            .info-column {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            .info-item {
                display: flex;
                justify-content: space-between;
                padding: 0.5rem 0;
                border-bottom: 1px solid #e5e7eb;
            }
            .info-label {
                font-weight: 600;
                color: #374151;
            }
            .info-value {
                color: #6b7280;
            }
            .content-section {
                margin-bottom: 2rem;
            }
            .section-title {
                font-size: 1.2rem;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid #e5e7eb;
            }
            .content-section p, .content-section div {
                line-height: 1.6;
                margin-bottom: 0.5rem;
            }
            .content-section strong {
                color: #1f2937;
                font-weight: 600;
            }
            .medication-item, .exam-item {
                background: #f9fafb;
                padding: 1rem;
                margin-bottom: 1rem;
                border-radius: 8px;
                border-left: 4px solid #3b82f6;
            }
            .medication-name, .exam-name {
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 0.5rem;
            }
            .medication-details, .exam-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                font-size: 0.9rem;
                color: #6b7280;
            }
            .signature-section {
                margin-top: 3rem;
                display: flex;
                justify-content: space-between;
                align-items: end;
            }
            .signature-line {
                border-bottom: 1px solid #333;
                width: 200px;
                margin-top: 2rem;
            }
            .signature-text {
                font-size: 0.9rem;
                color: #6b7280;
                margin-top: 0.5rem;
            }
            .footer {
                margin-top: 3rem;
                text-align: center;
                font-size: 0.8rem;
                color: #9ca3af;
                border-top: 1px solid #e5e7eb;
                padding-top: 1rem;
            }
        </style>
    `;

    const getTitle = () => {
        switch (type) {
            case 'receta': return 'RECETA MÉDICA';
            case 'examen': return 'SOLICITUD DE EXÁMENES';
            case 'informe': return 'INFORME MÉDICO';
            default: return 'DOCUMENTO MÉDICO';
        }
    };

    const getContent = () => {
        switch (type) {
            case 'receta':
                return `
                    <div class="content-section">
                        <h3 class="section-title">Medicamentos Prescritos</h3>
                        ${medications.length > 0 ? medications.map(med => `
                            <div class="medication-item">
                                <div class="medication-name">${med.name}</div>
                                <div class="medication-details">
                                    <div><strong>Dosis:</strong> ${med.dosage}</div>
                                    <div><strong>Frecuencia:</strong> ${med.frequency}</div>
                                    <div><strong>Duración:</strong> ${med.duration}</div>
                                    ${med.instructions ? `<div><strong>Instrucciones:</strong> ${med.instructions}</div>` : ''}
                                </div>
                            </div>
                        `).join('') : '<p>No se prescribieron medicamentos.</p>'}
                    </div>
                `;
            case 'examen':
                return `
                    <div class="content-section">
                        <h3 class="section-title">Exámenes Solicitados</h3>
                        ${exams.length > 0 ? exams.map(exam => `
                            <div class="exam-item">
                                <div class="exam-name">${exam.name}</div>
                                <div class="exam-details">
                                    <div><strong>Descripción:</strong> ${exam.description}</div>
                                    ${exam.instructions ? `<div><strong>Instrucciones:</strong> ${exam.instructions}</div>` : ''}
                                </div>
                            </div>
                        `).join('') : '<p>No se solicitaron exámenes.</p>'}
                    </div>
                `;
            case 'informe':
                return `
                    <div class="content-section">
                        <h3 class="section-title">Resumen Ejecutivo</h3>
                        <div>${formatReportContent(content.medicalSummary)}</div>
                    </div>
                    <div class="content-section">
                        <h3 class="section-title">Informe Médico Detallado</h3>
                        <div>${formatReportContent(content.generalReport)}</div>
                    </div>
                    ${content.transcription ? `
                    <div class="content-section">
                        <h3 class="section-title">Transcripción de la Consulta</h3>
                        <p>${content.transcription}</p>
                    </div>
                    ` : ''}
                `;
            default:
                return '';
        }
    };

    return `
        <!doctype html>
        <html>
        <head>
            <meta charset="UTF-8" />
            <title>${getTitle()}</title>
            ${baseStyles}
        </head>
        <body>
            <div class="header">
                <h1 class="clinic-name">MEDITALK</h1>
                <h2 class="title">${getTitle()}</h2>
            </div>

            <div class="info-section">
                <div class="info-column">
                    <div class="info-item">
                        <span class="info-label">Paciente:</span>
                        <span class="info-value">${patientName}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">ID Paciente:</span>
                        <span class="info-value">${patientId}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Fecha:</span>
                        <span class="info-value">${date}</span>
                    </div>
                </div>
                <div class="info-column">
                    <div class="info-item">
                        <span class="info-label">Médico:</span>
                        <span class="info-value">${doctorName}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">ID Médico:</span>
                        <span class="info-value">${doctorId}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Tipo:</span>
                        <span class="info-value">${getTitle()}</span>
                    </div>
                </div>
            </div>

            ${getContent()}

            <div class="signature-section">
                <div>
                    <div class="signature-line"></div>
                    <div class="signature-text">Firma del Médico</div>
                </div>
                <div>
                    <div class="signature-line"></div>
                    <div class="signature-text">Fecha</div>
                </div>
            </div>

            <div class="footer">
                <p>Documento generado por Meditalk - Sistema de Gestión Médica</p>
                <p>Este documento es confidencial y está destinado únicamente al paciente y su médico tratante.</p>
            </div>
        </body>
        </html>
    `;
};

export const generatePDF = async (data: PDFGenerationData): Promise<Blob> => {
    console.log('data', data);
    console.log('generatePDF data', data);
    const html = generateHTML(data);

    // Crear un blob con el HTML
    const blob = new Blob([html], { type: 'text/html' });

    // Para generar PDF real, necesitarías una librería como jsPDF o Puppeteer
    // Por ahora retornamos el HTML como blob
    return blob;
};

export const downloadPDF = (data: PDFGenerationData, filename: string) => {
    generatePDF(data).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });
};

export const generatePDFWithAI = async (data: PDFGenerationData, filename: string) => {
    try {
        const response = await fetch('/api/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: `Genera un ${data.type} médico profesional basado en la siguiente información:`,
                type: data.type,
                transcription: data.content.transcription || '',
                summary: data.content.medicalSummary || '',
                report: typeof data.content.generalReport === 'string'
                    ? data.content.generalReport
                    : JSON.stringify(data.content.generalReport)
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Error generating PDF with AI:', error);
        // Fallback to local PDF generation
        downloadPDF(data, filename);
    }
};
