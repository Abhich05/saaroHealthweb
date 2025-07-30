import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/layout/SideBar';
import Header from '../components/layout/Header';
import GenericTable from '../components/ui/GenericTable';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { FiSettings } from "react-icons/fi";
import axiosInstance from '../api/axiosInstance';
import { DoctorIdContext } from '../App';

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RxDragHandleDots2 } from 'react-icons/rx';
import Loading from "../components/ui/Loading";

const columns = [
  { label: 'Medicine', accessor: 'medicine' },
  { label: 'Dosage', accessor: 'dosage' },
  { label: 'Frequency', accessor: 'frequency' },
  { label: 'Duration', accessor: 'duration' },
  { label: 'Notes', accessor: 'notes' },
];

const DraggableSection = ({ id, children, enabled }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative bg-white rounded shadow-md ${enabled ? 'border-2 border-dashed border-[#7047d1]' : ''} p-4`}>
      <div className="flex justify-start gap-2">
        {enabled && (
          <div {...attributes} {...listeners} className="cursor-grab text-[#7047d1]">
            <RxDragHandleDots2 size={20} />
          </div>
        )}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};

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
const COMPLAINTS_KEY = 'complaints-data';
const MEDICATION_KEY = 'medication-data';



const ConsultationForm = () => {
  const { id: patientId } = useParams();
  const doctorId = useContext(DoctorIdContext);

  // Initial formData state
  const defaultFormData = {
    vitals: { bp: '', pulse: '', height: '', weight: '', temperature: '', spo2: '', rbs: '' },
    complaints: [{ id: crypto.randomUUID(), text: '' }],
    medication: [{ id: crypto.randomUUID(), name: '', dosage: '', frequency: '', duration: '', notes: '' }],
    pastHistory: '',
    surgicalHistory: '',
    drugAllergy: '',
    physicalExamination: [{ id: crypto.randomUUID(), text: '' }],
    diagnosis: { provisional: ['', ''], final: ['', ''] },
    tests: ['', ''],
    testNotes: ['', ''],
    advice: '',
    followUp: ['', '']
  };
  const [formData, setFormData] = useState(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch draft prescription on load
  useEffect(() => {
    if (!doctorId || !patientId) return;
    setLoading(true);
    setError('');
    axiosInstance.get(`/doctor/${doctorId}/prescription/${patientId}`)
      .then(res => {
        const draft = res.data?.prescription;
        if (draft) {
          setFormData({ ...defaultFormData, ...draft });
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setError('Failed to fetch prescription data');
      });
  }, [doctorId, patientId]);

  // Save/finalize prescription
  const handleSave = () => {
    if (!doctorId || !patientId) return;
    setLoading(true);
    setError('');
    setSuccess('');
    axiosInstance.post(`/doctor/${doctorId}/prescription/${patientId}`, formData)
      .then(() => {
        setSuccess('Prescription saved successfully');
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to save prescription');
        setLoading(false);
      });
  };


  const [isConfigMode, setIsConfigMode] = useState(false);
  const [sectionOrder, setSectionOrder] = useState(DEFAULT_SECTION_ORDER);

  // Load persisted order
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setSectionOrder(parsed);
      } catch {}
    }
     const storedComplaints = localStorage.getItem(COMPLAINTS_KEY);
  if (storedComplaints) {
    try {
      const parsed = JSON.parse(storedComplaints);
      if (Array.isArray(parsed)) {
        setFormData((prev) => ({ ...prev, complaints: parsed }));
      }
    } catch {}
  }
  }, []);
useEffect(() => {
  const storedComplaints = localStorage.getItem(COMPLAINTS_KEY);
  if (storedComplaints) {
    try {
      const parsed = JSON.parse(storedComplaints);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(c => c.text.trim() !== '');
        const complaintsToUse = cleaned.length === 0
          ? [{ id: crypto.randomUUID(), text: '' }]
          : [...cleaned, { id: crypto.randomUUID(), text: '' }];
        setFormData((prev) => ({ ...prev, complaints: complaintsToUse }));
      }
    } catch {}
  }
}, []);




useEffect(() => {
  let meds = [...formData.medication];

  // Ensure there's always at least one row
  if (
    meds.length === 0 ||
    (
      meds.length > 1 &&
      Object.values(meds.at(-1))
        .filter((v, i) => i !== 0) // skip id
        .every((val) => val.trim?.() === '')
    )
  ) {
    meds.pop();
  }

  // Save only the order of IDs, not the full data
  const ids = meds.map((m) => m.id);
  localStorage.setItem('medication-order', JSON.stringify(ids));
}, [formData.medication]);

useEffect(() => {
  const ids = formData.physicalExamination.map((e) => e.id);
  localStorage.setItem('physical-order', JSON.stringify(ids));
}, [formData.physicalExamination]);




  const updateSectionOrder = (newOrder) => {
    setSectionOrder(newOrder);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));
  };

  const sections = useMemo(() => ({
   complaints: (
  <DraggableSection key="complaints" id="complaints" enabled={isConfigMode}>
    <div>
      <div className="font-semibold mb-4 text-[22px]">Chief Complaints</div>

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (!over) return;
          if (active.id !== over.id) {
            const oldIndex = formData.complaints.findIndex((c) => c.id === active.id);
            const newIndex = formData.complaints.findIndex((c) => c.id === over.id);
            const newList = arrayMove(formData.complaints, oldIndex, newIndex);
            setFormData({ ...formData, complaints: newList });
          }
        }}
      >
        <SortableContext
          items={formData.complaints.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {formData.complaints.map((complaint, i) => (
            <SortableComplaintInput
              key={complaint.id}
              id={complaint.id}
              index={i}
                label="Complaint"
              value={complaint.text}
              onChange={(val) => {
                const updated = [...formData.complaints];
                updated[i] = { ...updated[i], text: val };
                if (i === updated.length - 1 && val.trim() !== '') {
                  updated.push({ id: crypto.randomUUID(), text: '' });
                }
                setFormData({ ...formData, complaints: updated });
              }}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  </DraggableSection>
)
,

    history: (
      <DraggableSection key="history" id="history" enabled={isConfigMode}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Past History', 'Surgical History', 'Drug Allergy'].map((label) => {
            const key = label.toLowerCase().replace(/ /g, '');
            return (
              <div className="flex flex-col" key={key}>
                <label className="mb-1 font-medium">{label}</label>
                <input
                  value={formData[key]}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  className="border p-2 rounded bg-gray-100 placeholder-[#69578F]"
                />
              </div>
            );
          })}
        </div>
      </DraggableSection>
    ),
  // adjust path if needed

examination: (
  <DraggableSection key="examination" id="examination" enabled={isConfigMode}>
    <div>
      <div className="font-semibold mb-4 text-[22px]">Physical Examination</div>
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (!over) return;
          if (active.id !== over.id) {
            const oldIndex = formData.physicalExamination.findIndex((c) => c.id === active.id);
            const newIndex = formData.physicalExamination.findIndex((c) => c.id === over.id);
            const newList = arrayMove(formData.physicalExamination, oldIndex, newIndex);
            setFormData({ ...formData, physicalExamination: newList });
          }
        }}
      >
        <SortableContext
          items={formData.physicalExamination.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {formData.physicalExamination.map((exam, i) => (
            <SortableComplaintInput
              key={exam.id}
              id={exam.id}
              index={i}
              value={exam.text}
              label="Observation"
              onChange={(val) => {
                const updated = [...formData.physicalExamination];
                updated[i] = { ...updated[i], text: val };
                if (i === updated.length - 1 && val.trim() !== '') {
                  updated.push({ id: crypto.randomUUID(), text: '' });
                }
                setFormData({ ...formData, physicalExamination: updated });
              }}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  </DraggableSection>
),


    diagnosis: (
      <DraggableSection key="diagnosis" id="diagnosis" enabled={isConfigMode}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["provisional", "final"].map((type) => (
            <div key={type}>
              <div className="font-semibold mb-4 text-[22px]">{type[0].toUpperCase() + type.slice(1)} Diagnosis</div>
              {formData.diagnosis[type].map((text, i) => (
                <div key={i} className="flex flex-col mt-2">
                  <label className="mb-1 font-medium">{type} {i + 1}</label>
                  <input
                    value={text}
                    onChange={(e) => {
                      const updated = [...formData.diagnosis[type]];
                      updated[i] = e.target.value;
                      setFormData({
                        ...formData,
                        diagnosis: { ...formData.diagnosis, [type]: updated },
                      });
                    }}
                    placeholder={`Enter ${type} diagnosis`}
                    className="border p-2 rounded bg-gray-100 placeholder-[#69578F]"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </DraggableSection>
    ),
    investigations: (
      <DraggableSection key="investigations" id="investigations" enabled={isConfigMode}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.tests.map((test, i) => (
            <div key={i} className="flex flex-col">
              <label className="mb-1 font-medium">Test {i + 1}</label>
              <input
                value={test}
                onChange={(e) => {
                  const updated = [...formData.tests];
                  updated[i] = e.target.value;
                  setFormData({ ...formData, tests: updated });
                }}
                placeholder="Enter Test"
                className="border p-2 rounded bg-gray-100 placeholder-[#69578F]"
              />
            </div>
          ))}
          {formData.testNotes.map((note, i) => (
            <div key={i} className="flex flex-col">
              <label className="mb-1 font-medium">Test Note {i + 1}</label>
              <input
                value={note}
                onChange={(e) => {
                  const updated = [...formData.testNotes];
                  updated[i] = e.target.value;
                  setFormData({ ...formData, testNotes: updated });
                }}
                placeholder="Note for Lab"
                className="border p-2 rounded bg-gray-100 placeholder-[#69578F]"
              />
            </div>
          ))}
        </div>
      </DraggableSection>
    ),
    medication: (
  <DraggableSection key="medication" id="medication" enabled={isConfigMode}>
    <div>
      <div className="font-semibold mb-4 text-[22px]">Medication / Prescription</div>
      <div className="overflow-x-auto border rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#ede3fd] text-[#7047d1]">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Dosage</th>
              <th className="px-4 py-2 text-left">Frequency</th>
              <th className="px-4 py-2 text-left">Duration</th>
              <th className="px-4 py-2 text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {formData.medication.map((med, index) => (
              <tr key={med.id} className="bg-white">
                {['name', 'dosage', 'frequency', 'duration', 'notes'].map((field) => (
                  <td key={field} className="px-4 py-2">
                    <input
                      className="w-full p-2 border rounded bg-gray-50"
                      placeholder={`Enter ${field}`}
                      value={med[field]}
                      onChange={(e) => {
                        const updated = [...formData.medication];
                        updated[index] = { ...updated[index], [field]: e.target.value };

                        const isLast = index === updated.length - 1;
                        const hasText = e.target.value.trim() !== '';

                        if (isLast && hasText) {
                          updated.push({
                            id: crypto.randomUUID(),
                            name: '', dosage: '', frequency: '', duration: '', notes: ''
                          });
                        }

                        setFormData({ ...formData, medication: updated });
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </DraggableSection>
),

    advice: (
      <DraggableSection key="advice" id="advice" enabled={isConfigMode}>
        <div className="flex flex-col">
          <label className="mb-1 font-medium mb-4 text-[22px]">Advice</label>
          <textarea
            value={formData.advice}
            onChange={(e) => setFormData({ ...formData, advice: e.target.value })}
            placeholder="Enter advice"
            className="w-full border p-2 rounded bg-gray-100 placeholder-[#69578F]"
            rows={6}
          />
        </div>
      </DraggableSection>
    ),
    followUp: (
      <DraggableSection key="followUp" id="followUp" enabled={isConfigMode}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.followUp.map((val, i) => (
            <div key={i} className="flex flex-col">
              <label className="mb-1 font-medium mb-4 text-[22px]">Follow-up after</label>
              <input
                type="date"
                value={val}
                placeholder="Select Date"
                onChange={(e) => {
                  const updated = [...formData.followUp];
                  updated[i] = e.target.value;
                  setFormData({ ...formData, followUp: updated });
                }}
                className="border p-2 rounded bg-gray-100 placeholder-[#69578F]"
              />
            </div>
          ))}
        </div>
      </DraggableSection>
    ),
  }), [formData, isConfigMode]);

  // Remove full page loading
  if (error) return (
    <div className="flex h-screen items-center justify-center">
      <div className="bg-red-100 text-red-700 p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-2 bg-white overflow-y-auto">
          <div className="max-w-[90%] mx-auto py-8 space-y-10">
            <div className="max-w-6xl mx-auto space-y-6 font-sans text-sm">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Consultation for {/*patient?.name || 'Unknown'}*/}Unknown</h1>
                <div className='flex justify-between'>
                <button
                  onClick={() => setIsConfigMode(!isConfigMode)}
                  className="bg-[#7047d1] flex items-center justify-between text-white px-2 py-2 rounded-xl mr-1"

                >
                  <FiSettings className="mr-1"/> {isConfigMode ? 'Done' : 'Configure'}
                </button>
                <button
                  className="bg-[#7047d1] text-white px-4 py-2 rounded-xl"

                >
                  Load Template
                </button>
                </div>
              </div>
              <p className='text-sm text-[#69578F]'>UID: {/*patient?.uid || "N/A"}*/}N/A | Age: {/*patient?.age || "N/A"}*/}N/A</p>
              <img
                src={/*patient?.img || "/Ava Evans.png"}*/"/Ava Evans.png"}
                alt="Patient"
                className="h-[160px] w-[300px] object-cover rounded"
              />

              {loading && <p className="text-center py-4 text-lg text-gray-600">Loading consultation...</p>}
              {error && <p className="text-center py-4 text-lg text-red-600">{error}</p>}
              {success && <p className="text-center py-4 text-lg text-green-600">{success}</p>}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(formData.vitals).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <label className="mb-1 font-medium">{key.toUpperCase()}</label>
                    <input
                      value={value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vitals: { ...formData.vitals, [key]: e.target.value }
                        })
                      }
                      placeholder={key.toUpperCase()}
                      className="border p-2 rounded bg-gray-100 placeholder-[#69578F]"
                    />
                  </div>
                ))}
              </div>

              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={(event) => {
                  const { active, over } = event;
                  if (active.id !== over?.id) {
                    const oldIndex = sectionOrder.indexOf(active.id);
                    const newIndex = sectionOrder.indexOf(over.id);
                    const newOrder = arrayMove(sectionOrder, oldIndex, newIndex);
                    updateSectionOrder(newOrder);
                  }
                }}
              >
                <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
                  {sectionOrder.map((sectionKey) => sections[sectionKey])}
                </SortableContext>
              </DndContext>

              <div className="flex gap-4 mt-4">
                <button onClick={handleSave} className="bg-[#7047d1] text-white px-4 py-2 rounded-2xl">Save & Finalize</button>
                <button className="bg-gray-200 px-4 py-2 rounded">Print Prescription</button>
                <button className="bg-[#7047d1] text-white px-4 py-2 rounded-2xl ml-auto">Send via WhatsApp</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ConsultationForm;

const SortableComplaintInput = ({ id, index, value, onChange, label = "Complaint" }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: '1rem'
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2">
      <div {...attributes} {...listeners} className="cursor-grab text-[#7047d1] mt-2">
        <RxDragHandleDots2 size={20} />
      </div>
      <div className="flex-1">
        <label className="mb-1 font-medium block">{label} {index + 1}</label>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${label}`}
          className="w-full border p-2 rounded bg-gray-100 placeholder-[#69578F]"
        />
      </div>
    </div>
  );
};