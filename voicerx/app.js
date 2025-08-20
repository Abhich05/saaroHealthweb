// Voice Rx AI System JavaScript

class VoiceRxSystem {
    constructor() {
        this.currentStep = 'dashboard';
        this.isRecording = false;
        this.editMode = false;
        this.sessionData = {
            doctor: { name: '', specialty: '' },
            patient: { name: '', age: '', gender: '' }
        };
        
        // Sample data from the provided JSON
        this.sampleData = {
            samplePrescription: {
                patient: {
                    name: "John Doe",
                    age: "35",
                    gender: "Male"
                },
                doctor: {
                    name: "Dr. Sarah Johnson", 
                    specialty: "Internal Medicine"
                },
                symptoms: [
                    "Headache and fever for 3 days",
                    "Temperature 102°F",
                    "Nausea and body ache"
                ],
                medications: [
                    {
                        name: "Paracetamol",
                        dosage: "500mg",
                        frequency: "Twice daily",
                        duration: "5 days",
                        route: "Oral"
                    }
                ],
                investigations: [
                    "Complete blood count",
                    "Throat swab culture"
                ],
                instructions: [
                    "Take adequate rest",
                    "Increase fluid intake", 
                    "Follow up after 3 days if symptoms persist"
                ]
            },
            recordingTips: [
                "Speak clearly and at moderate pace",
                "Use headings like 'Symptoms', 'Medications', 'Investigations'",
                "Include dosage, frequency, and duration for medications",
                "Mention follow-up instructions clearly",
                "Avoid irrelevant information for precise dictation"
            ],
            processingSteps: [
                "Capturing speech input...",
                "Converting speech to text...", 
                "Analyzing medical content...",
                "Extracting symptoms and complaints...",
                "Processing medication information...",
                "Identifying investigations...",
                "Structuring prescription format...",
                "Prescription generated successfully!"
            ]
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.renderTips();
        this.startWaveformAnimation();
    }

    bindEvents() {
        // Session controls
        const startSessionBtn = document.getElementById('startSessionBtn');
        const endSessionBtn = document.getElementById('endSessionBtn');
        const newSessionBtn = document.getElementById('newSessionBtn');
        
        if (startSessionBtn) {
            startSessionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.startSession();
            });
        }
        
        if (endSessionBtn) {
            endSessionBtn.addEventListener('click', () => this.endSession());
        }
        
        if (newSessionBtn) {
            newSessionBtn.addEventListener('click', () => this.startNewSession());
        }

        // Recording controls
        const recordingBtn = document.getElementById('recordingBtn');
        const stopBtn = document.getElementById('stopBtn');
        
        if (recordingBtn) {
            recordingBtn.addEventListener('click', () => this.toggleRecording());
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopRecording());
        }

        // Prescription actions
        const editModeBtn = document.getElementById('editModeBtn');
        const printBtn = document.getElementById('printBtn');
        const saveBtn = document.getElementById('saveBtn');
        
        if (editModeBtn) {
            editModeBtn.addEventListener('click', () => this.toggleEditMode());
        }
        
        if (printBtn) {
            printBtn.addEventListener('click', () => this.printPrescription());
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.savePrescription());
        }

        // Form inputs - ensure all inputs work properly
        const formFields = ['doctorName', 'doctorSpecialty', 'patientName', 'patientAge', 'patientGender'];
        formFields.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.updateSessionData());
                element.addEventListener('change', () => this.updateSessionData());
                
                // Remove any disabled attributes
                element.removeAttribute('disabled');
                element.removeAttribute('readonly');
            }
        });
    }

    validateForm() {
        const doctorName = document.getElementById('doctorName');
        const doctorSpecialty = document.getElementById('doctorSpecialty');
        const patientName = document.getElementById('patientName');
        const patientAge = document.getElementById('patientAge');
        const patientGender = document.getElementById('patientGender');

        // Check if elements exist and have values
        const doctorNameValue = doctorName ? doctorName.value.trim() : '';
        const doctorSpecialtyValue = doctorSpecialty ? doctorSpecialty.value.trim() : '';
        const patientNameValue = patientName ? patientName.value.trim() : '';
        const patientAgeValue = patientAge ? patientAge.value.trim() : '';
        const patientGenderValue = patientGender ? patientGender.value : '';

        console.log('Form validation:', {
            doctorName: doctorNameValue,
            doctorSpecialty: doctorSpecialtyValue,
            patientName: patientNameValue,
            patientAge: patientAgeValue,
            patientGender: patientGenderValue
        });

        if (!doctorNameValue) {
            this.showValidationError('Please enter doctor name');
            return false;
        }
        if (!doctorSpecialtyValue) {
            this.showValidationError('Please enter doctor specialty');
            return false;
        }
        if (!patientNameValue) {
            this.showValidationError('Please enter patient name');
            return false;
        }
        if (!patientAgeValue) {
            this.showValidationError('Please enter patient age');
            return false;
        }
        if (!patientGenderValue) {
            this.showValidationError('Please select patient gender');
            return false;
        }

        return true;
    }

    showValidationError(message) {
        // Remove existing error messages
        const existingError = document.querySelector('.validation-error');
        if (existingError) {
            existingError.remove();
        }

        // Create and show new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'validation-error';
        errorDiv.style.cssText = `
            background: var(--color-error);
            color: white;
            padding: var(--space-12);
            border-radius: var(--radius-base);
            margin-bottom: var(--space-16);
            text-align: center;
            font-weight: var(--font-weight-medium);
        `;
        errorDiv.textContent = message;

        const startSessionBtn = document.getElementById('startSessionBtn');
        startSessionBtn.parentNode.insertBefore(errorDiv, startSessionBtn);

        // Remove error after 3 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }

    updateSessionData() {
        const doctorName = document.getElementById('doctorName');
        const doctorSpecialty = document.getElementById('doctorSpecialty');
        const patientName = document.getElementById('patientName');
        const patientAge = document.getElementById('patientAge');
        const patientGender = document.getElementById('patientGender');

        this.sessionData = {
            doctor: {
                name: doctorName ? doctorName.value.trim() : '',
                specialty: doctorSpecialty ? doctorSpecialty.value.trim() : ''
            },
            patient: {
                name: patientName ? patientName.value.trim() : '',
                age: patientAge ? patientAge.value.trim() : '',
                gender: patientGender ? patientGender.value : ''
            }
        };

        console.log('Session data updated:', this.sessionData);
    }

    startSession() {
        console.log('Starting session...');
        
        if (!this.validateForm()) {
            return;
        }

        this.updateSessionData();
        this.showSection('recording');
        this.currentStep = 'recording';
        
        const endSessionBtn = document.getElementById('endSessionBtn');
        if (endSessionBtn) {
            endSessionBtn.style.display = 'block';
        }

        console.log('Session started successfully');
    }

    endSession() {
        this.showSection('dashboard');
        this.currentStep = 'dashboard';
        this.resetForm();
        
        const endSessionBtn = document.getElementById('endSessionBtn');
        if (endSessionBtn) {
            endSessionBtn.style.display = 'none';
        }
    }

    startNewSession() {
        this.endSession();
    }

    resetForm() {
        const formFields = ['doctorName', 'doctorSpecialty', 'patientName', 'patientAge', 'patientGender'];
        formFields.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = '';
            }
        });
        
        this.sessionData = {
            doctor: { name: '', specialty: '' },
            patient: { name: '', age: '', gender: '' }
        };
    }

    showSection(sectionName) {
        // Hide all sections
        ['dashboard', 'recording', 'results'].forEach(section => {
            const sectionElement = document.getElementById(`${section}Section`);
            if (sectionElement) {
                sectionElement.classList.add('hidden');
            }
        });

        // Hide processing section if it exists
        const processingSection = document.getElementById('processingSection');
        if (processingSection) {
            processingSection.classList.add('hidden');
        }

        // Show target section
        const targetSection = document.getElementById(`${sectionName}Section`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            targetSection.classList.add('fade-in');
        }
    }

    toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    startRecording() {
        this.isRecording = true;
        
        // Update UI
        const recordingBtn = document.getElementById('recordingBtn');
        const stopBtn = document.getElementById('stopBtn');
        const recordingStatus = document.getElementById('recordingStatus');

        if (recordingBtn) {
            recordingBtn.classList.add('recording');
            recordingBtn.innerHTML = '<i class="fas fa-microphone"></i> <span>Recording...</span>';
        }
        
        if (stopBtn) {
            stopBtn.classList.remove('hidden');
        }
        
        if (recordingStatus) {
            recordingStatus.innerHTML = '<span class="status status--error">Recording</span>';
        }

        // Activate waveform
        this.activateWaveform();
    }

    stopRecording() {
        this.isRecording = false;
        
        // Update UI
        const recordingBtn = document.getElementById('recordingBtn');
        const stopBtn = document.getElementById('stopBtn');
        const recordingStatus = document.getElementById('recordingStatus');

        if (recordingBtn) {
            recordingBtn.classList.remove('recording');
            recordingBtn.innerHTML = '<i class="fas fa-microphone"></i> <span>Tap to Speak</span>';
        }
        
        if (stopBtn) {
            stopBtn.classList.add('hidden');
        }
        
        if (recordingStatus) {
            recordingStatus.innerHTML = '<span class="status status--success">Complete</span>';
        }

        // Deactivate waveform
        this.deactivateWaveform();

        // Start processing
        this.startProcessing();
    }

    activateWaveform() {
        const waveBars = document.querySelectorAll('.wave-bar');
        waveBars.forEach((bar, index) => {
            setTimeout(() => {
                bar.classList.add('active');
            }, index * 100);
        });
    }

    deactivateWaveform() {
        const waveBars = document.querySelectorAll('.wave-bar');
        waveBars.forEach(bar => {
            bar.classList.remove('active');
        });
    }

    startWaveformAnimation() {
        const waveBars = document.querySelectorAll('.wave-bar');
        waveBars.forEach((bar, index) => {
            setInterval(() => {
                if (this.isRecording) {
                    const height = Math.random() * 40 + 20;
                    bar.style.height = height + 'px';
                }
            }, 200 + index * 50);
        });
    }

    startProcessing() {
        // Show processing section
        const processingSection = document.getElementById('processingSection');
        if (processingSection) {
            processingSection.classList.remove('hidden');
            processingSection.classList.add('slide-up');
        }

        const progressFill = document.getElementById('progressFill');
        const processingStep = document.getElementById('processingStep');
        
        let currentStep = 0;
        const totalSteps = this.sampleData.processingSteps.length;

        const processStep = () => {
            if (currentStep < totalSteps) {
                if (processingStep) {
                    processingStep.textContent = this.sampleData.processingSteps[currentStep];
                }
                if (progressFill) {
                    progressFill.style.width = ((currentStep + 1) / totalSteps * 100) + '%';
                }
                currentStep++;
                setTimeout(processStep, 800);
            } else {
                setTimeout(() => {
                    this.showResults();
                }, 1000);
            }
        };

        processStep();
    }

    showResults() {
        // Hide processing section
        const processingSection = document.getElementById('processingSection');
        if (processingSection) {
            processingSection.classList.add('hidden');
        }
        
        // Show results section
        this.showSection('results');
        this.generatePrescription();
    }

    generatePrescription() {
        const prescriptionContent = document.getElementById('prescriptionContent');
        if (!prescriptionContent) return;
        
        // Use session data if available, otherwise use sample data
        const doctorData = this.sessionData.doctor.name ? this.sessionData.doctor : this.sampleData.samplePrescription.doctor;
        const patientData = this.sessionData.patient.name ? this.sessionData.patient : this.sampleData.samplePrescription.patient;
        
        const prescriptionHTML = `
            <div class="prescription-info">
                <div class="prescription-section">
                    <h4><i class="fas fa-user-md"></i> Doctor Information</h4>
                    <div class="info-item">
                        <span class="info-label">Name</span>
                        <span class="info-value">${doctorData.name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Specialty</span>
                        <span class="info-value">${doctorData.specialty}</span>
                    </div>
                </div>
                
                <div class="prescription-section">
                    <h4><i class="fas fa-user"></i> Patient Information</h4>
                    <div class="info-item">
                        <span class="info-label">Name</span>
                        <span class="info-value">${patientData.name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Age</span>
                        <span class="info-value">${patientData.age} years</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Gender</span>
                        <span class="info-value">${patientData.gender}</span>
                    </div>
                </div>
            </div>

            <div class="prescription-section editable" data-section="symptoms">
                <h4><i class="fas fa-stethoscope"></i> Symptoms & Complaints</h4>
                <ul class="prescription-list">
                    ${this.sampleData.samplePrescription.symptoms.map(symptom => `<li>${symptom}</li>`).join('')}
                </ul>
            </div>

            <div class="prescription-section editable" data-section="medications">
                <h4><i class="fas fa-pills"></i> Medications Prescribed</h4>
                <ul class="prescription-list">
                    ${this.sampleData.samplePrescription.medications.map(med => `
                        <li>
                            <div class="medication-item">
                                <div class="medication-details">
                                    <div class="medication-name">${med.name}</div>
                                    <div class="medication-dosage">${med.dosage} - ${med.frequency} for ${med.duration}</div>
                                </div>
                                <span class="medication-route">${med.route}</span>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            </div>

            <div class="prescription-section editable" data-section="investigations">
                <h4><i class="fas fa-vials"></i> Investigations Ordered</h4>
                <ul class="prescription-list">
                    ${this.sampleData.samplePrescription.investigations.map(investigation => `<li>${investigation}</li>`).join('')}
                </ul>
            </div>

            <div class="prescription-section editable" data-section="instructions">
                <h4><i class="fas fa-clipboard-list"></i> Instructions</h4>
                <ul class="prescription-list">
                    ${this.sampleData.samplePrescription.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
                </ul>
            </div>
        `;
        
        prescriptionContent.innerHTML = prescriptionHTML;
        this.bindEditEvents();
    }

    bindEditEvents() {
        const editableSections = document.querySelectorAll('.prescription-section.editable');
        editableSections.forEach(section => {
            section.addEventListener('dblclick', () => this.editSection(section));
        });
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
        const editBtn = document.getElementById('editModeBtn');
        const editableSections = document.querySelectorAll('.prescription-section.editable');
        
        if (editBtn && editableSections.length > 0) {
            if (this.editMode) {
                editBtn.innerHTML = '<i class="fas fa-eye"></i> View Mode';
                editableSections.forEach(section => {
                    section.style.cursor = 'pointer';
                    section.title = 'Double-click to edit';
                });
            } else {
                editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit Mode';
                editableSections.forEach(section => {
                    section.style.cursor = 'default';
                    section.title = '';
                });
            }
        }
    }

    editSection(section) {
        if (!this.editMode) return;

        const content = section.querySelector('.prescription-list') || section.querySelector('.info-item');
        if (!content) return;

        const originalHTML = content.outerHTML;
        const textContent = content.textContent.trim();

        const editHTML = `
            <textarea class="edit-textarea" placeholder="Edit content...">${textContent}</textarea>
            <div class="edit-actions">
                <button class="btn btn--secondary btn--sm cancel-edit">Cancel</button>
                <button class="btn btn--primary btn--sm save-edit">Save</button>
            </div>
        `;

        section.classList.add('editing');
        content.outerHTML = editHTML;

        const textarea = section.querySelector('.edit-textarea');
        const saveBtn = section.querySelector('.save-edit');
        const cancelBtn = section.querySelector('.cancel-edit');

        if (textarea) textarea.focus();

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const newContent = textarea.value.trim();
                if (newContent) {
                    const newHTML = `<ul class="prescription-list">${newContent.split('\n').filter(line => line.trim()).map(line => `<li>${line.trim()}</li>`).join('')}</ul>`;
                    section.querySelector('.edit-textarea').parentNode.outerHTML = newHTML;
                    section.classList.remove('editing');
                }
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                section.querySelector('.edit-textarea').parentNode.outerHTML = originalHTML;
                section.classList.remove('editing');
            });
        }
    }

    renderTips() {
        const tipsList = document.getElementById('tipsList');
        if (tipsList) {
            tipsList.innerHTML = this.sampleData.recordingTips
                .map(tip => `<li>${tip}</li>`)
                .join('');
        }
    }

    printPrescription() {
        const prescriptionContent = document.getElementById('prescriptionContent');
        if (!prescriptionContent) return;
        
        const printContent = prescriptionContent.innerHTML;
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>Medical Prescription</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .prescription-section { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; }
                        .prescription-section h4 { color: #2563eb; margin-bottom: 10px; }
                        .prescription-list { list-style: none; padding: 0; }
                        .prescription-list li { padding: 5px 0; border-bottom: 1px solid #eee; }
                        .prescription-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                        .info-item { margin-bottom: 10px; }
                        .info-label { font-weight: bold; color: #666; }
                        .medication-item { display: flex; justify-content: space-between; }
                        .medication-route { background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <h1>Medical Prescription</h1>
                    <hr>
                    ${printContent}
                    <hr>
                    <p><small>Generated by Voice Rx AI System - ${new Date().toLocaleDateString()}</small></p>
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    }

    savePrescription() {
        const prescriptionData = {
            date: new Date().toISOString(),
            doctor: this.sessionData.doctor.name ? this.sessionData.doctor : this.sampleData.samplePrescription.doctor,
            patient: this.sessionData.patient.name ? this.sessionData.patient : this.sampleData.samplePrescription.patient,
            prescription: this.sampleData.samplePrescription
        };

        const dataStr = JSON.stringify(prescriptionData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `prescription_${new Date().toISOString().split('T')[0]}_${prescriptionData.patient.name.replace(/\s+/g, '_')}.json`;
        link.click();
        
        // Show success message
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            const originalHTML = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
            saveBtn.style.background = 'var(--color-success)';
            
            setTimeout(() => {
                saveBtn.innerHTML = originalHTML;
                saveBtn.style.background = '';
            }, 2000);
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VoiceRxSystem();
});