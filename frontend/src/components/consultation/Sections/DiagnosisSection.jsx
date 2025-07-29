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

const SortableDiagnosisInput = ({ id, index, type, value, onChange, onDelete, disabled, dragDisabled }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2 mt-2">
      {!dragDisabled && (
        <div {...attributes} {...listeners} className="cursor-grab text-[#7047d1] mt-6">
          <RxDragHandleDots2 size={20} />
        </div>
      )}
      <div className="flex-1">
        <label className="mb-1 font-medium block">
          {type} {index + 1}
        </label>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${type} diagnosis`}
          className="w-full border p-2 rounded bg-gray-100 placeholder-[#69578F]"
        />
      </div>
      {!disabled && (
        <button
          type="button"
          onClick={onDelete}
          className="text-red-500 mt-6"
          title="Delete"
        >
          <MdDeleteOutline size={22} />
        </button>
      )}
    </div>
  );
};

const DiagnosisSection = ({ formData, setFormData, isConfigMode }) => {
  const handleChange = (type, value, index) => {
    const updated = [...formData.diagnosis[type]];
    updated[index].value = value;

    const isLast = index === updated.length - 1;
    const hasText = value.trim() !== '';

    if (isLast && hasText) {
      updated.push({ id: crypto.randomUUID(), value: '' });
    }

    setFormData({
      ...formData,
      diagnosis: {
        ...formData.diagnosis,
        [type]: updated,
      },
    });
  };

  const handleDelete = (type, index) => {
    const updated = [...formData.diagnosis[type]];
    if (updated.length === 1) return;
    updated.splice(index, 1);

    setFormData({
      ...formData,
      diagnosis: {
        ...formData.diagnosis,
        [type]: updated,
      },
    });
  };

  const handleDragEnd = (event, type) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const items = formData.diagnosis[type];
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const reordered = arrayMove(items, oldIndex, newIndex);
    setFormData({
      ...formData,
      diagnosis: {
        ...formData.diagnosis,
        [type]: reordered,
      },
    });
  };

  return (
    <DraggableSection key="diagnosis" id="diagnosis" enabled={isConfigMode}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["provisional", "final"].map((type) => (
          <div key={type}>
            <div className="font-semibold mb-4 text-[22px]">
              {type[0].toUpperCase() + type.slice(1)} Diagnosis
            </div>

            <DndContext onDragEnd={(e) => handleDragEnd(e, type)} collisionDetection={closestCenter}>
              <SortableContext
                items={formData.diagnosis[type].map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {formData.diagnosis[type].map((item, i) => (
                  <SortableDiagnosisInput
                    key={item.id}
                    id={item.id}
                    index={i}
                    type={type}
                    value={item.value}
                    onChange={(val) => handleChange(type, val, i)}
                    onDelete={() => handleDelete(type, i)}
                    disabled={formData.diagnosis[type].length === 1}
                    dragDisabled={isConfigMode}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        ))}
      </div>
    </DraggableSection>
  );
};

export default DiagnosisSection;
*/}import React, { useEffect } from 'react';
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

const SortableDiagnosisInput = ({ id, index, type, value, onChange, onDelete, dragDisabled, hideDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2 mt-2">
      {!dragDisabled && (
        <div {...attributes} {...listeners} className="cursor-grab text-[#7047d1] mt-2">
          <RxDragHandleDots2 size={20} />
        </div>
      )}
      <div className="flex-1">
        <input
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          placeholder={`Enter ${type} diagnosis`}
          className="w-full border p-2 rounded bg-gray-100"
        />
      </div>
      {!hideDelete && (
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

const DiagnosisSection = ({ formData, setFormData, isConfigMode }) => {
  // Ensure one row if empty
  useEffect(() => {
    const updated = { ...formData.diagnosis };
    let needsUpdate = false;

    ['provisional', 'final'].forEach((type) => {
      if (updated[type].length === 0) {
        updated[type] = [{ id: crypto.randomUUID(), value: '' }];
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      setFormData({ ...formData, diagnosis: updated });
    }
  }, []);

  const handleChange = (type, id, value) => {
    const updated = formData.diagnosis[type].map((item) =>
      item.id === id ? { ...item, value } : item
    );

    const targetIndex = updated.findIndex((item) => item.id === id);
    const isLast = targetIndex === updated.length - 1;

    if (isLast && value.trim() !== '') {
      updated.push({ id: crypto.randomUUID(), value: '' });
    }

    setFormData({
      ...formData,
      diagnosis: {
        ...formData.diagnosis,
        [type]: updated,
      },
    });
  };

  const handleDelete = (type, idToDelete) => {
    const updated = formData.diagnosis[type].filter((item) => item.id !== idToDelete);
    setFormData({
      ...formData,
      diagnosis: {
        ...formData.diagnosis,
        [type]: updated,
      },
    });
  };

  const handleDragEnd = (event, type) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const items = formData.diagnosis[type];
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const reordered = arrayMove(items, oldIndex, newIndex);
    setFormData({
      ...formData,
      diagnosis: {
        ...formData.diagnosis,
        [type]: reordered,
      },
    });
  };

  return (
    <DraggableSection key="diagnosis" id="diagnosis" enabled={isConfigMode}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['provisional', 'final'].map((type) => (
          <div key={type}>
            <div className="font-semibold mb-4 text-[22px]">
              {type[0].toUpperCase() + type.slice(1)} Diagnosis
            </div>

            <DndContext onDragEnd={(e) => handleDragEnd(e, type)} collisionDetection={closestCenter}>
              <SortableContext
                items={formData.diagnosis[type].map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {formData.diagnosis[type].map((item, i) => (
                  <SortableDiagnosisInput
                    key={item.id}
                    id={item.id}
                    index={i}
                    type={type}
                    value={item.value}
                    onChange={(id, val) => handleChange(type, id, val)}
                    onDelete={(id) => handleDelete(type, id)}
                    dragDisabled={isConfigMode}
                    hideDelete={formData.diagnosis[type].length === 1 && i === 0}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        ))}
      </div>
    </DraggableSection>
  );
};

export default DiagnosisSection;

