import React, { useState, useMemo, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/layout/SideBar';
import Header from '../components/layout/Header';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FiSettings } from 'react-icons/fi';
import { FaMicrophone } from "react-icons/fa";
import PastPrescriptionsSection from '../components/consultation/PastPrescriptionsSection';
import { MdDeleteOutline } from 'react-icons/md';
import DraggableSection from '../components/consultation/DraggableSection';
import VitalsGrid from '../components/consultation/VitalsGrid';
import Modal from '../components/ui/Modal';
import Button from "../components/ui/Button";
import {
  ComplaintsSection,
  HistorySection,
  ExaminationSection,
  DiagnosisSection,
  InvestigationsSection,
  MedicationSection,
  AdviceSection,
  FollowUpSection
} from '../components/consultation/Sections';
import { rxData } from '../data/RxDummyData';
import { SortableItem } from '../components/consultation/SortableItem';
import axiosInstance from '../api/axiosInstance';
import Loading from '../components/ui/Loading';
import { toast } from 'react-toastify';
import { DoctorIdContext } from '../App';

const DEFAULT_SECTION_ORDER = [
  'complaints',
  'history',
  'examination',
  'diagnosis',
  'investigations',
  'medication',
  'advice',
  'followUp'
];

const STORAGE_KEY = 'consult-section-order';

const ConsultationForm = () => {
  const { id } = useParams();
  const doctorId = useContext(DoctorIdContext);
  // const patient = rxData.find((p) => p.uid === id);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    axiosInstance.get(`/patient/uid/${id}`)
      .then(res => {
        setPatient(res.data.patient);
      })
      .catch(() => {
        setPatient(null);
        setError("Failed to fetch patient data.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const [isConfigMode, setIsConfigMode] = useState(false);
  const [sectionOrder, setSectionOrder] = useState(() => {
    const savedOrder = localStorage.getItem(STORAGE_KEY);
    if (savedOrder) {
      try {
        const parsed = JSON.parse(savedOrder);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Error parsing saved order:", e);
      }
    }
    return DEFAULT_SECTION_ORDER;
  });

  const [customSections, setCustomSections] = useState(() => {
    const saved = localStorage.getItem('customSections');
    return saved ? JSON.parse(saved) : [];
  });

  const [showNewSectionForm, setShowNewSectionForm] = useState(false);
  const [newSectionData, setNewSectionData] = useState({ heading: '', label: '', type: '', options: '' });
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem(STORAGE_KEY);
    const savedCustomSections = localStorage.getItem('customSections');
    try {
      let custom = [];
      let order = [];

      if (savedCustomSections) {
        custom = JSON.parse(savedCustomSections);
      }

      if (savedOrder) {
        const parsedOrder = JSON.parse(savedOrder);
        if (Array.isArray(parsedOrder)) {
          order = parsedOrder;
        }
      }

      if (!savedOrder) {
        order = [...DEFAULT_SECTION_ORDER];
      }

      const customIds = custom.map(section => section.id);
      customIds.forEach(id => {
        if (!order.includes(id)) {
          order.push(id);
        }
      });

      setCustomSections(custom);
      setSectionOrder(order);
    } catch (err) {
      console.error("Error parsing local storage data:", err);
      setCustomSections([]);
      setSectionOrder([...DEFAULT_SECTION_ORDER]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('customSections', JSON.stringify(customSections));
  }, [customSections]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sectionOrder));
  }, [sectionOrder]);

  const updateSectionOrder = (newOrder) => {
    setSectionOrder(newOrder);
  };

  const handleAddCustomSection = () => {
    const { heading, label, type, options } = newSectionData;
    if (!heading.trim() || !label.trim() || !type.trim()) return;
    const newId = crypto.randomUUID();
    const newSection = {
      id: newId,
      heading,
      fields: [{
        label,
        type,
        options: type === 'dropdown' ? options.split(',').map(opt => opt.trim()) : [],
        values: [{ id: crypto.randomUUID(), value: '' }]
      }]
    };
    setCustomSections([...customSections, newSection]);
    setSectionOrder([newId, ...sectionOrder]);
    setNewSectionData({ heading: '', label: '', type: '', options: '' });
    setShowNewSectionForm(false);
  };

  const handleDeleteCustomSection = (id) => {
    setCustomSections(customSections.filter((s) => s.id !== id));
    setSectionOrder(sectionOrder.filter((secId) => secId !== id));
  };

 const handleInputChange = (sectionId, fieldIdx, inputIdx, newValue) => {
  setCustomSections(prev => prev.map(section => {
    if (section.id !== sectionId) return section;
    const field = section.fields[fieldIdx];
    const updatedValues = [...field.values];
    updatedValues[inputIdx].value = newValue;

    // ✅ Only for input type, allow auto-add new row
    if (field.type === 'input' && inputIdx === updatedValues.length - 1 && newValue.trim()) {
      updatedValues.push({ id: crypto.randomUUID(), value: '' });
    }

    section.fields[fieldIdx].values = updatedValues;
    return { ...section };
  }));
};


  const handleDeleteInput = (sectionId, fieldIdx, inputId) => {
    setCustomSections(prev => prev.map(section => {
      if (section.id !== sectionId) return section;
      const field = section.fields[fieldIdx];
      const filtered = field.values.filter(v => v.id !== inputId);
      if (filtered.length > 0) {
        section.fields[fieldIdx].values = filtered;
      }
      return { ...section };
    }));
  };

  const [formData, setFormData] = useState({
    vitals: {
      bp: '',
      pulse: '',
      height: '',
      weight: '',
      temperature: '',
      spo2: '',
      rbs: ''
    },
    complaints: [{ id: crypto.randomUUID(), text: '' }],
    medication: [{
      id: crypto.randomUUID(),
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      notes: ''
    }],
    pastHistory: [{ id: crypto.randomUUID(), value: '' }],
    surgicalHistory: [{ id: crypto.randomUUID(), value: '' }],
    drugAllergy: [{ id: crypto.randomUUID(), value: '' }],
    physicalExamination: [{ id: crypto.randomUUID(), text: '' }],
    diagnosis: {
      provisional: [{ id: crypto.randomUUID(), value: '' }],
      final: [{ id: crypto.randomUUID(), value: '' }]
    },
    tests: [{ id: crypto.randomUUID(), value: '' }],
    testNotes: [{ id: crypto.randomUUID(), value: '' }],
    advice: '',
    followUp: ['', '']
  });

  const sections = useMemo(() => {
    const baseSections = {
      complaints: <ComplaintsSection isConfigMode={isConfigMode} formData={formData} setFormData={setFormData} enabled={!isConfigMode} />,
      history: <HistorySection isConfigMode={isConfigMode} formData={formData} setFormData={setFormData} />,
      examination: <ExaminationSection isConfigMode={isConfigMode} formData={formData} setFormData={setFormData} enabled={!isConfigMode} />,
      diagnosis: <DiagnosisSection isConfigMode={isConfigMode} formData={formData} setFormData={setFormData} />,
      investigations: <InvestigationsSection isConfigMode={isConfigMode} formData={formData} setFormData={setFormData} />,
      medication: <MedicationSection isConfigMode={isConfigMode} formData={formData} setFormData={setFormData} />,
      advice: <AdviceSection isConfigMode={isConfigMode} formData={formData} setFormData={setFormData} />,
      followUp: <FollowUpSection isConfigMode={isConfigMode} formData={formData} setFormData={setFormData} />
    };

    const customSectionsObj = {};
    customSections.forEach(section => {
      customSectionsObj[section.id] = (
        <DraggableSection id={section.id} enabled={isConfigMode}>
          <div className="rounded-lg space-y-2">
            <div className="flex justify-between items-center -mt-1">
              <h3 className="text-lg font-semibold">{section.heading}</h3>
              {isConfigMode && (
                <button onClick={() => handleDeleteCustomSection(section.id)} className="text-red-600 text-sm"><MdDeleteOutline size={20} /></button>
              )}
            </div>
            {section.fields.map((field, fieldIdx) => {
              const values = field.values;
              return (
                <DndContext
                  key={fieldIdx}
                  onDragEnd={({ active, over }) => {
                    if (isConfigMode) return;
                    if (!over) return;
                    if (active.id !== over.id) {
                      const oldIndex = values.findIndex(v => v.id === active.id);
                      const newIndex = values.findIndex(v => v.id === over.id);
                      const newOrder = arrayMove(values, oldIndex, newIndex);
                      setCustomSections(prev => prev.map(s => {
                        if (s.id !== section.id) return s;
                        s.fields[fieldIdx].values = newOrder;
                        return { ...s };
                      }));
                    }
                  }}
                >
                  <SortableContext items={values.map(v => v.id)} strategy={verticalListSortingStrategy}>
                    {values.map((val, idx) => (
                      <SortableItem key={val.id} id={val.id} disabled={isConfigMode}>
                        <div className="flex flex-1 items-center gap-2">
                          {field.type === "input" && (
  <input
    value={val.value}
    onChange={(e) => handleInputChange(section.id, fieldIdx, idx, e.target.value)}
    className="flex-1 border rounded p-2"
  />
)}

{field.type === "textarea" && (
  <textarea
    value={val.value}
    onChange={(e) => handleInputChange(section.id, fieldIdx, idx, e.target.value)}
    className="flex-1 border rounded p-2"
  />
)}

{field.type === "date" && (
  <input
    type="date"
    value={val.value}
    onChange={(e) => handleInputChange(section.id, fieldIdx, idx, e.target.value)}
    className="flex-1 border rounded p-2"
  />
)}

{field.type === "dropdown" && (
  <select
    value={val.value}
    onChange={(e) => handleInputChange(section.id, fieldIdx, idx, e.target.value)}
    className="flex-1 border rounded p-2"
  >
    <option value="">Select</option>
    {field.options.map((opt, i) => (
      <option key={i} value={opt}>{opt}</option>
    ))}
  </select>
)}

{field.type === "checkbox" && (
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={val.value === "true"}
      onChange={(e) => handleInputChange(section.id, fieldIdx, idx, e.target.checked ? "true" : "false")}
      className="w-5 h-5"
    />
    <span>{field.label}</span>
  </label>
)}


                          {values.length > 1 && !isConfigMode && (
                            <button
                              onClick={() => handleDeleteInput(section.id, fieldIdx, val.id)}
                              className="text-red-600 text-sm whitespace-nowrap"
                            >
                              <MdDeleteOutline size={20} />
                            </button>
                          )}
                        </div>
                      </SortableItem>
                    ))}
                  </SortableContext>
                </DndContext>
              );
            })}
          </div>
        </DraggableSection>
      );
    });

    return { ...baseSections, ...customSectionsObj };
  }, [formData, isConfigMode, customSections]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loading /></div>;
  if (error) return <div className="flex h-screen items-center justify-center text-red-600">{error}</div>;

  const handleSaveAndFinalize = async () => {
    const jwtToken = document.cookie.split('; ').find(row => row.startsWith('jwt_token='))?.split('=')[1];
    console.log('DEBUG: doctorId:', doctorId, 'patient:', patient, 'jwt_token:', jwtToken);
    if (!doctorId || !patient?._id) {
      toast.error('Doctor or patient not found. doctorId: ' + doctorId + ', patient: ' + JSON.stringify(patient));
      return;
    }
    setActionLoading(true);
    try {
      const payload = {
        ...formData,
        customSections,
      };
      await axiosInstance.post(`/${doctorId}/prescription/${patient._id}/end-consultation`, payload);
      // Refetch patient to update past prescriptions
      const res = await axiosInstance.get(`/patient/uid/${id}`);
      setPatient(res.data.patient);
      toast.success('Prescription saved and finalized!');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to save prescription.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!doctorId || !patient?._id) {
      toast.error('Doctor or patient not found.');
      return;
    }
    setActionLoading(true);
    try {
      const payload = {
        ...formData,
        customSections,
      };
      await axiosInstance.post(`/${doctorId}/prescription/${patient._id}/end-consultation`, payload);
      toast.success('Prescription sent via WhatsApp!');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to send via WhatsApp.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-2 bg-white overflow-y-auto">
          <div className="max-w-[90%] mx-auto py-8 space-y-10">
            <div className="max-w-6xl mx-auto space-y-6 font-sans text-sm">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Consultation for {patient?.fullName || patient?.name || 'Unknown'}</h1>
                <div className="flex gap-2">
                  <button onClick={() => setIsConfigMode(!isConfigMode)} className="bg-[#7047d1] flex items-center text-white px-3 py-2 rounded-xl hover:scale-105">
                    <FiSettings className="mr-1" />
                    {isConfigMode ? 'Done' : 'Configure'}
                  </button>
                  {isConfigMode && (
                    <>
                      <button onClick={() => setShowNewSectionForm(true)} className="bg-green-600 text-white px-4 py-2 rounded-xl">+ Add Section</button>
                      <Modal isOpen={showNewSectionForm} onClose={() => setShowNewSectionForm(false)} title="Add New Section">
                        <div className="space-y-2">
                          <input type="text" className="w-full border p-2 rounded" placeholder="Section Heading" value={newSectionData.heading} onChange={(e) => setNewSectionData({ ...newSectionData, heading: e.target.value })} />
                          <input type="text" className="w-full border p-2 rounded" placeholder="Subheading Label" value={newSectionData.label} onChange={(e) => setNewSectionData({ ...newSectionData, label: e.target.value })} />
                          <select className="w-full border p-2 rounded" value={newSectionData.type} onChange={(e) => setNewSectionData({ ...newSectionData, type: e.target.value })}>
                            <option value="">Select Input Type</option>
                            <option value="input">Input</option>
                            <option value="textarea">Textarea</option>
                            <option value="date">Date</option>
                            <option value="dropdown">Dropdown</option>
                            <option value="checkbox">Checkbox</option>
                          </select>
                          {newSectionData.type === 'dropdown' && (
                            <input type="text" className="w-full border p-2 rounded" placeholder="Comma-separated options" value={newSectionData.options} onChange={(e) => setNewSectionData({ ...newSectionData, options: e.target.value })} />
                          )}
                          <div className="flex justify-end gap-2">
                            <button className="px-4 py-1 bg-gray-300 rounded" onClick={() => setShowNewSectionForm(false)}>Cancel</button>
                            <button className="px-4 py-1 bg-[#7047d1] text-white rounded" onClick={handleAddCustomSection}>Add</button>
                          </div>
                        </div>
                      </Modal>
                    </>
                  )}
                  <button className="bg-[#7047d1] text-white px-4 py-2 rounded-xl hover:scale-105">Load Template</button>
                  <button className="bg-[#7047d1] text-white px-4 py-2 rounded-full hover:scale-105"><FaMicrophone size={20} /></button>
                </div>
              </div>
              <div className='flex justify-between'>
                <p className="text-sm text-[#69578F]">UID: {patient?.uid || "N/A"} | Age: {patient?.age || "N/A"}</p>
                <img src={patient?.img || "/Ava Evans.png"} alt="Patient" className="h-[160px] w-[300px] object-cover rounded" />
              </div>
              <VitalsGrid vitals={formData.vitals} setFormData={setFormData} />

              <DndContext
                collisionDetection={closestCenter}
                onDragStart={({ active }) => setActiveId(active.id)}
                onDragEnd={({ active, over }) => {
                  setActiveId(null);
                  if (active.id !== over?.id) {
                    const oldIndex = sectionOrder.indexOf(active.id);
                    const newIndex = sectionOrder.indexOf(over.id);
                    const newOrder = arrayMove(sectionOrder, oldIndex, newIndex);
                    updateSectionOrder(newOrder);
                  }
                }}
                onDragCancel={() => setActiveId(null)}
              >
                <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
                  {sectionOrder.map((key) => (
                    <React.Fragment key={key}>
                      {sections[key]}
                    </React.Fragment>
                  ))}
                </SortableContext>

                <DragOverlay>
                  {activeId ? (
                    <div style={{ width: "100%" }}>
                      {sections[activeId]}
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>

              <div className="flex gap-4 mt-4">
                <Button className="bg-[#7047d1] text-white px-4 py-2 rounded-2xl" onClick={handleSaveAndFinalize} disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Save & Finalize'}
                </Button>
                <Button className="px-4 py-2 rounded" onClick={() => window.print()} disabled={actionLoading}>Print Prescription</Button>
                <Button className="bg-[#7047d1] text-white px-4 py-2 rounded-2xl ml-auto" onClick={handleSendWhatsApp} disabled={actionLoading}>
                  {actionLoading ? 'Sending...' : 'Send via WhatsApp'}
                </Button>
              </div>
              <PastPrescriptionsSection patient={patient} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ConsultationForm;
