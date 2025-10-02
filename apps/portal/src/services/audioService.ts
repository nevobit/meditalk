import { api } from '../shared/api';

export interface AudioMetadata {
    duration: number;
    size: number;
    filename: string;
    mimeType: string;
}

export interface AIConfig {
    model: 'whisper' | 'whisper' | 'gemini-pro' | 'gpt-4';
    language: 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt';
}

export interface ProcessAudioRequest {
    audioFile: File;
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
    processingTimes?: {
        transcriptionTime: number;
        generationTime: number;
        totalTime: number;
    };
    error?: string;
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

// Audio processing functions
export const processAudio = async (data: ProcessAudioRequest): Promise<ProcessAudioResponse> => {
    // Convert file to base64
    const audioBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Remove data:audio/mpeg;base64, prefix
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(data.audioFile);
    });

    const requestBody = {
        audio: audioBase64,
        audioMetadata: data.audioMetadata,
        aiConfig: data.aiConfig,
        templateId: data.templateId,
        userId: data.userId
    };

    const response = await api.post<ProcessAudioResponse>('/audio/process', requestBody);

    return response.data;
};

export const transcribeAudio = async (
    audioFile: File,
    aiConfig: AIConfig,
    userId: string
): Promise<TranscribeResponse> => {
    // Convert file to base64
    const audioBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioFile);
    });

    const requestBody = {
        audio: audioBase64,
        aiConfig,
        userId
    };

    const response = await api.post<TranscribeResponse>('/audio/transcribe', requestBody);

    return response.data;
};

export const generateReport = async (
    transcription: string,
    templateId: string,
    aiConfig: AIConfig,
    userId: string
): Promise<GenerateReportResponse> => {
    const response = await api.post<GenerateReportResponse>('/audio/generate-report', {
        transcription,
        templateId,
        model: aiConfig.model,
        language: aiConfig.language,
        userId,
    });

    return response.data;
};
