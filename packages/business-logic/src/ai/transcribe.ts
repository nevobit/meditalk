import fs from 'fs';
import path from 'path';
import type { Readable } from "node:stream";
import axios from 'axios';
import FormData from 'form-data';

type UploadFile = Readable & { bytesRead?: number };

type AudioInput = {
    filename: string;
    file: UploadFile | Buffer;
    model: string;
    mimetype: string;
    language: string;
};

const SUPPORTED_AUDIO_TYPES = [
    'audio/mpeg',
    'audio/mp4',
    'audio/mp3',
    'audio/wav',
    'audio/webm',
    'audio/ogg',
    'audio/m4a'
];

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MAX_FILE_SIZE = 25 * 1024 * 1024;

export const transcribe = async (audio: AudioInput) => {
    if (!OPENAI_API_KEY) {
        return {
            error: 'OpenAI API key not configured',
            detail: 'Please set OPENAI_API_KEY environment variable'
        };
    }

    if (!audio) {
        return {
            error: 'No audio file uploaded',
            detail: 'Please provide an audio file in the request'
        };
    }

    if (!SUPPORTED_AUDIO_TYPES.includes(audio.mimetype)) {
        return {
            error: 'Unsupported file type',
            detail: `Supported types: ${SUPPORTED_AUDIO_TYPES.join(', ')}`
        };
    }

    // Check file size
    const fileSize = Buffer.isBuffer(audio.file) ? audio.file.length : (audio.file.bytesRead || 0);
    if (fileSize > MAX_FILE_SIZE) {
        return {
            error: 'File too large',
            detail: `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        };
    }

    const tempPath = path.join('/tmp', `transcribe_${Date.now()}_${audio.filename}`);

    // Handle both Buffer and Stream
    if (Buffer.isBuffer(audio.file)) {
        // Write buffer directly to file
        fs.writeFileSync(tempPath, audio.file);
    } else {
        // Handle stream as before
        await new Promise<void>((resolve, reject) => {
            const writeStream = fs.createWriteStream(tempPath);
            (audio.file as UploadFile).pipe(writeStream);
            writeStream.on('finish', () => resolve());
            writeStream.on('error', (err) => reject(err));
        });
    }

    const form = new FormData();
    form.append('file', fs.createReadStream(tempPath), {
        filename: audio.filename,
        contentType: audio.mimetype
    });
    form.append('model', 'whisper-1');
    form.append('language', audio.language);
    form.append('response_format', 'json');

    const t2 = performance.now();
    const response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        form,
        {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                ...form.getHeaders(),
            },
            timeout: 50000,
        }
    );
    const t3 = performance.now();


    fs.unlink(tempPath, (err) => {
        if (err) {
            console.error('Error deleting temp file:', err);
        }
    });

    const transcript = response.data.text;

    return {
        transcript,
        language: response.data.language || 'es',
        timings: {
            apiMs: Math.round(t3 - t2),
        },
    };
};