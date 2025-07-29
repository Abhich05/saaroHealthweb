import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RxDragHandleDots2 } from 'react-icons/rx';

const DraggableSection = ({ id, children, enabled }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white rounded shadow-none ${enabled ? 'border-2 border-dashed border-[#7047d1]' : ''} p-4`}
    >
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

export default DraggableSection;
