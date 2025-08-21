import os
import base64
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class Settings:
    # ASR
    asr_model: str = os.getenv("ASR_MODEL", "large-v2")
    asr_device: str = os.getenv("ASR_DEVICE", "auto")  # auto|cpu|cuda
    asr_compute_type: str = os.getenv("ASR_COMPUTE_TYPE", "int8")  # int8|int8_float16|float16|float32
    asr_beam_size: int = int(os.getenv("ASR_BEAM_SIZE", "5"))
    asr_vad_filter: bool = os.getenv("ASR_VAD_FILTER", "1") == "1"

    # Server
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8090"))
    cors_origins: List[str] = field(
        default_factory=lambda: os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
    )

    # Storage
    mongo_url: Optional[str] = os.getenv("MONGO_URL")
    db_name: str = os.getenv("DB_NAME", "saarohealth")

    # Application-level encryption key for PHI (base64-encoded 32 bytes)
    phi_enc_key_b64: Optional[str] = os.getenv("PHI_ENC_KEY")

    # Forwarding to Node backend (optional)
    forward_node_url: Optional[str] = os.getenv("FORWARD_NODE_URL")
    node_token: Optional[str] = os.getenv("NODE_TOKEN")

    # Misc
    log_level: str = os.getenv("LOG_LEVEL", "INFO")


MEDICAL_PRIMER = (
    "You are transcribing medical dictation for prescriptions. Use US medical spelling."
    " Include structured cues like Patient, Symptoms, Diagnosis, Medication (name, dose, route, frequency, duration),"
    " Instructions, Follow-up, and Notes."
)


def get_settings() -> Settings:
    return Settings()


def get_phi_key_bytes(settings: Settings) -> Optional[bytes]:
    if not settings.phi_enc_key_b64:
        return None
    try:
        return base64.urlsafe_b64decode(settings.phi_enc_key_b64)
    except Exception:
        return None
