import { Collection, getModel } from '@mdi/constant-definitions';
import { ReportSchemaMongo } from '@mdi/contracts';
import type { UpdateReportDto, Report, CreateReportDto } from '@mdi/contracts';

export const updateReport = async (id: string, data: UpdateReportDto): Promise<Report> => {
    const ReportModel = getModel<Report>(Collection.REPORTS, ReportSchemaMongo);

    // First, try to find the existing report
    const existingReport = await ReportModel.findById(id);

    if (!existingReport) {
        // If report doesn't exist, create a new one
        // We need to provide required fields for creation
        const createData: CreateReportDto = {
            userId: data.userId || 'unknown-user',
            audioMetadata: data.audioMetadata || {
                duration: 0,
                size: 0,
                filename: 'unknown.mp3',
                mimeType: 'audio/mpeg'
            },
            aiConfig: data.aiConfig || {
                model: 'whisper',
                language: 'es'
            },
            templateId: data.templateId || '1',
            transcription: data.transcription || 'Transcripción no disponible',
            medicalSummary: data.medicalSummary || '',
            generalReport: typeof data.generalReport === 'string'
                ? data.generalReport
                : JSON.stringify(data.generalReport || {}),
            processingTimes: data.processingTimes || {
                transcriptionTime: 0,
                generationTime: 0,
                totalTime: 0
            },
            status: data.status || 'processing',
            error: data.error
        };

        const newReport = new ReportModel(createData);
        const savedReport = await newReport.save();

        return {
            id: savedReport._id.toString(),
            userId: savedReport.userId,
            audioMetadata: savedReport.audioMetadata,
            aiConfig: savedReport.aiConfig,
            templateId: savedReport.templateId,
            transcription: savedReport.transcription,
            medicalSummary: savedReport.medicalSummary,
            generalReport: savedReport.generalReport,
            processingTimes: savedReport.processingTimes,
            status: savedReport.status as 'processing' | 'completed' | 'failed',
            error: savedReport.error,
            createdAt: savedReport.createdAt,
            updatedAt: savedReport.updatedAt,
        };
    }

    // If report exists, update it
    const updateData: Partial<Report> = {};

    if (data.userId) updateData.userId = data.userId;
    if (data.audioMetadata) updateData.audioMetadata = data.audioMetadata;
    if (data.aiConfig) updateData.aiConfig = data.aiConfig;
    if (data.templateId) updateData.templateId = data.templateId;
    if (data.transcription) updateData.transcription = data.transcription;
    if (data.medicalSummary) updateData.medicalSummary = data.medicalSummary;
    if (data.generalReport) {
        updateData.generalReport = typeof data.generalReport === 'string'
            ? data.generalReport
            : JSON.stringify(data.generalReport);
    }
    if (data.processingTimes) updateData.processingTimes = data.processingTimes;
    if (data.status) updateData.status = data.status;
    if (data.error !== undefined) updateData.error = data.error;

    const updatedReport = await ReportModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );

    if (!updatedReport) {
        throw new Error('Failed to update report');
    }

    return {
        id: updatedReport._id.toString(),
        userId: updatedReport.userId,
        audioMetadata: updatedReport.audioMetadata,
        aiConfig: updatedReport.aiConfig,
        templateId: updatedReport.templateId,
        transcription: updatedReport.transcription,
        medicalSummary: updatedReport.medicalSummary,
        generalReport: updatedReport.generalReport,
        processingTimes: updatedReport.processingTimes,
        status: updatedReport.status as 'processing' | 'completed' | 'failed',
        error: updatedReport.error,
        createdAt: updatedReport.createdAt,
        updatedAt: updatedReport.updatedAt,
    };
};
