import { Collection, getModel } from '@mdi/constant-definitions';
import { ReportSchemaMongo } from '@mdi/contracts';
import type { CreateReportDto, Report } from '@mdi/contracts';

export const createReport = async (data: CreateReportDto): Promise<Report> => {
    const ReportModel = getModel<Report>(Collection.REPORTS, ReportSchemaMongo);

    const newReport = new ReportModel({
        userId: data.userId,
        audioMetadata: data.audioMetadata,
        aiConfig: data.aiConfig,
        templateId: data.templateId,
        transcription: data.transcription,
        medicalSummary: data.medicalSummary,
        generalReport: data.generalReport,
        processingTimes: data.processingTimes,
        status: data.status,
        error: data.error,
    });

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
};
