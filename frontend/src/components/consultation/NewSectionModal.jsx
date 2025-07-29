import React from 'react';
import Modal from '../ui/Modal';

const NewSectionModal = ({
  isOpen,
  onClose,
  newSectionData,
  setNewSectionData,
  handleAddCustomSection,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Section">
      <div className="space-y-2">
        <input
          type="text"
          className="w-full border p-2 rounded"
          placeholder="Section Heading"
          value={newSectionData.heading}
          onChange={(e) =>
            setNewSectionData({ ...newSectionData, heading: e.target.value })
          }
        />
        <input
          type="text"
          className="w-full border p-2 rounded"
          placeholder="Subheading Label"
          value={newSectionData.label}
          onChange={(e) =>
            setNewSectionData({ ...newSectionData, label: e.target.value })
          }
        />
        <select
          className="w-full border p-2 rounded"
          value={newSectionData.type}
          onChange={(e) =>
            setNewSectionData({ ...newSectionData, type: e.target.value })
          }
        >
          <option value="">Select Input Type</option>
          <option value="input">Input</option>
          <option value="textarea">Textarea</option>
          <option value="date">Date</option>
          <option value="dropdown">Dropdown</option>
          <option value="checkbox">Checkbox</option>
        </select>

        {newSectionData.type === 'dropdown' && (
          <input
            type="text"
            className="w-full border p-2 rounded"
            placeholder="Comma-separated options"
            value={newSectionData.options}
            onChange={(e) =>
              setNewSectionData({
                ...newSectionData,
                options: e.target.value,
              })
            }
          />
        )}

        <div className="flex justify-end gap-2">
          <button className="px-4 py-1 bg-gray-300 rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-1 bg-[#7047d1] text-white rounded"
            onClick={handleAddCustomSection}
          >
            Add
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NewSectionModal;
