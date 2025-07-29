import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RxDragHandleDots2} from 'react-icons/rx';
import { MdDeleteOutline } from 'react-icons/md';

const SortableComplaintInput = ({ id, index, value, onChange, label = 'Complaint', enabled, onDelete, disableDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: '1rem',
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2">
      {/* Drag Handle */}
      {enabled && (
        <div {...attributes} {...listeners} className="cursor-grab text-[#7047d1] mt-2">
          <RxDragHandleDots2 size={20} />
        </div>
      )}

      <div className="flex-1">

        <div className="flex gap-2">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${label}`}
            className="w-full border p-2 rounded bg-gray-100"
          />
          {/* Delete icon */}
          {!disableDelete && (
            <button
              type="button"
              onClick={() => onDelete?.(id)}
              className="text-red-600 mt-1 ml-1"
              title="Delete"
            >
              <MdDeleteOutline size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SortableComplaintInput;
