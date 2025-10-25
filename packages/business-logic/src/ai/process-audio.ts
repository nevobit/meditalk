import { transcribe } from './transcribe';
import { generateMedicalReport } from './generate-report';
import type { ProcessAudioDto, ProcessAudioResponse, TranscribeAudioDto } from '@mdi/contracts';

export const processAudio = async (data: ProcessAudioDto): Promise<ProcessAudioResponse> => {
    const startTime = Date.now();

    try {
        const transcriptionStartTime = Date.now();
        const transcriptionResult = await transcribe({
            filename: data.audioMetadata.filename,
            file: data.audioFile as Buffer<ArrayBufferLike>, 
            model: data.aiConfig.model,
            mimetype: data.audioMetadata.mimeType,
            language: data.aiConfig.language
        });
        const transcriptionEndTime = Date.now();

        if (transcriptionResult.error) {
            return {
                reportId: '', // Will be set by the caller
                status: 'failed',
                error: transcriptionResult.error
            };
        }

        // Step 2: Generate medical report
        const generationStartTime = Date.now();
        const reportResult = await generateMedicalReport({
            transcription: transcriptionResult.transcript,
            templateId: data.templateId,
            aiConfig: data.aiConfig,
            userId: data.userId
        });
        const generationEndTime = Date.now();

        const totalTime = Date.now() - startTime;

        return {
            reportId: '', // Will be set by the caller
            status: 'completed',
            transcription: transcriptionResult.transcript,
            medicalSummary: reportResult.medicalSummary,
            generalReport: reportResult.generalReport,
            processingTimes: {
                transcriptionTime: transcriptionEndTime - transcriptionStartTime,
                generationTime: generationEndTime - generationStartTime,
                totalTime: totalTime
            }
        };

    } catch (error) {
        console.error('Error processing audio:', error);
        return {
            reportId: '', // Will be set by the caller
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

export const transcribeAudio = async (data: TranscribeAudioDto) => {
    const result = await transcribe({
        filename: data.audioMetadata.filename,
        file: data.audioFile as Buffer<ArrayBufferLike>,
        model: data.aiConfig.model,
        mimetype: data.audioMetadata.mimeType,
        language: data.aiConfig.language
    });

    if (result.error) {
        throw new Error(result.error);
    }

    return {
        transcription: result.transcript,
        processingTime: result.timings?.apiMs || 0
    };
};
