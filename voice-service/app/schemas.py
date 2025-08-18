from __future__ import annotations
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class Segment(BaseModel):
    start: float
    end: float
    text: str
    avg_logprob: Optional[float] = None
    no_speech_prob: Optional[float] = None


class Clarification(BaseModel):
    field: str
    reason: str
    suggestion: Optional[str] = None
    confidence: float = Field(ge=0.0, le=1.0)


class ParsedField(BaseModel):
    label: str
    value: Any
    confidence: float = Field(ge=0.0, le=1.0)


class ParsedPrescription(BaseModel):
    transcript: str
    confidence_overall: float = Field(ge=0.0, le=1.0)
    segments: List[Segment]
    fields: Dict[str, ParsedField]
    sections: Dict[str, str]
    clarifications: List[Clarification] = []


class StoreResult(BaseModel):
    ok: bool
    id: Optional[str] = None


class TranscribeResponse(BaseModel):
    result: ParsedPrescription
    stored: Optional[StoreResult] = None


class HealthResponse(BaseModel):
    status: str = "ok"
    model: str
    device: str
    version: str = "1.0.0"
