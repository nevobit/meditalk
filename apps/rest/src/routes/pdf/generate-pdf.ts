import { type RouteOptions } from 'fastify';
import axios from 'axios';
import { PDFDocument, PDFFont, rgb, StandardFonts } from 'pdf-lib';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const generatePdfRoute: RouteOptions = {
    method: 'POST',
    url: '/generate-pdf',
    schema: {
        description: 'Generate PDF document from medical data',
        tags: ['PDF'],
        body: {
            type: 'object',
            properties: {
                prompt: { type: 'string' },
                type: { type: 'string', enum: ['informe', 'receta', 'examen'] },
                transcription: { type: 'string' },
                summary: { type: 'string' },
                report: { type: 'string' }
            },
            required: ['prompt', 'type', 'transcription', 'summary', 'report']
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' }
                }
            },
            400: {
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    detail: { type: 'string' }
                }
            },
            500: {
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    detail: { type: 'string' }
                }
            }
        }
    },
    handler: async (request, reply) => {
        try {
            const { prompt, type } = request.body as { prompt: string; type: string };

            if (!OPENAI_API_KEY) {
                return reply.code(500).send({
                    error: 'OpenAI API key not configured',
                    detail: 'Please configure OPENAI_API_KEY environment variable'
                });
            }

            // Llamar a OpenAI para generar el contenido del documento
            const aiResponse = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4.1-mini-2025-04-14',
                    messages: [
                        {
                            role: 'system',
                            content: 'Eres un asistente médico experto especializado en generar documentos médicos profesionales. Responde siempre en formato de texto plano, sin markdown, listo para ser convertido a PDF.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 3000,
                    temperature: 0.3
                },
                {
                    headers: {
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            const generatedContent = aiResponse.data.choices[0].message.content;

            // Crear el PDF usando pdf-lib
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            // Configuración de texto
            const fontSize = 12;
            const lineHeight = fontSize * 1.2;
            const margin = 50;
            const maxWidth = page.getWidth() - (margin * 2);
            let yPosition = page.getHeight() - margin;

            // Función para agregar texto con wrap
            const addText = (text: string, isBold = false, size = fontSize) => {
                const currentFont = isBold ? boldFont : font;
                const lines = wrapText(text, currentFont, size, maxWidth);

                for (const line of lines) {
                    if (yPosition < margin) {
                        // Agregar nueva página si es necesario
                        const newPage = pdfDoc.addPage([595.28, 841.89]);
                        yPosition = newPage.getHeight() - margin;
                        newPage.drawText(line, {
                            x: margin,
                            y: yPosition,
                            size,
                            font: currentFont,
                            color: rgb(0, 0, 0)
                        });
                    } else {
                        page.drawText(line, {
                            x: margin,
                            y: yPosition,
                            size,
                            font: currentFont,
                            color: rgb(0, 0, 0)
                        });
                    }
                    yPosition -= lineHeight;
                }
            };

            // Función para wrap de texto
            const wrapText = (text: string, font: PDFFont, size: number, maxWidth: number): string[] => {
                const words = text.split(' ');
                const lines: string[] = [];
                let currentLine = '';

                for (const word of words) {
                    const testLine = currentLine + (currentLine ? ' ' : '') + word;
                    const textWidth = font.widthOfTextAtSize(testLine, size);

                    if (textWidth <= maxWidth) {
                        currentLine = testLine;
                    } else {
                        if (currentLine) {
                            lines.push(currentLine);
                            currentLine = word;
                        } else {
                            lines.push(word);
                        }
                    }
                }

                if (currentLine) {
                    lines.push(currentLine);
                }

                return lines;
            };

            // Agregar contenido según el tipo
            switch (type) {
                case 'informe':
                    addText('INFORME MÉDICO', true, 16);
                    yPosition -= 20;
                    addText(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, false, 10);
                    yPosition -= 30;
                    break;
                case 'receta':
                    addText('RECETA MÉDICA', true, 16);
                    yPosition -= 20;
                    addText(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, false, 10);
                    yPosition -= 30;
                    break;
                case 'examen':
                    addText('SOLICITUD DE EXÁMENES', true, 16);
                    yPosition -= 20;
                    addText(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, false, 10);
                    yPosition -= 30;
                    break;
            }

            // Agregar el contenido generado por IA
            addText(generatedContent);

            // Agregar firma al final
            yPosition -= 50;
            addText('_________________________', false, 10);
            yPosition -= 20;
            addText('Firma del Médico', false, 10);

            // Convertir a bytes
            const pdfBytes = await pdfDoc.save();

            // Enviar el PDF como respuesta
            reply.type('application/pdf');
            reply.header('Content-Disposition', `attachment; filename="${type === 'informe' ? 'Informe Médico' : type === 'receta' ? 'Receta Médica' : 'Solicitud de Exámenes'}.pdf"`);

            return reply.send(Buffer.from(pdfBytes));

        } catch (error) {
            console.error('PDF generation error:', error);
            return reply.code(500).send({
                error: 'Internal Server Error',
                detail: (error as Error).message
            });
        }
    }
};
