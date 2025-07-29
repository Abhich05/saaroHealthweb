// src/components/consultation/SortableItem.js

// src/components/consultation/SortableItem.js

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RxDragHandleDots2 } from 'react-icons/rx';

export function SortableItem({ id, disabled, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.9 : 1,
    backgroundColor: isDragging ? 'white' : 'transparent',
    boxShadow: isDragging
      ? '0 4px 20px rgba(0, 0, 0, 0.1)'
      : '0 0 0 transparent',
    width: '100%',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl p-2 mb-4 bg-white"
    >
      <div className="flex gap-2 items-start">
        {!disabled && (
          <div {...attributes} {...listeners} className="cursor-grab pt-1 text-[#7047d1]">
            <RxDragHandleDots2 size={20} />
          </div>
        )}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

