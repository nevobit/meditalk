import axios from 'axios';
import type { GenerateReportDto, GenerateReportResponse } from '@mdi/contracts';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const generateMedicalReport = async (data: GenerateReportDto): Promise<GenerateReportResponse> => {
    const startTime = Date.now();

    try {
        let response: GenerateReportResponse;

        switch (data.aiConfig.model) {
            case 'gemini-pro':
                response = await generateWithGemini(data);
                break;
            case 'gpt-4':
                response = await generateWithOpenAI(data);
                break;
            case 'whisper':
                response = await generateWithOpenAI(data);
                break;
            default:
                throw new Error(`Unsupported AI model: ${data.aiConfig.model}`);
        }

        const endTime = Date.now();
        response.processingTime = endTime - startTime;

        return response;
    } catch (error) {
        console.error('Error generating medical report:', error);
        throw new Error(`Failed to generate medical report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

async function generateWithGemini(data: GenerateReportDto): Promise<GenerateReportResponse> {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured');
    }

    const prompt = buildMedicalPrompt(data.transcription, data.templateId, data.aiConfig.language);

    const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.3,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        },
        {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        }
    );

    const generatedText = response.data.candidates[0].content.parts[0].text;
    return parseGeneratedContent(generatedText);
}

async function generateWithOpenAI(data: GenerateReportDto): Promise<GenerateReportResponse> {
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
    }

    const prompt = buildMedicalPrompt(data.transcription, data.templateId, data.aiConfig.language);

    const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
            model: 'gpt-4.1',
            messages: [
                {
                    role: 'system',
                    content: 'Eres un asistente médico especializado en generar informes médicos profesionales. Responde siempre en formato JSON válido.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.3,
            max_tokens: 2048,
        },
        {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            timeout: 60000,
        }
    );

    const generatedText = response.data.choices[0].message.content;
    return parseGeneratedContent(generatedText);
}

function buildMedicalPrompt(transcription: string, templateId: string, language: string): string {
    const templates = {
        '1': 'Consulta General',
        '2': 'Cirugía',
        '3': 'Emergencias',
        '4': 'Pediatría',
        '5': 'Cardiología',
        '6': 'Ginecología'
    };

    const templateName = templates[templateId as keyof typeof templates] || templates['1'];

    return `
Eres un médico especializado en generar informes médicos profesionales. Analiza la siguiente transcripción de una consulta médica y genera un informe estructurado.

TRANSCRIPCIÓN DE LA CONSULTA:
${transcription}

TIPO DE CONSULTA: ${templateName}

INSTRUCCIONES:
- Extrae toda la información médica relevante de la transcripción
- Si algún aspecto no se menciona en la transcripción, escribe "No se discutió" o "No se mencionó"
- Usa terminología médica apropiada
- Mantén un tono profesional y objetivo
- Responde en ${language === 'es' ? 'español' : 'inglés'}

FORMATO REQUERIDO:
Genera un informe médico con la siguiente estructura exacta:

Informe ${templateName}
Motivo de Consulta: [Extraer el motivo principal de la consulta]
Síntomas: [Listar todos los síntomas mencionados]
Historia Personal: [Antecedentes médicos personales mencionados]
Historia Familiar: [Antecedentes familiares mencionados]
Exploración Física: [Hallazgos del examen físico mencionados]
Diagnóstico: [Diagnóstico o impresión diagnóstica mencionada]
Tratamiento Prescrito: [Tratamientos, medicamentos o terapias prescritas]
Exámenes Solicitados: [Estudios de laboratorio, imágenes o pruebas solicitadas]
Derivaciones: [Especialistas o servicios a los que se deriva]
Receta Médica: [Medicamentos específicos recetados con dosis si se mencionan]

FORMATO DE RESPUESTA (JSON):
{
  "medicalSummary": "Resumen ejecutivo de 2-3 líneas con los puntos más importantes",
  "generalReport": "Informe completo con la estructura exacta mostrada arriba"
}

IMPORTANTE: 
- Si algún campo no se menciona en la transcripción, escribe "No se discutió" o "No se mencionó"
- Mantén la estructura exacta del formato
- Responde SOLO con el JSON válido, sin texto adicional
    `.trim();
}

function parseGeneratedContent(content: string): GenerateReportResponse {
    try {
        // Try to parse as JSON first
        const parsed = JSON.parse(content);
        return {
            medicalSummary: parsed.medicalSummary || '',
            generalReport: parsed.generalReport || '',
            processingTime: 0 // Will be set by caller
        };
    } catch {
        const medicalSummaryMatch = content.match(/##? Resumen Médico[:\s]*([\s\S]*?)(?=##? |$)/i);
        const generalReportMatch = content.match(/##? Informe General[:\s]*([\s\S]*?)(?=##? |$)/i);

        return {
            medicalSummary: medicalSummaryMatch?.[1]?.trim() || content.substring(0, 500),
            generalReport: generalReportMatch?.[1]?.trim() || content,
            processingTime: 0 // Will be set by caller
        };
    }
}
