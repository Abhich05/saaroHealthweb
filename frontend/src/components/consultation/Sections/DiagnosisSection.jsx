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

const SortableDiagnosisInput = ({ id, index, value, onChange, onDelete, dragDisabled, hideDelete, label }) => {
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
      <div className="flex-1">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value, index)}
          placeholder={`Enter ${label}`}
          className="w-full border p-2 rounded bg-gray-100"
        />
      </div>
      {!hideDelete && (
        <button
          className="mt-2 ml-1 text-red-600"
          onClick={() => onDelete(index)}
          title="Delete row"
        >
          <MdDeleteOutline size={20}/>
        </button>
      )}
    </div>
  );
};

const DiagnosisSection = ({ formData, setFormData, isConfigMode }) => {
  // Start with one row if empty
  useEffect(() => {
    if (formData.diagnosis.provisional.length === 0) {
      setFormData({
        ...formData,
        diagnosis: {
          ...formData.diagnosis,
          provisional: [{ id: crypto.randomUUID(), value: '' }],
          final: [{ id: crypto.randomUUID(), value: '' }]
        }
      });
    }
  }, []);

  const handleChange = (type, value, index) => {
    const updated = [...formData.diagnosis[type]];
    updated[index] = { ...updated[index], value };

    const isLast = index === formData.diagnosis[type].length - 1;
    if (isLast && value.trim() !== '') {
      setFormData({
        ...formData,
        diagnosis: {
          ...formData.diagnosis,
          [type]: [...formData.diagnosis[type], { id: crypto.randomUUID(), value: '' }]
        }
      });
    } else {
      setFormData({
        ...formData,
        diagnosis: {
          ...formData.diagnosis,
          [type]: updated
        }
      });
    }
  };

  const handleDelete = (type, index) => {
    const updated = [...formData.diagnosis[type]];
    updated.splice(index, 1);
    
    if (updated.length === 0) {
      updated.push({ id: crypto.randomUUID(), value: '' });
    }

    setFormData({
      ...formData,
      diagnosis: {
        ...formData.diagnosis,
        [type]: updated
      }
    });
  };

  const handleDragEnd = (event, type) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = formData.diagnosis[type].findIndex((item) => item.id === active.id);
      const newIndex = formData.diagnosis[type].findIndex((item) => item.id === over.id);
      const newOrder = arrayMove(formData.diagnosis[type], oldIndex, newIndex);
      setFormData({
        ...formData,
        diagnosis: {
          ...formData.diagnosis,
          [type]: newOrder
        }
      });
    }
  };

  return (
    <DraggableSection id="diagnosis" enabled={isConfigMode}>
      <div className="space-y-6">
        {/* Provisional Diagnosis */}
        <div>
          <h2 className="font-semibold mb-4 text-[22px]">Provisional Diagnosis</h2>
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(event, 'provisional')}
          >
            <SortableContext
              items={formData.diagnosis.provisional.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {formData.diagnosis.provisional.map((diagnosis, index) => (
                <SortableDiagnosisInput
                  key={diagnosis.id}
                  id={diagnosis.id}
                  index={index}
                  value={diagnosis.value}
                  onChange={(value) => handleChange('provisional', value, index)}
                  onDelete={(index) => handleDelete('provisional', index)}
                  dragDisabled={isConfigMode}
                  hideDelete={isConfigMode}
                  label="Provisional Diagnosis"
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {/* Final Diagnosis */}
        <div>
          <h2 className="font-semibold mb-4 text-[22px]">Final Diagnosis</h2>
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(event, 'final')}
          >
            <SortableContext
              items={formData.diagnosis.final.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {formData.diagnosis.final.map((diagnosis, index) => (
                <SortableDiagnosisInput
                  key={diagnosis.id}
                  id={diagnosis.id}
                  index={index}
                  value={diagnosis.value}
                  onChange={(value) => handleChange('final', value, index)}
                  onDelete={(index) => handleDelete('final', index)}
                  dragDisabled={isConfigMode}
                  hideDelete={isConfigMode}
                  label="Final Diagnosis"
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </DraggableSection>
  );
};

export default DiagnosisSection; 