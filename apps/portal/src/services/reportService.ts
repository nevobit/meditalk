import { api } from '../shared/api';

export interface Report {
    id: string;
    userId: string;
    audioMetadata: {
        duration: number;
        size: number;
        filename: string;
        mimeType: string;
    };
    aiConfig: {
        model: 'whisper' | 'whisper-large' | 'gemini-pro' | 'gpt-4';
        language: 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt';
    };
    templateId: string;
    transcription: string;
    medicalSummary: string;
    generalReport: string;
    processingTimes: {
        transcriptionTime: number;
        generationTime: number;
        totalTime: number;
    };
    status: 'processing' | 'completed' | 'failed';
    error?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateReportRequest {
    userId: string;
    audioMetadata: {
        duration: number;
        size: number;
        filename: string;
        mimeType: string;
    };
    aiConfig: {
        model: 'whisper' | 'whisper-large' | 'gemini-pro' | 'gpt-4';
        language: 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt';
    };
    templateId: string;
    transcription: string;
    medicalSummary: string;
    generalReport: string;
    processingTimes: {
        transcriptionTime: number;
        generationTime: number;
        totalTime: number;
    };
    status: 'processing' | 'completed' | 'failed';
    error?: string;
}

export interface UpdateReportRequest {
    userId: string;
    transcription?: string;
    medicalSummary?: string;
    generalReport?: string;
    status?: 'processing' | 'completed' | 'failed';
    error?: string;
}

export interface ReportsResponse {
    success: boolean;
    data: Report[];
    count: number;
}

export interface ReportResponse {
    success: boolean;
    data: Report;
}

// Report service functions
export const getReports = async (userId: string): Promise<Report[]> => {
    const response = await api.get<ReportsResponse>(`/users/${userId}/reports`);
    console.log('response', response.data);
    return response.data.data;
};

export const getReportById = async (id: string): Promise<Report> => {
    const response = await api.get<ReportResponse>(`/reports/${id}`);
    return response.data.data;
};

export const createReport = async (data: CreateReportRequest): Promise<Report> => {
    const response = await api.post<ReportResponse>('/reports', data);
    return response.data.data;
};

export const updateReport = async (id: string, data: UpdateReportRequest): Promise<Report> => {
    console.log('updateReport data', data);
    const response = await api.put<ReportResponse>(`/reports/${id}`, data);
    return response.data.data;
};

export const processAudioAndSave = async (data: {
    audioFile: File;
    audioMetadata: {
        duration: number;
        size: number;
        filename: string;
        mimeType: string;
    };
    aiConfig: {
        model: 'whisper' | 'whisper-large' | 'gemini-pro' | 'gpt-4';
        language: 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt';
    };
    templateId: string;
    userId: string;
}): Promise<{
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
}> => {
    // Convert file to base64
    const audioBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(data.audioFile);
    });

    const requestBody = {
        audioFile: audioBase64,
        audioMetadata: data.audioMetadata,
        aiConfig: data.aiConfig,
        templateId: data.templateId,
        userId: data.userId
    };

    const response = await api.post('/reports/process-audio', requestBody);
    return response.data.data;
};
