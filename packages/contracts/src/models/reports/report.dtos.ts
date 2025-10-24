import type { Report, AudioMetadata, AIConfig, ProcessingTimes } from './schemas';

export type CreateReportDto = Omit<Report, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateReportDto = Partial<CreateReportDto>;

// DTOs for transcription and report generation
export interface TranscribeAudioDto {
    audioFile: unknown;
    audioMetadata: AudioMetadata;
    aiConfig: AIConfig;
    userId: string;
}

export interface GenerateReportDto {
    transcription: string;
    templateId: string;
    aiConfig: AIConfig;
    userId: string;
}

export interface TranscribeResponse {
    transcription: string;
    processingTime: number;
}

export interface GenerateReportResponse {
    medicalSummary: string;
    generalReport: string;
    processingTime: number;
}

export interface ProcessAudioDto {
    audioFile: unknown;
    audioMetadata: AudioMetadata;
    aiConfig: AIConfig;
    templateId: string;
    userId: string;
}

export interface ProcessAudioResponse {
    reportId: string;
    status: 'processing' | 'completed' | 'failed';
    transcription?: string;
    medicalSummary?: string;
    generalReport?: string;
    processingTimes?: ProcessingTimes;
    error?: string;
}
