import React, { useEffect, useMemo, useRef, useState } from "react";
import Modal from "./GenericModal";
import Button from "./Button";
import ModalToast from "./ModalToast";
import { FiMic, FiStopCircle, FiTrash2, FiDownload, FiKey, FiEye, FiEyeOff } from "react-icons/fi";
import voiceService from "../../api/voiceService";

/*
  VoiceRxModal
  - Modern voice transcription & AI parsing modal
  - Uses Web Speech API for live transcript and Python VoiceRx service for processing
  - Intelligent header detection to auto-create sections from spoken text
*/

const sectionOrderDefault = [
  "Patient Information",
  "Symptoms",
  "Diagnosis",
  "Medication",
  "Instructions",
  "Follow-Up",
  "Notes"
];

const headerPatternsDefault = [
  {
    name: "Patient Information",
    regex: /\b(patient name|this is patient|patient details|patient\s+\w+|the patient)\b/i,
  },
  {
    name: "Symptoms",
    regex: /\b(symptom[s]?|complains? of|presenting with|chief complaint|suffers? from|reports?|experiences?)\b/i,
  },
  {
    name: "Diagnosis",
    regex: /\b(diagnosis|impression|assessment|dx|diagnosed with|condition|likely|suspected)\b/i,
  },
  {
    name: "Medication",
    regex: /\b(medication[s]?|prescribe[d]?|drug[s]?|tablets?|capsules?|mg|dosage|give|take|administer)\b/i,
  },
  {
    name: "Instructions",
    regex: /\b(instruction[s]?|advice|counsel|directions|recommend|suggest|should|need to|important)\b/i,
  },
  {
    name: "Follow-Up",
    regex: /\b(follow[- ]?up|review|recheck|return visit|come back|next appointment|see again)\b/i,
  },
];

const VoiceRxModal = ({ isOpen, onClose, doctorId, patientId = null, onApply }) => {
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const startStopBtnRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [sections, setSections] = useState({}); // { header: text }
  const [activeSection, setActiveSection] = useState(null);
  const [toast, setToast] = useState(null);

  // MediaRecorder for server-side ASR
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const chunksRef = useRef([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [svcLoading, setSvcLoading] = useState(false);
  const [svcError, setSvcError] = useState("");
  const [svcResult, setSvcResult] = useState(null);
  const [storeResult, setStoreResult] = useState(false);
  const [serviceHealth, setServiceHealth] = useState(null);

  // Optional API key UI (not required for SpeechRecognition)
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  const sectionOrder = useMemo(() => sectionOrderDefault, []);
  const headerPatterns = useMemo(() => headerPatternsDefault, []);

  const isSpeechSupported = useMemo(
    () => typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition),
    []
  );

  // Highlight keywords inline using <mark> with inline styles (avoids Tailwind purge issues)
  const highlightKeywords = (text) => {
    if (!text || text.trim() === "") return "<div>No text to display</div>";
    let highlighted = text;
    headerPatterns.forEach((p) => {
      highlighted = highlighted.replace(p.regex, (m) =>
        `<mark style="background:#FEF3C7;color:#7C2D12;padding:0 2px;border-radius:3px">${m}</mark>`
      );
    });
    return highlighted;
  };

  // Reset modal internal state when opened/closed
  useEffect(() => {
    if (!isOpen) {
      try {
        if (recognitionRef.current) recognitionRef.current.stop();
      } catch {}
      try {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      } catch {}
      try {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(t => t.stop());
          mediaStreamRef.current = null;
        }
      } catch {}
      setIsRecording(false);
      isRecordingRef.current = false;
      setCurrentTranscript("");
      setFinalTranscript("");
      finalTranscriptRef.current = "";
      setSections({});
      setActiveSection(null);
      setToast(null);
      setAudioBlob(null);
      setSvcLoading(false);
      setSvcError("");
      setSvcResult(null);
      return;
    }

    // Initialize recognition lazily on open
    if (isOpen && isSpeechSupported && !recognitionRef.current) {
      try {
        const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
        const rec = new Rec();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";

        rec.onresult = (event) => {
          let interim = "";
          let finalChunk = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) finalChunk += transcript;
            else interim += transcript;
          }

          if (finalChunk.trim()) {
            finalTranscriptRef.current = (finalTranscriptRef.current + (finalTranscriptRef.current ? " " : "") + finalChunk).trim();
            setFinalTranscript(finalTranscriptRef.current);
            processTranscriptChunk(finalChunk.trim());
          }
          const base = finalTranscriptRef.current;
          setCurrentTranscript(((base ? base + " " : "") + interim).trim());
        };

        rec.onerror = (e) => {
          console.error("Speech recognition error:", e.error);
          setToast({ message: `Speech recognition error: ${e.error}`, type: "error", duration: 4000 });
          setIsRecording(false);
          isRecordingRef.current = false;
        };

        rec.onend = () => {
          // Auto-restart if user is still in recording mode (some browsers end automatically)
          if (isRecordingRef.current) {
            try { rec.start(); } catch {}
          }
        };

        recognitionRef.current = rec;
      } catch (err) {
        console.warn("Failed to init SpeechRecognition", err);
      }
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isSpeechSupported]);

  // Fetch service health on open
  useEffect(() => {
    let mounted = true;
    if (isOpen) {
      voiceService
        .health()
        .then((h) => { if (mounted) setServiceHealth(h); })
        .catch(() => { if (mounted) setServiceHealth(null); });
    }
    return () => { mounted = false; };
  }, [isOpen]);

  const processTranscriptChunk = (text) => {
    const lower = text.toLowerCase();
    let detected = null;
    let matchedPattern = null;

    for (const p of headerPatterns) {
      if (p.regex.test(lower)) {
        detected = p.name;
        matchedPattern = p;
        break;
      }
    }

    // First chunk with no header creates Notes
    if (!detected && Object.keys(sections).length === 0) detected = "Notes";

    // If no header detected but some section exists, append to active or last
    if (!detected && Object.keys(sections).length > 0) {
      const target = activeSection || Object.keys(sections)[Object.keys(sections).length - 1];
      appendToSection(target, text);
      return;
    }

    // Ensure section exists
    if (detected && !sections[detected]) {
      setSections((prev) => ({ ...prev, [detected]: "" }));
      setToast({ message: `Created section: ${detected}` , type: "info", duration: 2000 });
    }

    // Clean text by removing matched keywords
    let clean = text;
    if (matchedPattern) {
      clean = text.replace(matchedPattern.regex, "").replace(/^[,:\-\s]+/, "").replace(/\s+/, " ").trim();
    }

    if (detected && clean) {
      appendToSection(detected, clean);
      setActiveSection(detected);
    }
  };

  const appendToSection = (header, text) => {
    setSections((prev) => {
      const current = (prev[header] || "").trim();
      let next;
      if (current) {
        const sep = /[.!?]$/.test(current) ? " " : ". ";
        next = current + sep + text.trim();
      } else {
        next = text.trim();
      }
      return { ...prev, [header]: next };
    });
  };

  const startRecording = async () => {
    if (!isSpeechSupported) {
      setToast({ message: "Speech recognition not supported in this browser", type: "error", duration: 4000 });
      return;
    }
    try {
      setIsRecording(true);
      isRecordingRef.current = true;
      setCurrentTranscript("");
      setFinalTranscript("");
      finalTranscriptRef.current = "";
      setActiveSection(null);
      // Start SpeechRecognition for live transcript
      recognitionRef.current && recognitionRef.current.start();
      // Start MediaRecorder for audio capture
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      // Prefer opus in webm when available
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      }
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        try {
          const type = mimeType || "audio/webm";
          const blob = new Blob(chunksRef.current, { type });
          setAudioBlob(blob);
        } catch {}
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setToast({ message: "Recording started - Speak naturally!", type: "info", duration: 2000 });
    } catch (err) {
      console.error("Error starting recording", err);
      setToast({ message: `Failed to start recording: ${err.message}`, type: "error", duration: 4000 });
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };

  const stopRecording = () => {
    try {
      setIsRecording(false);
      isRecordingRef.current = false;
      recognitionRef.current && recognitionRef.current.stop();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
      if (!finalTranscript.trim()) {
        setToast({ message: "No speech detected. Try recording again.", type: "warning", duration: 3000 });
      } else {
        setToast({ message: "Recording stopped. Sections auto-generated.", type: "success", duration: 2500 });
      }
    } catch (err) {
      console.warn("Error stopping recording", err);
    }
  };

  const processWithService = async () => {
    if (!audioBlob || svcLoading) return;
    try {
      setSvcLoading(true);
      setSvcError("");
      const resp = await voiceService.transcribeParse(audioBlob, {
        storeResult,
        patientId: patientId || null,
        doctorId: doctorId || null,
      });
      const res = resp?.result;
      if (res) {
        setSvcResult(res);
        // Adopt parsed sections and transcript
        if (res.sections) setSections(res.sections);
        if (res.transcript) {
          setFinalTranscript(res.transcript);
          finalTranscriptRef.current = res.transcript;
          setCurrentTranscript(res.transcript);
        }
        setToast({ message: "Processed by VoiceRx service", type: "success", duration: 2500 });
      } else {
        throw new Error("No result returned");
      }
    } catch (e) {
      console.error(e);
      const msg = e?.message || "Service error";
      setSvcError(msg);
      setToast({ message: `Service error: ${msg}`, type: "error", duration: 3500 });
    } finally {
      setSvcLoading(false);
    }
  };

  const clearAll = () => {
    setSections({});
    setCurrentTranscript("");
    setFinalTranscript("");
    setActiveSection(null);
    setToast({ message: "Cleared. Start recording to see transcript...", type: "info", duration: 2500 });
    setAudioBlob(null);
    setSvcResult(null);
    setSvcError("");
  };

  const handleApply = () => {
    try {
      if (typeof onApply === 'function') {
        onApply({
          transcript: finalTranscript || "",
          sections: { ...sections },
          svcResult: svcResult || null,
        });
      }
      onClose?.();
    } catch (e) {
      console.error('Apply error', e);
      setToast({ message: `Failed to apply: ${e.message || e}`, type: 'error', duration: 3000 });
    }
  };

  const exportJSON = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      sessionId: Date.now(),
      transcript: finalTranscript || "",
      sections: { ...sections },
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
    a.href = url;
    a.download = `voice-rx-prescription-${timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ message: "Prescription exported as JSON!", type: "success", duration: 2500 });
  };

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Set initial focus to the primary control when modal opens
  useEffect(() => {
    if (isOpen && startStopBtnRef.current) {
      startStopBtnRef.current.focus();
    }
  }, [isOpen]);

  // Sorted headers according to priority, then any unknowns
  const sortedHeaders = useMemo(() => {
    const keys = Object.keys(sections);
    const known = keys.filter((k) => sectionOrder.includes(k)).sort((a, b) => sectionOrder.indexOf(a) - sectionOrder.indexOf(b));
    const unknown = keys.filter((k) => !sectionOrder.includes(k)).sort();
    return [...known, ...unknown];
  }, [sections, sectionOrder]);

  return (
    <Modal isOpen={isOpen} onClose={() => { if (isRecording) stopRecording(); onClose?.(); }} title="Voice Rx" size="xl" className="mx-4">
      {/* Toast */}
      {toast && (
        <ModalToast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => setToast(null)}
        />
      )}

      <div className="space-y-4">
        {/* Service health */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div>
            Service: <span className={serviceHealth ? "text-green-700" : "text-red-600"}>{serviceHealth ? `OK (${serviceHealth.model} on ${serviceHealth.device})` : "Unavailable"}</span>
          </div>
          <div className="truncate">Endpoint: {voiceService.VOICE_BASE_URL}</div>
        </div>
        {/* API Key (optional) */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="flex items-center gap-2">
              <FiKey className="text-gray-500" />
              <input
                type={showApiKey ? "text" : "password"}
                placeholder="API Key (optional)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                aria-label="API Key"
              />
              <button
                type="button"
                aria-label={showApiKey ? "Hide API key" : "Show API key"}
                onClick={() => setShowApiKey((s) => !s)}
                className="px-2 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                {showApiKey ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-3">
          <div className="flex items-center gap-3">
            {!isRecording ? (
              <Button ref={startStopBtnRef} onClick={startRecording} className="flex items-center gap-2">
                <FiMic /> Start Recording
              </Button>
            ) : (
              <Button ref={startStopBtnRef} onClick={stopRecording} variant="danger" className="flex items-center gap-2">
                <FiStopCircle /> Stop
              </Button>
            )}
            <Button variant="secondary" onClick={clearAll} className="flex items-center gap-2">
              <FiTrash2 /> Clear
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${isRecording ? "text-red-600" : "text-gray-600"}`}>
              {isRecording ? "Recording..." : (audioBlob ? "Recorded" : "Idle")}
            </span>
            <Button variant="outline" onClick={exportJSON} className="flex items-center gap-2">
              <FiDownload /> Export JSON
            </Button>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={storeResult} onChange={(e) => setStoreResult(e.target.checked)} />
                Store to DB
              </label>
              <Button onClick={processWithService} disabled={!audioBlob || svcLoading} className="flex items-center gap-2">
                {svcLoading ? "Processing..." : "Process with AI"}
              </Button>
              <Button onClick={handleApply} variant="success" className="flex items-center gap-2">
                Apply to Form
              </Button>
            </div>
          </div>
        </div>

        {/* Two panel layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Transcript */}
          <div className="border rounded-xl p-3 h-80 overflow-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">Real-time Transcript</h3>
              {isRecording && (
                <span className="inline-flex items-center text-xs text-red-600">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" /> Listening
                </span>
              )}
            </div>
            <div
              aria-live="polite"
              className="prose max-w-none text-sm leading-6 text-gray-800"
              dangerouslySetInnerHTML={{ __html: highlightKeywords(currentTranscript || (isRecording ? "Listening... Start speaking to see transcript" : (finalTranscript || ""))) }}
            />
          </div>

          {/* Sections */}
          <div className="border rounded-xl p-3 h-80 overflow-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">Generated Sections</h3>
              <span className="text-sm text-gray-500">{Object.keys(sections).length} section{Object.keys(sections).length !== 1 ? "s" : ""}</span>
            </div>

            {sortedHeaders.length === 0 ? (
              <div className="text-sm text-gray-500">
                Start speaking to automatically generate sections...
                <ul className="list-disc ml-5 mt-2">
                  <li>Patient information</li>
                  <li>Symptoms and complaints</li>
                  <li>Diagnosis and assessment</li>
                  <li>Medications and prescriptions</li>
                  <li>Instructions and advice</li>
                  <li>Follow-up requirements</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedHeaders.map((header) => (
                  <div key={header} className="border rounded-lg p-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-800">{header}</h4>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Auto</span>
                      </div>
                    </div>
                    <textarea
                      value={sections[header] || ""}
                      onChange={(e) => setSections((prev) => ({ ...prev, [header]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-md p-2 text-sm min-h-24"
                      rows={3}
                      aria-label={`${header} content`}
                    />
                  </div>
                ))}
                {/* Clarifications from service */}
                {svcResult?.clarifications?.length > 0 && (
                  <div className="border rounded-lg p-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">Clarifications</h4>
                      <span className="text-xs text-gray-600">Overall confidence: {svcResult.confidence_overall?.toFixed?.(2)}</span>
                    </div>
                    <ul className="list-disc ml-5 space-y-1 text-sm">
                      {svcResult.clarifications.map((c, idx) => (
                        <li key={idx}>
                          <span className="font-medium">{c.field}</span>: {c.reason}
                          {c.suggestion ? <span className="text-gray-600"> — {c.suggestion}</span> : null}
                          {typeof c.confidence === 'number' ? <span className="ml-2 text-xs text-gray-500">({c.confidence.toFixed(2)})</span> : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default VoiceRxModal;
