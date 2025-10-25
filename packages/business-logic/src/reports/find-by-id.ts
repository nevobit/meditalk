import { Collection, getModel } from '@mdi/constant-definitions';
import { ReportSchemaMongo } from '@mdi/contracts';
import type { Report } from '@mdi/contracts';

export const findReportById = async (id: string): Promise<Report | null> => {
    const ReportModel = getModel<Report>(Collection.REPORTS, ReportSchemaMongo);

    const report = await ReportModel.findById(id);

    if (!report) {
        return null;
    }

    return {
        id: report._id.toString(),
        userId: report.userId,
        audioMetadata: report.audioMetadata,
        aiConfig: report.aiConfig,
        templateId: report.templateId,
        transcription: report.transcription,
        medicalSummary: report.medicalSummary,
        generalReport: report.generalReport,
        processingTimes: report.processingTimes,
        status: report.status as 'processing' | 'completed' | 'failed',
        error: report.error,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
    };
};
