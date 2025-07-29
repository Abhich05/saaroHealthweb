{/*import React from "react";
import { FaTrash } from "react-icons/fa";
import DraggableSection from "../DraggableSection";
import { RxDragHandleDots2 } from "react-icons/rx";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableHistoryInput = ({ id, index, value, onChange, onDelete, label, disableDelete, dragDisabled }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex gap-2 mb-2">
      {!dragDisabled && (
        <div {...attributes} {...listeners} className="cursor-grab text-[#7047d1] mt-2">
          <RxDragHandleDots2 size={20} />
        </div>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${label.toLowerCase()}`}
        className="border p-2 rounded bg-gray-100 placeholder-[#69578F] flex-1"
      />
      {!disableDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="text-red-600 mt-1"
        >
          <FaTrash />
        </button>
      )}
    </div>
  );
};

const HistorySection = ({ formData, setFormData, isConfigMode }) => {
  const fields = [
    { label: "Past History", key: "pastHistory" },
    { label: "Surgical History", key: "surgicalHistory" },
    { label: "Drug Allergy", key: "drugAllergy" },
  ];

  const handleChange = (key, index, value) => {
    const updated = [...formData[key]];
    updated[index].value = value;

    if (index === updated.length - 1 && value.trim() !== "") {
      updated.push({ id: crypto.randomUUID(), value: "" });
    }

    setFormData({ ...formData, [key]: updated });
  };

  const handleDelete = (key, index) => {
    const updated = [...formData[key]];
    if (updated.length > 1) {
      updated.splice(index, 1);
      setFormData({ ...formData, [key]: updated });
    }
  };

  const handleDragEnd = (event, key) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const items = formData[key];
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const reordered = arrayMove(items, oldIndex, newIndex);
    setFormData({ ...formData, [key]: reordered });
  };

  return (
    <DraggableSection id="history" enabled={isConfigMode}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fields.map(({ label, key }) => (
          <div key={key}>
            <div className="font-semibold mb-2 text-[20px]">{label}</div>
            <DndContext onDragEnd={(e) => handleDragEnd(e, key)} collisionDetection={closestCenter}>
              <SortableContext items={formData[key].map((item) => item.id)} strategy={verticalListSortingStrategy}>
                {formData[key].map((item, i) => (
                  <SortableHistoryInput
                    key={item.id}
                    id={item.id}
                    index={i}
                    value={item.value}
                    onChange={(val) => handleChange(key, i, val)}
                    onDelete={() => handleDelete(key, i)}
                    label={label}
                    disableDelete={formData[key].length === 1}
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

export default HistorySection;*/}

import React, { useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import DraggableSection from "../DraggableSection";
import { RxDragHandleDots2 } from "react-icons/rx";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { MdDeleteOutline } from 'react-icons/md';
import { CSS } from "@dnd-kit/utilities";

const SortableHistoryInput = ({ id, index, value, onChange, onDelete, label, dragDisabled, hideDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex gap-2 mb-2">
      {!dragDisabled && (
        <div {...attributes} {...listeners} className="cursor-grab text-[#7047d1] mt-2">
          <RxDragHandleDots2 size={20} />
        </div>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${label.toLowerCase()}`}
        className="border p-2 rounded bg-gray-100 flex-1"
      />
      {!hideDelete && (
        <button type="button" onClick={onDelete} className="text-red-600 mt-1 ml-1">
          <MdDeleteOutline size={20} />
        </button>
      )}
    </div>
  );
};

const HistorySection = ({ formData, setFormData, isConfigMode }) => {
  const fields = [
    { label: "Past History", key: "pastHistory" },
    { label: "Surgical History", key: "surgicalHistory" },
    { label: "Drug Allergy", key: "drugAllergy" },
  ];

  useEffect(() => {
    let needsUpdate = false;
    const updatedForm = { ...formData };

    fields.forEach(({ key }) => {
      if (!updatedForm[key] || updatedForm[key].length === 0) {
        updatedForm[key] = [{ id: crypto.randomUUID(), value: "" }];
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      setFormData(updatedForm);
    }
  }, []);

  const handleChange = (key, index, value) => {
    const updated = [...formData[key]];
    updated[index].value = value;

    const isLast = index === updated.length - 1;
    if (isLast && value.trim() !== "") {
      updated.push({ id: crypto.randomUUID(), value: "" });
    }

    setFormData({ ...formData, [key]: updated });
  };

  const handleDelete = (key, index) => {
    const updated = [...formData[key]];
    updated.splice(index, 1);
    setFormData({ ...formData, [key]: updated });
  };

  const handleDragEnd = (event, key) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const items = formData[key];
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const reordered = arrayMove(items, oldIndex, newIndex);
    setFormData({ ...formData, [key]: reordered });
  };

  return (
    <DraggableSection id="history" enabled={isConfigMode}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fields.map(({ label, key }) => {
          const entries = formData[key];

          return (
            <div key={key}>
              <div className="font-semibold text-[20px] mb-2">{label}</div>

              {entries && entries.length > 0 && (
                <DndContext onDragEnd={(e) => handleDragEnd(e, key)} collisionDetection={closestCenter}>
                  <SortableContext
                    items={entries.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {entries.map((item, i) => (
                      <SortableHistoryInput
                        key={item.id}
                        id={item.id}
                        index={i}
                        value={item.value}
                        onChange={(val) => handleChange(key, i, val)}
                        onDelete={() => handleDelete(key, i)}
                        label={label}
                        dragDisabled={isConfigMode}
                        hideDelete={entries.length === 1 && i === 0}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          );
        })}
      </div>
    </DraggableSection>
  );
};

export default HistorySection;
