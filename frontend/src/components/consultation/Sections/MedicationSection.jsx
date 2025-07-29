{/*import React from 'react';
import DraggableSection from '../DraggableSection';
import { MdDeleteOutline } from 'react-icons/md';
import { RxDragHandleDots2 } from 'react-icons/rx';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableMedicationInput = ({ id, index, med, onChange, onDelete, dragDisabled, disableDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex flex-wrap gap-2 items-start">
      {!dragDisabled && (
        <div {...attributes} {...listeners} className="cursor-grab text-[#7047d1] mt-2">
          <RxDragHandleDots2 size={20} />
        </div>
      )}
      {['name', 'dosage', 'frequency', 'duration', 'notes'].map((field) => (
        <input
          key={field}
          className="flex-1 min-w-[120px] p-2 rounded bg-gray-100 placeholder-[#69578F]"
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          value={med[field]}
          onChange={(e) => onChange(e.target.value, index, field)}
        />
      ))}
      {!disableDelete && (
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="text-red-500 mt-1"
          title="Delete"
        >
          <MdDeleteOutline size={22} />
        </button>
      )}
    </div>
  );
};

const MedicationSection = ({ formData, setFormData, isConfigMode }) => {
  const handleChange = (val, index, field) => {
    const updated = [...formData.medication];
    updated[index] = { ...updated[index], [field]: val };

    const isLast = index === updated.length - 1;
    const hasText = val.trim() !== '';

    if (isLast && hasText) {
      updated.push({
        id: crypto.randomUUID(),
        name: '', dosage: '', frequency: '', duration: '', notes: ''
      });
    }

    setFormData({ ...formData, medication: updated });
  };

  const handleDelete = (index) => {
    if (formData.medication.length === 1) return;
    const updated = [...formData.medication];
    updated.splice(index, 1);
    setFormData({ ...formData, medication: updated });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const items = formData.medication;
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const reordered = arrayMove(items, oldIndex, newIndex);
    setFormData({ ...formData, medication: reordered });
  };

  return (
    <DraggableSection key="medication" id="medication" enabled={isConfigMode}>
      <div>
        <div className="font-semibold mb-4 text-[22px]">Medication / Prescription</div>

        <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
          <SortableContext
            items={formData.medication.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {formData.medication.map((med, index) => (
                <SortableMedicationInput
                  key={med.id}
                  id={med.id}
                  index={index}
                  med={med}
                  onChange={handleChange}
                  onDelete={handleDelete}
                  dragDisabled={isConfigMode}
                  disableDelete={formData.medication.length === 1}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </DraggableSection>
  );
};

export default MedicationSection;
*/}
import React, { useEffect } from 'react';
import DraggableSection from '../DraggableSection';
import { MdDeleteOutline } from 'react-icons/md';
import { RxDragHandleDots2 } from 'react-icons/rx';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
const SortableMedicationInput = ({ id, index, med, onChange, onDelete, dragDisabled, disableDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex flex-wrap gap-2 items-start">
      {!dragDisabled && (
        <div {...attributes} {...listeners} className="cursor-grab text-[#7047d1] mt-2">
          <RxDragHandleDots2 size={20} />
        </div>
      )}
      {['name', 'dosage', 'frequency', 'duration', 'notes'].map((field) => (
        <input
          key={field}
          className="flex-1 min-w-[120px] p-2 rounded bg-gray-100"
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          value={med[field]}
          onChange={(e) => onChange(id, field, e.target.value)}
        />
      ))}
      {!disableDelete && (
        <button
          type="button"
          onClick={() => onDelete(id)}
          className="text-red-600 mt-2 ml-1"
          title="Delete"
        >
          <MdDeleteOutline size={20} />
        </button>
      )}
    </div>
  );
};

const MedicationSection = ({ formData, setFormData, isConfigMode }) => {
  useEffect(() => {
    if (formData.medication.length === 0) {
      setFormData({
        ...formData,
        medication: [
          {
            id: crypto.randomUUID(),
            name: '',
            dosage: '',
            frequency: '',
            duration: '',
            notes: '',
          },
        ],
      });
    }
  }, []);

  const handleChange = (id, field, value) => {
    const updated = formData.medication.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );

    const targetIndex = updated.findIndex((item) => item.id === id);
    const isLast = targetIndex === updated.length - 1;

    const hasAnyText = Object.entries(updated[targetIndex]).some(
      ([key, val]) => key !== 'id' && val.trim() !== ''
    );

    if (isLast && hasAnyText) {
      updated.push({
        id: crypto.randomUUID(),
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        notes: '',
      });
    }

    setFormData({ ...formData, medication: updated });
  };

  const handleDelete = (idToDelete) => {
    if (formData.medication.length === 1) return; // Prevent deleting last row
    const updated = formData.medication.filter((item) => item.id !== idToDelete);
    setFormData({ ...formData, medication: updated });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = formData.medication.findIndex((item) => item.id === active.id);
    const newIndex = formData.medication.findIndex((item) => item.id === over.id);

    const reordered = arrayMove(formData.medication, oldIndex, newIndex);
    setFormData({ ...formData, medication: reordered });
  };

  return (
    <DraggableSection key="medication" id="medication" enabled={isConfigMode}>
      <div>
        <div className="font-semibold mb-4 text-[22px]">Medication / Prescription</div>

        <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
          <SortableContext
            items={formData.medication.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {formData.medication.map((med, index) => (
                <SortableMedicationInput
                  key={med.id}
                  id={med.id}
                  index={index}
                  med={med}
                  onChange={handleChange}
                  onDelete={handleDelete}
                  dragDisabled={isConfigMode}
                  disableDelete={formData.medication.length === 1}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </DraggableSection>
  );
};

export default MedicationSection;

