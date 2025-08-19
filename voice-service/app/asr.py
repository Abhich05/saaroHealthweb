from __future__ import annotations
import tempfile
from typing import List, Tuple
from faster_whisper import WhisperModel


class ASR:
    def __init__(self, model_name: str, device: str = "auto", compute_type: str = "int8", beam_size: int = 5, vad_filter: bool = True):
        self.model_name = model_name
        self.device = device
        self.compute_type = compute_type
        self.beam_size = beam_size
        self.vad_filter = vad_filter
        self.model = WhisperModel(model_name, device=device, compute_type=compute_type)

    def transcribe_file(self, file_bytes: bytes) -> Tuple[str, List[dict]]:
        # Save to temp file and let ffmpeg handle decoding
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=True) as tmp:
            tmp.write(file_bytes)
            tmp.flush()
            segments, info = self.model.transcribe(
                tmp.name,
                beam_size=self.beam_size,
                vad_filter=self.vad_filter,
                language="en",
                without_timestamps=False,
            )
        text = list()
        out_segments: List[dict] = list()
        for seg in segments:
            text.append(seg.text)
            out_segments.append({
                "start": float(seg.start),
                "end": float(seg.end),
                "text": seg.text,
                "avg_logprob": getattr(seg, "avg_logprob", None),
                "no_speech_prob": getattr(seg, "no_speech_prob", None),
            })
        full_text = " ".join(t.strip() for t in text if t and t.strip()).strip()
        return full_text, out_segments
