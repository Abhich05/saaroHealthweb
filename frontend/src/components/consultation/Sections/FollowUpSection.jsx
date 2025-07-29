import React from 'react';
import DraggableSection from '../DraggableSection';

const FollowUpSection = ({ formData, setFormData, isConfigMode }) => {
  return (
    <DraggableSection key="followUp" id="followUp" enabled={isConfigMode}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formData.followUp.map((val, i) => (
          <div key={i} className="flex flex-col">
            <label className="mb-1 font-semibold mb-4 text-[22px]">Follow-up after</label>
            <input
              type="date"
              value={val}
              placeholder="Select Date"
              onChange={(e) => {
                const updated = [...formData.followUp];
                updated[i] = e.target.value;
                setFormData({ ...formData, followUp: updated });
              }}
              className="border p-2 rounded bg-gray-100 placeholder-[#69578F]"
            />
          </div>
        ))}
      </div>
    </DraggableSection>
  );
};

export default FollowUpSection;
