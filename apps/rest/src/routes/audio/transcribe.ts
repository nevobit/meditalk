import { type RouteOptions } from 'fastify';
import { transcribeAudio } from '@mdi/business-logic';
import type { AIConfig, TranscribeAudioDto, TranscribeResponse } from '@mdi/contracts';

export const transcribeAudioRoute: RouteOptions = {
    method: 'POST',
    url: '/audio/transcribe',
    handler: async (request, reply) => {
        try {
            const { audio, aiConfig, userId } = request.body as { audio: string, aiConfig: AIConfig, userId: string };

            if (!audio) {
                return reply.code(400).send({
                    error: 'No audio file provided',
                    detail: 'Please provide an audio file in the request'
                });
            }

            // Convert base64 to buffer
            const audioBuffer = Buffer.from(audio, 'base64');

            const transcribeData: TranscribeAudioDto = {
                audioFile: audioBuffer,
                audioMetadata: {
                    duration: 0, // Will be calculated by the frontend
                    size: audioBuffer.length,
                    filename: 'audio.mp3',
                    mimeType: 'audio/mpeg'
                },
                aiConfig,
                userId
            };

            const result = await transcribeAudio(transcribeData);

            const response: TranscribeResponse = {
                transcription: result.transcription,
                processingTime: result.processingTime
            };

            return reply.send(response);

        } catch (error) {
            console.error('Transcription error:', error);
            return reply.code(500).send({
                error: 'Transcription failed',
                detail: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
};
