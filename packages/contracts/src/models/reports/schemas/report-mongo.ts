import { Schema } from 'mongoose';
import type { Report } from './report';

export const ReportSchemaMongo = new Schema<Report>(
    {
        userId: { type: String, required: true },
        audioMetadata: {
            duration: { type: Number, required: true },
            size: { type: Number, required: true },
            filename: { type: String, required: true },
            mimeType: { type: String, required: true }
        },
        aiConfig: {
            model: {
                type: String,
                required: true,
                enum: ['whisper', 'whisper-large', 'gemini-pro', 'gpt-4']
            },
            language: {
                type: String,
                required: true,
                enum: ['es', 'en', 'fr', 'de', 'it', 'pt']
            }
        },
        templateId: { type: String, required: true },
        transcription: { type: String, required: true },
        medicalSummary: { type: String, required: true },
        generalReport: { type: String, required: true },
        processingTimes: {
            transcriptionTime: { type: Number, required: true },
            generationTime: { type: Number, required: true },
            totalTime: { type: Number, required: true }
        },
        status: {
            type: String,
            required: true,
            enum: ['processing', 'completed', 'failed'],
            default: 'processing'
        },
        error: { type: String }
    },
    {
        versionKey: false,
        timestamps: true,
    }
);

ReportSchemaMongo.index({ userId: 1 });
ReportSchemaMongo.index({ status: 1 });
ReportSchemaMongo.index({ createdAt: -1 });
