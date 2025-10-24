import type { Base } from '../../../common';

export interface AudioMetadata {
    duration: number; // in seconds
    size: number; // in bytes
    filename: string;
    mimeType: string;
}

export interface ProcessingTimes {
    transcriptionTime: number; // in milliseconds
    generationTime: number; // in milliseconds
    totalTime: number; // in milliseconds
}

export interface AIConfig {
    model: 'whisper' | 'whisper-large' | 'gemini-pro' | 'gpt-4';
    language: 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt';
}

export interface Report extends Base {
    userId: string;
    audioMetadata: AudioMetadata;
    aiConfig: AIConfig;
    templateId: string;
    transcription: string;
    medicalSummary: string;
    generalReport: string;
    processingTimes: ProcessingTimes;
    status: 'processing' | 'completed' | 'failed';
    error?: string;
}
