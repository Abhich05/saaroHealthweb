import React, { useEffect } from 'react';
import DraggableSection from '../DraggableSection';
import { RxDragHandleDots2 } from 'react-icons/rx';
import { MdDeleteOutline } from 'react-icons/md';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableMedicationInput = ({ id, index, medication, onChange, onDelete, dragDisabled, hideDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2">
      {!dragDisabled && (
        <div {...attributes} {...listeners} className="cursor-grab text-[#7047d1] mt-2">
          <RxDragHandleDots2 size={20} />
        </div>
      )}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        <input
          value={medication.name}
          onChange={(e) => onChange('name', e.target.value, index)}
          placeholder="Medicine Name"
          className="border p-2 rounded bg-gray-100"
        />
        <input
          value={medication.dosage}
          onChange={(e) => onChange('dosage', e.target.value, index)}
          placeholder="Dosage"
          className="border p-2 rounded bg-gray-100"
        />
        <input
          value={medication.frequency}
          onChange={(e) => onChange('frequency', e.target.value, index)}
          placeholder="Frequency"
          className="border p-2 rounded bg-gray-100"
        />
        <input
          value={medication.duration}
          onChange={(e) => onChange('duration', e.target.value, index)}
          placeholder="Duration"
          className="border p-2 rounded bg-gray-100"
        />
      </div>
      <div className="flex-1">
        <input
          value={medication.notes}
          onChange={(e) => onChange('notes', e.target.value, index)}
          placeholder="Notes"
          className="w-full border p-2 rounded bg-gray-100"
        />
      </div>
      {!hideDelete && (
        <button
          className="mt-2 ml-1 text-red-600"
          onClick={() => onDelete(index)}
          title="Delete medication"
        >
          <MdDeleteOutline size={20}/>
        </button>
      )}
    </div>
  );
};

const MedicationSection = ({ formData, setFormData, isConfigMode }) => {
  // Start with one row if empty
  useEffect(() => {
    if (formData.medication.length === 0) {
      setFormData({
        ...formData,
        medication: [{
          id: crypto.randomUUID(),
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          notes: ''
        }]
      });
    }
  }, []);

  const handleChange = (field, value, index) => {
    const updated = [...formData.medication];
    updated[index] = { ...updated[index], [field]: value };

    const isLast = index === formData.medication.length - 1;
    const hasAnyValue = Object.values(updated[index]).some(val => val.trim() !== '');
    
    if (isLast && hasAnyValue) {
      setFormData({
        ...formData,
        medication: [...formData.medication, {
          id: crypto.randomUUID(),
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          notes: ''
        }]
      });
    } else {
      setFormData({ ...formData, medication: updated });
    }
  };

  const handleDelete = (index) => {
    const updated = [...formData.medication];
    updated.splice(index, 1);
    
    if (updated.length === 0) {
      updated.push({
        id: crypto.randomUUID(),
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        notes: ''
      });
    }

    setFormData({ ...formData, medication: updated });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = formData.medication.findIndex((item) => item.id === active.id);
      const newIndex = formData.medication.findIndex((item) => item.id === over.id);
      const newOrder = arrayMove(formData.medication, oldIndex, newIndex);
      setFormData({ ...formData, medication: newOrder });
    }
  };

  return (
    <DraggableSection id="medication" enabled={isConfigMode}>
      <div>
        <h2 className="font-semibold mb-4 text-[22px]">Medication</h2>
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={formData.medication.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {formData.medication.map((medication, index) => (
              <SortableMedicationInput
                key={medication.id}
                id={medication.id}
                index={index}
                medication={medication}
                onChange={handleChange}
                onDelete={handleDelete}
                dragDisabled={isConfigMode}
                hideDelete={isConfigMode}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </DraggableSection>
  );
};

export default MedicationSection; 