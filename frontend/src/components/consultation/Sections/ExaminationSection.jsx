{/*import React from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import SortableComplaintInput from "../SortableComplaintInput";
import DraggableSection from "../DraggableSection";

const ExaminationSection = ({ formData, setFormData, isConfigMode }) => {
  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = formData.physicalExamination.findIndex((c) => c.id === active.id);
    const newIndex = formData.physicalExamination.findIndex((c) => c.id === over.id);
    const newList = arrayMove(formData.physicalExamination, oldIndex, newIndex);
    setFormData({ ...formData, physicalExamination: newList });
  };

  const handleChange = (val, i) => {
    const updated = [...formData.physicalExamination];
    updated[i] = { ...updated[i], text: val };

    if (i === updated.length - 1 && val.trim() !== "") {
      updated.push({ id: crypto.randomUUID(), text: "" });
    }

    setFormData({ ...formData, physicalExamination: updated });
  };

  const handleDelete = (idToDelete) => {
    if (formData.physicalExamination.length === 1) return;
    const updated = formData.physicalExamination.filter((item) => item.id !== idToDelete);
    setFormData({ ...formData, physicalExamination: updated });
  };

  return (
    <DraggableSection id="examination" enabled={isConfigMode}>
      <div>
        <div className="font-semibold mb-4 text-[22px]">Physical Examination</div>

        {!isConfigMode ? (
          // 👇 Enable inner drag when config is off
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
                  enabled={true} // ✅ show drag icon
                  onChange={(val) => handleChange(val, i)}
                  onDelete={handleDelete}
                  disableDelete={formData.physicalExamination.length === 1}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          // 👇 No inner drag during config mode
          <>
            {formData.physicalExamination.map((exam, i) => (
              <SortableComplaintInput
                key={exam.id}
                id={exam.id}
                index={i}
                value={exam.text}
                label="Observation"
                enabled={false} // ❌ hide drag icon
                onChange={(val) => handleChange(val, i)}
                onDelete={handleDelete}
                disableDelete={formData.physicalExamination.length === 1}
              />
            ))}
          </>
        )}
      </div>
    </DraggableSection>
  );
};

export default ExaminationSection;*/}
import React from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import SortableComplaintInput from "../SortableComplaintInput";
import DraggableSection from "../DraggableSection";

const ExaminationSection = ({ formData, setFormData, isConfigMode }) => {
  // Ensure one default row exists
  React.useEffect(() => {
    if (formData.physicalExamination.length === 0) {
      setFormData({
        ...formData,
        physicalExamination: [{ id: crypto.randomUUID(), text: "" }],
      });
    }
  }, []);

  const handleChange = (val, id) => {
    const updated = formData.physicalExamination.map((item) =>
      item.id === id ? { ...item, text: val } : item
    );

    const targetIndex = formData.physicalExamination.findIndex((item) => item.id === id);
    const isLast = targetIndex === formData.physicalExamination.length - 1;

    if (isLast && val.trim() !== "") {
      updated.push({ id: crypto.randomUUID(), text: "" });
    }

    setFormData({ ...formData, physicalExamination: updated });
  };

  const handleDelete = (idToDelete) => {
    const updated = formData.physicalExamination.filter((item) => item.id !== idToDelete);
    setFormData({ ...formData, physicalExamination: updated });
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = formData.physicalExamination.findIndex((item) => item.id === active.id);
    const newIndex = formData.physicalExamination.findIndex((item) => item.id === over.id);
    const newList = arrayMove(formData.physicalExamination, oldIndex, newIndex);
    setFormData({ ...formData, physicalExamination: newList });
  };

  return (
    <DraggableSection id="examination" enabled={isConfigMode}>
      <div>
        <h2 className="font-semibold mb-4 text-[22px]">Physical Examination</h2>

        {!isConfigMode ? (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={formData.physicalExamination.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {formData.physicalExamination.map((item, i) => (
                <SortableComplaintInput
                  key={item.id}
                  id={item.id}
                  index={i}
                  value={item.text}
                  label="Observation"
                  enabled={true}
                  onChange={(val) => handleChange(val, item.id)}
                  onDelete={handleDelete}
                  disableDelete={i === 0 && formData.physicalExamination.length === 1} // hide delete for first initial input
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <>
            {formData.physicalExamination.map((item, i) => (
              <SortableComplaintInput
                key={item.id}
                id={item.id}
                index={i}
                value={item.text}
                label="Observation"
                enabled={false}
                onChange={(val) => handleChange(val, item.id)}
                onDelete={handleDelete}
                disableDelete={i === 0 && formData.physicalExamination.length === 1}
              />
            ))}
          </>
        )}
      </div>
    </DraggableSection>
  );
};

export default ExaminationSection;




