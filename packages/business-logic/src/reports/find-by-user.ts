import { Collection, getModel } from '@mdi/constant-definitions';
import { ReportSchemaMongo } from '@mdi/contracts';
import type { Report } from '@mdi/contracts';

export const findReportsByUserId = async (userId: string): Promise<Report[]> => {
    const ReportModel = getModel<Report>(Collection.REPORTS, ReportSchemaMongo);

    const reports = await ReportModel.find({ userId }).sort({ createdAt: -1 });

    return reports.map(report => ({
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
    }));
};
