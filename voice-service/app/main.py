from __future__ import annotations
from typing import Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse

from .config import get_settings
from .asr import ASR
from .parser import parse_prescription
from .schemas import (
    TranscribeResponse,
    ParsedPrescription,
    Segment,
    ParsedField,
    Clarification,
    HealthResponse,
    StoreResult,
)
from .security import get_fernet
from .storage import Storage

settings = get_settings()
app = FastAPI(title="VoiceRx Service", default_response_class=ORJSONResponse)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Globals
fernet = get_fernet(settings.phi_enc_key_b64)
asr_engine = ASR(
    model_name=settings.asr_model,
    device=settings.asr_device,
    compute_type=settings.asr_compute_type,
    beam_size=settings.asr_beam_size,
    vad_filter=settings.asr_vad_filter,
)
store = Storage(settings.mongo_url, settings.db_name, fernet=fernet)


LABELS: Dict[str, str] = {
    "patient_name": "Patient Name",
    "patient_age": "Patient Age",
    "patient_gender": "Gender",
    "symptoms": "Symptoms",
    "diagnosis": "Diagnosis",
    "medications": "Medications",
    "instructions": "Instructions",
    "follow_up": "Follow-Up",
    "notes": "Notes",
}


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    device = settings.asr_device
    return HealthResponse(status="ok", model=settings.asr_model, device=device)


@app.post("/transcribe-parse", response_model=TranscribeResponse)
async def transcribe_parse(
    audio: UploadFile = File(..., description="Audio file (e.g., webm/ogg/mp4)"),
    store_result: bool = Form(False),
    patientId: str | None = Form(None),
    doctorId: str | None = Form(None),
) -> TranscribeResponse:
    try:
        raw = await audio.read()
        transcript, segments = asr_engine.transcribe_file(raw)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ASR failed: {e}")

    try:
        fields, sections, overall, field_scores, clarifications_raw = parse_prescription(transcript, segments)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing failed: {e}")

    # Build response schema
    seg_models = [Segment(**s) for s in segments]
    field_models: Dict[str, ParsedField] = {}
    for k, v in fields.items():
        field_models[k] = ParsedField(label=LABELS.get(k, k), value=v, confidence=field_scores.get(k, 0.75))
    clar_models = [Clarification(**c) for c in clarifications_raw]

    result = ParsedPrescription(
        transcript=transcript,
        confidence_overall=overall,
        segments=seg_models,
        fields=field_models,
        sections=sections,
        clarifications=clar_models,
    )

    stored = None
    if store_result:
        try:
            inserted_id = store.store_prescription(
                patient_id=patientId,
                doctor_id=doctorId,
                result=result.model_dump(),
                meta={"engine": "faster-whisper", "model": settings.asr_model},
            )
            if inserted_id:
                stored = StoreResult(ok=True, id=inserted_id)
            else:
                stored = StoreResult(ok=False)
        except Exception:
            stored = StoreResult(ok=False)

    return TranscribeResponse(result=result, stored=stored)


# New: text-only parsing endpoint (no ASR required)
@app.post("/parse-text", response_model=TranscribeResponse)
async def parse_text(
    text: str = Form(..., description="Raw transcript text to parse"),
    store_result: bool = Form(False),
    patientId: str | None = Form(None),
    doctorId: str | None = Form(None),
) -> TranscribeResponse:
    try:
        transcript = text or ""
        segments: list[dict] = []
        fields, sections, overall, field_scores, clarifications_raw = parse_prescription(transcript, segments)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing failed: {e}")

    seg_models = [Segment(**s) for s in segments]
    field_models: Dict[str, ParsedField] = {}
    for k, v in fields.items():
        field_models[k] = ParsedField(label=LABELS.get(k, k), value=v, confidence=field_scores.get(k, 0.75))
    clar_models = [Clarification(**c) for c in clarifications_raw]

    result = ParsedPrescription(
        transcript=transcript,
        confidence_overall=overall,
        segments=seg_models,
        fields=field_models,
        sections=sections,
        clarifications=clar_models,
    )

    stored = None
    if store_result:
        try:
            inserted_id = store.store_prescription(
                patient_id=patientId,
                doctor_id=doctorId,
                result=result.model_dump(),
                meta={"engine": "text-only", "model": settings.asr_model},
            )
            stored = StoreResult(ok=bool(inserted_id), id=inserted_id if inserted_id else None)
        except Exception:
            stored = StoreResult(ok=False)

    return TranscribeResponse(result=result, stored=stored)


# Entry point (optional)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=False)
