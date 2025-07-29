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

const SortableInvestigationInput = ({ id, index, test, note, onChange, onDelete, dragDisabled, hideDelete }) => {
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
          value={test.value}
          onChange={(e) => onChange('tests', e.target.value, index)}
          placeholder="Enter Test"
          className="w-full border p-2 rounded bg-gray-100"
        />
      </div>
      <div className="flex-1">

        <input
          value={note.value}
          onChange={(e) => onChange('testNotes', e.target.value, index)}
          placeholder="Note for Lab"
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

const InvestigationsSection = ({ formData, setFormData, isConfigMode }) => {
  // Start with one row if empty
  useEffect(() => {
    if (formData.tests.length === 0) {
      setFormData({
        ...formData,
        tests: [{ id: crypto.randomUUID(), value: '' }],
        testNotes: [{ id: crypto.randomUUID(), value: '' }],
      });
    }
  }, []);

  const handleChange = (type, value, index) => {
    const updated = [...formData[type]];
    updated[index] = { ...updated[index], value };

    const otherType = type === 'tests' ? 'testNotes' : 'tests';
    const otherValue = formData[otherType][index]?.value || '';
    const isLast = index === formData.tests.length - 1;
    const isAnyFilled = value.trim() !== '' || otherValue.trim() !== '';

    if (isLast && isAnyFilled) {
      setFormData({
        ...formData,
        tests: [...formData.tests, { id: crypto.randomUUID(), value: '' }],
        testNotes: [...formData.testNotes, { id: crypto.randomUUID(), value: '' }],
      });
    } else {
      setFormData({ ...formData, [type]: updated });
    }
  };

  const handleDelete = (index) => {
    const updatedTests = [...formData.tests];
    const updatedNotes = [...formData.testNotes];

    updatedTests.splice(index, 1);
    updatedNotes.splice(index, 1);

    setFormData({
      ...formData,
      tests: updatedTests,
      testNotes: updatedNotes,
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = formData.tests.findIndex((t) => t.id === active.id);
    const newIndex = formData.tests.findIndex((t) => t.id === over.id);

    const newTests = arrayMove(formData.tests, oldIndex, newIndex);
    const newNotes = arrayMove(formData.testNotes, oldIndex, newIndex);

    setFormData({
      ...formData,
      tests: newTests,
      testNotes: newNotes,
    });
  };

  return (
    <DraggableSection key="investigations" id="investigations" enabled={isConfigMode}>
      <h2 className="font-semibold mb-4 text-[22px]">Investigations & Lab Advice</h2>

      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <SortableContext
          items={formData.tests.map((test) => test.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-4">
            {formData.tests.map((test, i) => (
              <SortableInvestigationInput
                key={test.id}
                id={test.id}
                index={i}
                test={formData.tests[i]}
                note={formData.testNotes[i] || { id: '', value: '' }}
                onChange={handleChange}
                onDelete={handleDelete}
                dragDisabled={isConfigMode}
                hideDelete={formData.tests.length === 1 && i === 0}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </DraggableSection>
  );
};

export default InvestigationsSection;
