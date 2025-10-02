import { useMutation } from '@tanstack/react-query';
import { processAudio, transcribeAudio, generateReport } from '../../services/audioService';
import { audioKeys } from './audio-keys';
import type {
    ProcessAudioRequest,
    ProcessAudioResponse,
    TranscribeResponse,
    GenerateReportResponse,
    AIConfig
} from '../../services/audioService';

// Mutation for processing complete audio (transcription + report generation)
export const useProcessAudio = () => {
    return useMutation<ProcessAudioResponse, Error, ProcessAudioRequest>({
        mutationKey: audioKeys.mutation('process'),
        mutationFn: processAudio,
    });
};

// Mutation for transcribing audio only
export const useTranscribeAudio = () => {
    return useMutation<TranscribeResponse, Error, {
        audioFile: File;
        aiConfig: AIConfig;
        userId: string;
    }>({
        mutationKey: audioKeys.mutation('transcribe'),
        mutationFn: ({ audioFile, aiConfig, userId }) =>
            transcribeAudio(audioFile, aiConfig, userId),
    });
};

// Mutation for generating report from transcription
export const useGenerateReport = () => {
    return useMutation<GenerateReportResponse, Error, {
        transcription: string;
        templateId: string;
        aiConfig: AIConfig;
        userId: string;
    }>({
        mutationKey: audioKeys.mutation('generate-report'),
        mutationFn: ({ transcription, templateId, aiConfig, userId }) =>
            generateReport(transcription, templateId, aiConfig, userId),
    });
};
