# MongoDB Usage Example for Reports

## Overview

This document provides examples of how to use the Reports API with MongoDB as the database backend.

## Database Connection

The system uses MongoDB with Mongoose for data persistence. The connection is established through the `@mdi/data-sources` package.

## Schema Definition

The Report schema is defined in `packages/contracts/src/models/reports/schemas/report-mongo.ts`:

```typescript
export const ReportSchemaMongo = new Schema<Report>(
  {
    userId: { type: String, required: true },
    audioMetadata: {
      duration: { type: Number, required: true },
      size: { type: Number, required: true },
      filename: { type: String, required: true },
      mimeType: { type: String, required: true },
    },
    aiConfig: {
      model: {
        type: String,
        required: true,
        enum: ['whisper', 'whisper-large', 'gemini-pro', 'gpt-4'],
      },
      language: {
        type: String,
        required: true,
        enum: ['es', 'en', 'fr', 'de', 'it', 'pt'],
      },
    },
    templateId: { type: String, required: true },
    transcription: { type: String, required: true },
    medicalSummary: { type: String, required: true },
    generalReport: { type: String, required: true },
    processingTimes: {
      transcriptionTime: { type: Number, required: true },
      generationTime: { type: Number, required: true },
      totalTime: { type: Number, required: true },
    },
    status: {
      type: String,
      required: true,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    error: { type: String },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

// Indexes for performance
ReportSchemaMongo.index({ userId: 1 });
ReportSchemaMongo.index({ status: 1 });
ReportSchemaMongo.index({ createdAt: -1 });
```

## Business Logic Usage

### Creating a Report

```typescript
import { createReport } from '@mdi/business-logic';
import type { CreateReportDto } from '@mdi/contracts';

const reportData: CreateReportDto = {
  userId: 'user-123',
  audioMetadata: {
    duration: 120,
    size: 1024000,
    filename: 'consultation.wav',
    mimeType: 'audio/wav',
  },
  aiConfig: {
    model: 'whisper',
    language: 'es',
  },
  templateId: '1',
  transcription: 'Patient complains of chest pain...',
  medicalSummary: 'Patient with chest pain, requires further evaluation',
  generalReport: 'Detailed medical report...',
  processingTimes: {
    transcriptionTime: 5000,
    generationTime: 3000,
    totalTime: 8000,
  },
  status: 'completed',
};

const report = await createReport(reportData);
console.log('Created report:', report.id);
```

### Finding Reports

```typescript
import { findReportById, findReportsByUserId } from '@mdi/business-logic';

// Find by ID
const report = await findReportById('report-123');
if (report) {
  console.log('Found report:', report.transcription);
}

// Find by user
const userReports = await findReportsByUserId('user-123');
console.log(`User has ${userReports.length} reports`);
```

### Updating Reports

```typescript
import { updateReport } from '@mdi/business-logic';

const updatedReport = await updateReport('report-123', {
  status: 'completed',
  medicalSummary: 'Updated medical summary',
});

if (updatedReport) {
  console.log('Report updated successfully');
}
```

## API Endpoints

### 1. Create Report

```bash
curl -X POST http://localhost:3000/api/v1/reports \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "audioMetadata": {
      "duration": 120,
      "size": 1024000,
      "filename": "consultation.wav",
      "mimeType": "audio/wav"
    },
    "aiConfig": {
      "model": "whisper",
      "language": "es"
    },
    "templateId": "1",
    "transcription": "Patient complains of chest pain...",
    "medicalSummary": "Patient with chest pain, requires further evaluation",
    "generalReport": "Detailed medical report...",
    "processingTimes": {
      "transcriptionTime": 5000,
      "generationTime": 3000,
      "totalTime": 8000
    },
    "status": "completed"
  }'
```

### 2. Process Audio and Save

```bash
curl -X POST http://localhost:3000/api/v1/reports/process-audio \
  -H "Content-Type: application/json" \
  -d '{
    "audioFile": "<base64-encoded-audio>",
    "audioMetadata": {
      "duration": 120,
      "size": 1024000,
      "filename": "consultation.wav",
      "mimeType": "audio/wav"
    },
    "aiConfig": {
      "model": "whisper",
      "language": "es"
    },
    "templateId": "1",
    "userId": "user-123"
  }'
```

### 3. Get Report by ID

```bash
curl -X GET http://localhost:3000/api/v1/reports/report-123
```

### 4. Get Reports by User

```bash
curl -X GET http://localhost:3000/api/v1/users/user-123/reports
```

### 5. Update Report

```bash
curl -X PUT http://localhost:3000/api/v1/reports/report-123 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "medicalSummary": "Updated medical summary"
  }'
```

## MongoDB Collections

The system uses the following MongoDB collections:

- **`reports`**: Stores all medical reports with full metadata
- **`users`**: User information (existing)
- **`policies`**: System policies (existing)

## Indexes

The following indexes are automatically created for optimal performance:

```javascript
// User-specific queries
db.reports.createIndex({ userId: 1 });

// Status filtering
db.reports.createIndex({ status: 1 });

// Chronological sorting
db.reports.createIndex({ createdAt: -1 });

// Compound index for user + status queries
db.reports.createIndex({ userId: 1, status: 1 });
```

## Error Handling

All operations include proper error handling:

```typescript
try {
  const report = await createReport(data);
  console.log('Success:', report.id);
} catch (error) {
  console.error('Error creating report:', error.message);
}
```

## Testing

Use the test endpoint to verify MongoDB integration:

```bash
curl -X POST http://localhost:3000/api/v1/reports/test-integration \
  -H "Content-Type: application/json" \
  -d '{
    "testType": "create",
    "data": {
      "userId": "test-user",
      "audioMetadata": {
        "duration": 60,
        "size": 500000,
        "filename": "test.wav",
        "mimeType": "audio/wav"
      },
      "aiConfig": {
        "model": "whisper",
        "language": "es"
      },
      "templateId": "1",
      "transcription": "Test transcription",
      "medicalSummary": "Test summary",
      "generalReport": "Test report",
      "processingTimes": {
        "transcriptionTime": 1000,
        "generationTime": 500,
        "totalTime": 1500
      },
      "status": "completed"
    }
  }'
```
