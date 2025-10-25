import { processAudio } from '../ai';
import { createReport, updateReport } from './index';
import type { ProcessAudioDto, ProcessAudioResponse, CreateReportDto } from '@mdi/contracts';

export const processAudioAndSaveReport = async (data: ProcessAudioDto): Promise<ProcessAudioResponse> => {
    // First, create a report record with 'processing' status
    const initialReportData: CreateReportDto = {
        userId: data.userId,
        audioMetadata: data.audioMetadata,
        aiConfig: data.aiConfig,
        templateId: data.templateId,
        transcription: '', // Will be updated after processing
        medicalSummary: '', // Will be updated after processing
        generalReport: '', // Will be updated after processing
        processingTimes: {
            transcriptionTime: 0,
            generationTime: 0,
            totalTime: 0
        },
        status: 'processing'
    };

    const report = await createReport(initialReportData);
    const reportId = report.id;

    try {
        const processResult = await processAudio(data);

        if (processResult.status === 'failed') {
            // Update report with error status
            await updateReport(reportId, {
                status: 'failed',
                error: processResult.error
            });

            return {
                reportId,
                status: 'failed',
                error: processResult.error
            };
        }

        // Update report with successful results
        await updateReport(reportId, {
            transcription: processResult.transcription || '',
            medicalSummary: processResult.medicalSummary || '',
            generalReport: processResult.generalReport || '',
            processingTimes: processResult.processingTimes,
            status: 'completed'
        });

        return {
            reportId,
            status: 'completed',
            transcription: processResult.transcription,
            medicalSummary: processResult.medicalSummary,
            generalReport: processResult.generalReport,
            processingTimes: processResult.processingTimes
        };

    } catch (error) {
        // Update report with error status
        await updateReport(reportId, {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });

        return {
            reportId,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};
