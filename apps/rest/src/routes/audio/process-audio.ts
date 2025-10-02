import { type RouteOptions } from 'fastify';
import { processAudio } from '@mdi/business-logic';
import type { AIConfig, AudioMetadata, ProcessAudioDto, ProcessAudioResponse } from '@mdi/contracts';

export const processAudioRoute: RouteOptions = {
    method: 'POST',
    url: '/audio/process',
    handler: async (request, reply) => {
        try {
            const { audio, audioMetadata, aiConfig, templateId, userId } = request.body as { audio: string, audioMetadata: AudioMetadata, aiConfig: AIConfig, templateId: string, userId: string };

            if (!audio) {
                return reply.code(400).send({
                    error: 'No audio file provided',
                    detail: 'Please provide an audio file in the request'
                });
            }

            // Convert base64 to buffer
            const audioBuffer = Buffer.from(audio, 'base64');

            const processData: ProcessAudioDto = {
                audioFile: audioBuffer,
                audioMetadata,
                aiConfig,
                templateId,
                userId
            };

            const result = await processAudio(processData);

            const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            result.reportId = reportId;

            const response: ProcessAudioResponse = result;

            return reply.send(response);

        } catch (error) {
            console.error('Audio processing error:', error);
            return reply.code(500).send({
                error: 'Audio processing failed',
                detail: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
};
