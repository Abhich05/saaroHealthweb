import React from 'react';
import DraggableSection from '../DraggableSection';

const AdviceSection = ({ formData, setFormData, isConfigMode }) => {
  return (
    <DraggableSection key="advice" id="advice" enabled={isConfigMode}>
      <div className="flex flex-col">
        <label className="mb-1 font-semibold mb-4 text-[22px]">Advice</label>
        <textarea
          value={formData.advice}
          onChange={(e) => setFormData({ ...formData, advice: e.target.value })}
          placeholder="Enter advice"
          className="w-full border p-2 rounded bg-gray-100 placeholder-[#69578F]"
          rows={6}
        />
      </div>
    </DraggableSection>
  );
};

export default AdviceSection;
