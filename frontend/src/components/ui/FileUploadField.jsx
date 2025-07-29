// components/ui/FileUploadField.jsx
import React from "react";

const FileUploadField = ({ label, file, onChange, onRemove, error }) => {
  return (
    <div className="mb-4">
      <p className="font-medium mb-2">{label}</p>

      {!file ? (
        <label className="inline-block px-4 py-2 bg-gray-200 rounded-full cursor-pointer text-sm">
          Upload
          <input
            type="file"
            accept=".pdf,.jpg,.png"
            className="hidden"
            onChange={onChange}
          />
        </label>
      ) : (
        <div className="flex items-center max-w-[150px] justify-between bg-gray-200 px-4 py-2 rounded-full text-sm text-gray-700">
          <span className="max-w-[80px] truncate" title={file.name}>{file.name}</span>
          <button
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 ml-4 text-lg"
            title="Remove file"
          >
            &times;
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, JPG, PNG</p>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default FileUploadField;
