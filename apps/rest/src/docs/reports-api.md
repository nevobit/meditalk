# Reports API Documentation

## Overview

The Reports API provides functionality to save, retrieve, and manage medical reports generated from audio transcriptions. The system integrates AI processing with database persistence.

## Database Schema

The reports are stored in a MongoDB database using Mongoose with the following structure:

```typescript
interface Report {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

### 1. Create Report

**POST** `/api/v1/reports`

Creates a new report record in the database.

**Request Body:**

```json
{
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
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "report-123",
    "userId": "user-123"
    // ... other fields
  },
  "message": "Report created successfully"
}
```

### 2. Process Audio and Save Report

**POST** `/api/v1/reports/process-audio`

Processes audio file through AI pipeline and automatically saves the result to database.

**Request Body:**

```json
{
  "audioFile": "<binary data>",
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
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "reportId": "report-123",
    "status": "completed",
    "transcription": "Patient complains of chest pain...",
    "medicalSummary": "Patient with chest pain, requires further evaluation",
    "generalReport": "Detailed medical report...",
    "processingTimes": {
      "transcriptionTime": 5000,
      "generationTime": 3000,
      "totalTime": 8000
    }
  },
  "message": "Audio processing started successfully"
}
```

### 3. Get Report by ID

**GET** `/api/v1/reports/:id`

Retrieves a specific report by its ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "report-123",
    "userId": "user-123"
    // ... other fields
  }
}
```

### 4. Get Reports by User

**GET** `/api/v1/users/:userId/reports`

Retrieves all reports for a specific user.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "report-123",
      "userId": "user-123"
      // ... other fields
    }
  ],
  "count": 1
}
```

### 5. Update Report

**PUT** `/api/v1/reports/:id`

Updates an existing report.

**Request Body:**

```json
{
  "status": "completed",
  "medicalSummary": "Updated medical summary",
  "generalReport": "Updated general report"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "report-123"
    // ... updated fields
  },
  "message": "Report updated successfully"
}
```

## Business Logic Functions

The business logic layer provides the following functions:

### Database Operations

- `createReport(data: CreateReportDto): Promise<Report>`
- `findReportById(id: string): Promise<Report | null>`
- `findReportsByUserId(userId: string): Promise<Report[]>`
- `updateReport(id: string, data: UpdateReportDto): Promise<Report | null>`

### Integrated Processing

- `processAudioAndSaveReport(data: ProcessAudioDto): Promise<ProcessAudioResponse>`

## Error Handling

All endpoints return consistent error responses following the JSON Problem Details format:

```json
{
  "success": false,
  "error": {
    "type": "ErrorType",
    "title": "Error Title",
    "status": 400,
    "detail": "Detailed error message",
    "instance": "/api/v1/reports"
  }
}
```

## Testing

A test endpoint is available for integration testing:

**POST** `/api/v1/reports/test-integration`

**Request Body:**

```json
{
  "testType": "create|find|update|findByUser",
  "data": {
    /* test data */
  },
  "id": "report-id",
  "userId": "user-id"
}
```

## Usage Examples

### Complete Workflow

1. Upload audio file and process it:

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

2. Retrieve the processed report:

```bash
curl -X GET http://localhost:3000/api/v1/reports/{reportId}
```

3. Get all reports for a user:

```bash
curl -X GET http://localhost:3000/api/v1/users/user-123/reports
```

## Database Setup

The MongoDB database will automatically create the `reports` collection when the first document is inserted. The schema includes proper indexes for optimal query performance:

- `userId` index for user-specific queries
- `status` index for filtering by processing status
- `createdAt` index for chronological sorting

No manual migration is required as MongoDB uses dynamic schemas.
