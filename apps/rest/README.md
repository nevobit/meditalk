# REST API - MediTalk

API REST para el procesamiento de audio y generación de informes médicos.

## Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# API Keys for AI Services
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Instalación

```bash
# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm dev

# Construir para producción
pnpm build
pnpm start
```

## Endpoints

### Audio Processing

#### POST `/api/audio/process`

Procesa un archivo de audio completo (transcripción + generación de informe).

**Body (multipart/form-data):**

- `audio`: Archivo de audio
- `model`: Modelo de IA (`whisper-fast`, `whisper-large`, `gemini-pro`, `gpt-4`)
- `language`: Idioma (`es`, `en`, `fr`, `de`, `it`, `pt`)
- `templateId`: ID del template médico
- `userId`: ID del usuario
- `duration`: Duración del audio en segundos

**Response:**

```json
{
  "reportId": "report_1234567890_abc123",
  "status": "completed",
  "transcription": "Texto transcrito...",
  "medicalSummary": "Resumen médico...",
  "generalReport": "Informe completo...",
  "processingTimes": {
    "transcriptionTime": 1500,
    "generationTime": 3000,
    "totalTime": 4500
  }
}
```

#### POST `/api/audio/transcribe`

Solo transcribe un archivo de audio.

**Body (multipart/form-data):**

- `audio`: Archivo de audio
- `model`: Modelo de IA
- `language`: Idioma
- `userId`: ID del usuario

**Response:**

```json
{
  "transcription": "Texto transcrito...",
  "processingTime": 1500
}
```

#### POST `/api/audio/generate-report`

Genera un informe médico a partir de una transcripción.

**Body (JSON):**

```json
{
  "transcription": "Texto transcrito...",
  "templateId": "1",
  "model": "gemini-pro",
  "language": "es",
  "userId": "user123"
}
```

**Response:**

```json
{
  "medicalSummary": "Resumen médico...",
  "generalReport": "Informe completo...",
  "processingTime": 3000
}
```

## Modelos de IA Soportados

### Transcripción

- **whisper-fast**: Whisper rápido (OpenAI)
- **whisper-large**: Whisper completo (OpenAI)

### Generación de Informes

- **gemini-pro**: Google Gemini Pro
- **gpt-4**: OpenAI GPT-4

## Templates Médicos

1. **Consulta General** - Consultas médicas generales
2. **Cirugía** - Procedimientos quirúrgicos
3. **Emergencias** - Casos de urgencia médica
4. **Pediatría** - Pacientes pediátricos
5. **Cardiología** - Evaluaciones cardiológicas
6. **Ginecología** - Salud femenina

## Desarrollo

### Estructura del Proyecto

```
src/
├── routes/
│   ├── audio/           # Rutas de procesamiento de audio
│   ├── auth/            # Rutas de autenticación
│   └── health-check/    # Health check
├── server/
│   ├── app.ts          # Configuración de Fastify
│   └── index.ts        # Punto de entrada
└── docs/               # Documentación OpenAPI
```

### Agregar Nuevas Rutas

1. Crear el archivo de ruta en `src/routes/`
2. Exportar la ruta en `src/routes/index.ts`
3. Agregar la documentación OpenAPI en el schema

### Testing

```bash
# Ejecutar tests
pnpm test

# Tests en modo watch
pnpm test:watch
```
