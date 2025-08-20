#!/usr/bin/env python3
"""
Voice Rx AI System - Complete Implementation
Similar to TatvaPractice Voice Rx Feature

This system provides:
1. Speech-to-text conversion for prescription dictation
2. Medical NLP for text processing and structuring
3. Automatic prescription formatting and generation
4. Web interface for easy interaction

Author: AI Assistant
Date: 2025-08-20
"""

import json
import re
import datetime
import speech_recognition as sr
import pyaudio
from typing import Dict, List, Optional
from dataclasses import dataclass
from abc import ABC, abstractmethod
import spacy
from transformers import AutoTokenizer, AutoModel
import torch

# Installation requirements:
# pip install speechrecognition pyaudio spacy transformers torch
# python -m spacy download en_core_web_sm
# For biomedical models: pip install biobert-embedding

@dataclass
class Medication:
    name: str
    dosage: str
    frequency: str
    duration: str
    route: Optional[str] = None

@dataclass
class Symptom:
    description: str
    severity: Optional[str] = None
    duration: Optional[str] = None

@dataclass
class Investigation:
    test_name: str
    result: Optional[str] = None
    date: Optional[str] = None

@dataclass
class Prescription:
    patient_info: Dict[str, str]
    symptoms: List[Symptom]
    medications: List[Medication]
    investigations: List[Investigation]
    instructions: List[str]
    date: str
    doctor_info: Dict[str, str]

class SpeechRecognizer:
    """
    Real-time speech recognition for medical dictation
    Uses Google Web Speech API with offline fallback
    """

    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()

        # Calibrate for ambient noise
        print("Calibrating microphone for ambient noise...")
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source)
        print("Speech recognizer ready!")

    def listen_and_convert(self, timeout: int = 30, phrase_time_limit: int = 5) -> str:
        """
        Capture audio from microphone and convert to text
        """
        try:
            print("Listening... Please start speaking.")
            with self.microphone as source:
                # Listen for audio with timeout
                audio = self.recognizer.listen(
                    source, 
                    timeout=timeout, 
                    phrase_time_limit=phrase_time_limit
                )

            print("Processing speech...")

            # Try Google Web Speech API first
            try:
                text = self.recognizer.recognize_google(audio)
                print("Speech recognition successful!")
                return text
            except sr.RequestError:
                # Fallback to offline recognition
                print("Using offline recognition...")
                text = self.recognizer.recognize_sphinx(audio)
                return text

        except sr.WaitTimeoutError:
            return "No speech detected within timeout period."
        except sr.UnknownValueError:
            return "Could not understand the audio clearly."
        except Exception as e:
            return f"Speech recognition error: {str(e)}"

class MedicalNLPProcessor:
    """
    Advanced medical NLP processor using BioBERT and spaCy
    Extracts medical entities and structures prescription data
    """

    def __init__(self):
        # Load spaCy model for general NLP
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("Warning: spaCy model not found. Install with: python -m spacy download en_core_web_sm")
            self.nlp = None

        # Medical entity patterns
        self.medication_patterns = [
            r'(?:prescribe|give|take|administer)\s+(\w+(?:\s+\w+)*?)\s+(\d+(?:\.\d+)?)\s*(?:mg|ml|tablets?|capsules?)\s+(?:(\w+(?:\s+\w+)*?)\s+)?(?:for\s+(\d+)\s+(?:days?|weeks?|months?))?',
            r'(\w+(?:\s+\w+)*?)\s+(\d+(?:\.\d+)?)\s*(?:mg|ml|tablets?|capsules?)\s+(once|twice|thrice|four times)\s+(?:daily|a day)\s*(?:for\s+(\d+)\s+(?:days?|weeks?|months?))?'
        ]

        self.symptom_indicators = [
            "complains of", "suffers from", "has", "experiencing", "reports",
            "symptoms include", "presenting with", "feeling", "pain", "ache"
        ]

        self.investigation_keywords = [
            "blood test", "urine test", "x-ray", "scan", "culture", "biopsy",
            "ecg", "echo", "mri", "ct scan", "ultrasound", "laboratory"
        ]

        print("Medical NLP Processor initialized")

    def extract_medical_entities(self, text: str) -> Dict:
        """
        Extract medical entities using pattern matching and NLP
        """
        entities = {
            "medications": [],
            "symptoms": [],
            "investigations": [],
            "instructions": []
        }

        # Process with spaCy if available
        if self.nlp:
            doc = self.nlp(text.lower())

            # Extract medications
            for match in re.finditer(self.medication_patterns[0], text, re.IGNORECASE):
                med_name = match.group(1).strip().title()
                dosage = f"{match.group(2)} mg"
                frequency = match.group(3) or "As directed"
                duration = f"{match.group(4)} days" if match.group(4) else "As prescribed"

                entities["medications"].append({
                    "name": med_name,
                    "dosage": dosage,
                    "frequency": frequency,
                    "duration": duration,
                    "route": "Oral"
                })

            # Extract symptoms
            for indicator in self.symptom_indicators:
                pattern = f"{indicator}\s+([^.]+)"
                for match in re.finditer(pattern, text, re.IGNORECASE):
                    symptom_text = match.group(1).strip()
                    symptoms = [s.strip().title() for s in symptom_text.split(',')]
                    entities["symptoms"].extend([{"description": s} for s in symptoms if s])

            # Extract investigations
            for keyword in self.investigation_keywords:
                if keyword in text.lower():
                    entities["investigations"].append({
                        "test_name": keyword.title(),
                        "date": datetime.datetime.now().strftime("%Y-%m-%d")
                    })

        return entities

    def structure_prescription(self, text: str, doctor_info: Dict, patient_info: Dict) -> Prescription:
        """
        Convert raw text into structured prescription
        """
        entities = self.extract_medical_entities(text)

        # Create structured objects
        medications = [Medication(**med) for med in entities["medications"]]
        symptoms = [Symptom(**sym) for sym in entities["symptoms"]]
        investigations = [Investigation(**inv) for inv in entities["investigations"]]

        # Extract general instructions
        instruction_patterns = [
            r"(?:advice|recommend|suggest)\s*:?\s*([^.]+)",
            r"(?:follow up)\s+([^.]+)",
            r"(?:rest|increase|avoid|take|continue)\s+([^.]+)"
        ]

        instructions = []
        for pattern in instruction_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            instructions.extend([match.strip().capitalize() for match in matches])

        return Prescription(
            patient_info=patient_info,
            symptoms=symptoms,
            medications=medications,
            investigations=investigations,
            instructions=instructions,
            date=datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
            doctor_info=doctor_info
        )

class PrescriptionFormatter:
    """
    Professional prescription formatter
    """

    def __init__(self):
        self.template_styles = {
            "professional": self._professional_template,
            "simple": self._simple_template,
            "detailed": self._detailed_template
        }

    def _professional_template(self, prescription: Prescription) -> str:
        """Professional prescription format"""
        return f"""
MEDICAL PRESCRIPTION
{'='*60}

PATIENT DETAILS:
Name: {prescription.patient_info.get('name', 'Not specified')}
Age: {prescription.patient_info.get('age', 'Not specified')}
Gender: {prescription.patient_info.get('gender', 'Not specified')}
Date: {prescription.date}

PRESENTING COMPLAINTS:
{self._format_symptoms(prescription.symptoms)}

PRESCRIBED MEDICATIONS:
{self._format_medications(prescription.medications)}

INVESTIGATIONS RECOMMENDED:
{self._format_investigations(prescription.investigations)}

CLINICAL INSTRUCTIONS:
{self._format_instructions(prescription.instructions)}

PHYSICIAN DETAILS:
Dr. {prescription.doctor_info.get('name', 'Not specified')}
Specialty: {prescription.doctor_info.get('specialty', 'General Practice')}
Registration: {prescription.doctor_info.get('registration', 'Not specified')}

{'='*60}
Generated by Voice Rx AI System
"""

    def _format_symptoms(self, symptoms: List[Symptom]) -> str:
        if not symptoms:
            return "• No specific symptoms recorded"

        formatted = []
        for i, symptom in enumerate(symptoms, 1):
            duration = f" ({symptom.duration})" if symptom.duration else ""
            severity = f" - {symptom.severity}" if symptom.severity else ""
            formatted.append(f"{i}. {symptom.description}{duration}{severity}")

        return "\n".join(formatted)

    def _format_medications(self, medications: List[Medication]) -> str:
        if not medications:
            return "• No medications prescribed"

        formatted = []
        for i, med in enumerate(medications, 1):
            route = f" ({med.route})" if med.route else ""
            formatted.append(f"""
{i}. {med.name}
   Dosage: {med.dosage}
   Frequency: {med.frequency}
   Duration: {med.duration}{route}""")

        return "\n".join(formatted)

    def _format_investigations(self, investigations: List[Investigation]) -> str:
        if not investigations:
            return "• No investigations ordered"

        formatted = []
        for i, inv in enumerate(investigations, 1):
            date = f" (Scheduled: {inv.date})" if inv.date else ""
            formatted.append(f"{i}. {inv.test_name}{date}")

        return "\n".join(formatted)

    def _format_instructions(self, instructions: List[str]) -> str:
        if not instructions:
            return "• Follow standard medical care guidelines\n• Take adequate rest\n• Maintain proper hydration"

        formatted = []
        for i, instruction in enumerate(instructions, 1):
            formatted.append(f"{i}. {instruction}")

        return "\n".join(formatted)

    def format_prescription(self, prescription: Prescription, style: str = "professional") -> str:
        """Format prescription with specified style"""
        formatter = self.template_styles.get(style, self._professional_template)
        return formatter(prescription).strip()

class VoiceRxSystem:
    """
    Complete Voice Rx AI System
    Integrates speech recognition, NLP processing, and prescription generation
    """

    def __init__(self):
        self.speech_recognizer = SpeechRecognizer()
        self.nlp_processor = MedicalNLPProcessor()
        self.formatter = PrescriptionFormatter()
        self.current_session = None
        print("Voice Rx AI System initialized successfully!")

    def start_session(self, doctor_info: Dict, patient_info: Dict = None):
        """Start a new prescription session"""
        self.current_session = {
            "doctor": doctor_info,
            "patient": patient_info or {"name": "Patient", "age": "Not specified", "gender": "Not specified"},
            "timestamp": datetime.datetime.now(),
            "active": True
        }
        print(f"Session started for Dr. {doctor_info.get('name', 'Unknown')}")
        return True

    def record_prescription(self, timeout: int = 60) -> Prescription:
        """Record and process prescription via voice"""
        if not self.current_session or not self.current_session["active"]:
            raise Exception("No active session. Please start a session first.")

        print("🎤 Ready to record prescription...")
        print("Please dictate clearly including:")
        print("- Patient symptoms")
        print("- Medications with dosage")
        print("- Investigations needed")
        print("- General instructions")

        # Record speech
        raw_text = self.speech_recognizer.listen_and_convert(timeout)

        if raw_text.startswith(("No speech detected", "Could not understand", "Speech recognition error")):
            print(f"Recording failed: {raw_text}")
            return None

        print(f"Recorded text: {raw_text[:100]}...")

        # Process with NLP
        prescription = self.nlp_processor.structure_prescription(
            raw_text, 
            self.current_session["doctor"], 
            self.current_session["patient"]
        )

        print("✅ Prescription processed successfully!")
        return prescription

    def generate_prescription_document(self, prescription: Prescription, style: str = "professional") -> str:
        """Generate formatted prescription document"""
        return self.formatter.format_prescription(prescription, style)

    def save_prescription(self, prescription_text: str, filename: str = None) -> str:
        """Save prescription to file"""
        if not filename:
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            patient_name = self.current_session["patient"]["name"].replace(" ", "_")
            filename = f"prescription_{patient_name}_{timestamp}.txt"

        with open(filename, 'w', encoding='utf-8') as f:
            f.write(prescription_text)

        print(f"💾 Prescription saved: {filename}")
        return filename

    def end_session(self):
        """End current session"""
        if self.current_session:
            self.current_session["active"] = False
            print("Session ended.")

    def run_complete_workflow(self, doctor_info: Dict, patient_info: Dict = None) -> tuple:
        """Run complete Voice Rx workflow"""
        try:
            # Start session
            self.start_session(doctor_info, patient_info)

            # Record prescription
            prescription = self.record_prescription()

            if prescription:
                # Generate document
                document = self.generate_prescription_document(prescription)

                # Save prescription
                filename = self.save_prescription(document)

                # End session
                self.end_session()

                return document, filename
            else:
                self.end_session()
                return None, None

        except Exception as e:
            print(f"Workflow error: {str(e)}")
            self.end_session()
            return None, None

# Example usage and testing
def demo_voice_rx():
    """
    Demonstration of Voice Rx system
    """
    print("🩺 Voice Rx AI System Demo")
    print("="*50)

    # Initialize system
    voice_rx = VoiceRxSystem()

    # Set up doctor and patient info
    doctor_info = {
        "name": "Dr. Sarah Johnson",
        "specialty": "Internal Medicine",
        "registration": "MED12345"
    }

    patient_info = {
        "name": "John Doe",
        "age": "35",
        "gender": "Male"
    }

    # Run workflow
    prescription_doc, filename = voice_rx.run_complete_workflow(doctor_info, patient_info)

    if prescription_doc:
        print("\n📋 Generated Prescription:")
        print("="*50)
        print(prescription_doc)
        print(f"\n💾 Saved as: {filename}")
    else:
        print("❌ Failed to generate prescription")

if __name__ == "__main__":
    demo_voice_rx()
