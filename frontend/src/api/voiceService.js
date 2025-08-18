// A lightweight client for the Python VoiceRx service
// Configure base URL via VITE_VOICE_SERVICE_URL, defaults to localhost
const VOICE_BASE_URL = import.meta.env.VITE_VOICE_SERVICE_URL || 'http://localhost:8090';

async function health() {
  const res = await fetch(`${VOICE_BASE_URL}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

/**
 * Upload audio and get parsed prescription
 * @param {Blob} audioBlob - recorded audio (webm/ogg/mp4)
 * @param {{ storeResult?: boolean, patientId?: string|null, doctorId?: string|null }} options
 */
async function transcribeParse(audioBlob, options = {}) {
  const { storeResult = false, patientId = null, doctorId = null } = options;
  const fd = new FormData();
  const ext = audioBlob.type?.includes('webm') ? 'webm' : (audioBlob.type?.includes('ogg') ? 'ogg' : 'mp4');
  fd.append('audio', audioBlob, `recording.${ext}`);
  fd.append('store_result', String(storeResult));
  if (patientId) fd.append('patientId', patientId);
  if (doctorId) fd.append('doctorId', doctorId);

  const res = await fetch(`${VOICE_BASE_URL}/transcribe-parse`, {
    method: 'POST',
    body: fd,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Transcribe failed: ${res.status} ${text}`);
  }
  return res.json();
}

export default { VOICE_BASE_URL, health, transcribeParse };
