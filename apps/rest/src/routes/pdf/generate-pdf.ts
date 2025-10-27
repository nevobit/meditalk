import { type RouteOptions } from 'fastify';
import axios from 'axios';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface ExtractedMedication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
}

interface ExtractedExam {
    name: string;
    description: string;
    instructions?: string;
}

interface ExtractedData {
    medications: ExtractedMedication[];
    exams: ExtractedExam[];
}

const extractMedicalData = async (transcription: string, summary: string, report: string): Promise<ExtractedData> => {
    try {
        const extractionPrompt = `
Analiza el siguiente contenido médico y extrae información estructurada:

TRANSCRIPCIÓN: ${transcription}
RESUMEN: ${summary}
INFORME: ${report}

Extrae la siguiente información en formato JSON:

1. MEDICAMENTOS (medications) (si los hay):
   - name: nombre del medicamento
   - dosage: dosis (ej: "500mg", "1 tableta")
   - frequency: frecuencia (ej: "cada 8 horas", "2 veces al día")
   - duration: duración del tratamiento (ej: "7 días", "hasta completar")
   - instructions: instrucciones especiales (ej: "con alimentos", "en ayunas")

2. EXÁMENES (exams) (si los hay):
   - name: nombre del examen
   - description: descripción del examen
   - instructions: instrucciones de preparación (ej: "ayuno de 8 horas", "retirar objetos metálicos")

Responde SOLO con el JSON, sin texto adicional. Si no hay medicamentos o exámenes, devuelve arrays vacíos., y cuanod algo no se especifique, di "No se especificó".
`;

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4.1-mini-2025-04-14',
                messages: [
                    {
                        role: 'system',
                        content: 'Eres un asistente médico experto en extraer información estructurada de textos médicos. Responde ÚNICAMENTE con JSON válido.'
                    },
                    {
                        role: 'user',
                        content: extractionPrompt
                    }
                ],
                max_tokens: 2000,
                temperature: 0.1
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        const extractedContent = response.data.choices[0].message.content;
        console.log('extractedContent', extractedContent);
        const parsedData = JSON.parse(extractedContent.replace(/^```json\n|```$/g, '').trim());
        console.log('parsedData', parsedData);
        return {
            medications: parsedData.medications || [],
            exams: parsedData.exams || []
        };
    } catch (error) {
        console.error('Error extracting medical data:', error);
        return {
            medications: [],
            exams: []
        };
    }
};

export const generatePdfRoute: RouteOptions = {
    method: 'POST',
    url: '/generate-pdf',
    handler: async (request, reply) => {
        try {
            const { type, transcription, summary, report } = request.body as {
                prompt: string;
                type: string;
                transcription: string;
                summary: string;
                report: string;
            };

            console.log('transcription', transcription);
            console.log('summary', summary);
            console.log('report', report);

            if (!OPENAI_API_KEY) {
                return reply.code(500).send({
                    error: 'OpenAI API key not configured',
                    detail: 'Please configure OPENAI_API_KEY environment variable'
                });
            }

            const extractedData = await extractMedicalData(transcription, summary, report);

            return reply.code(200).send({
                medications: extractedData.medications,
                exams: extractedData.exams,
                type: type
            });
        }
        catch (error) {
            console.error('Error generating PDF:', error);
            return reply.code(500).send({
                error: 'Internal Server Error',
                detail: (error as Error).message
            });
        }
    }
};
