import React from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'default' }) => {
  if (!isOpen) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'lg':
        return 'max-w-4xl';
      case 'xl':
        return 'max-w-6xl';
      case 'sm':
        return 'max-w-md';
      default:
        return 'max-w-xl';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-[#fefefe] rounded-xl shadow-xl w-full ${getSizeClasses()} p-6 relative max-h-[90vh] overflow-y-auto`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-black"
        >
          &times;
        </button>

        {title && (
          <h2 className="text-xl font-semibold mb-6 text-[#322e45]">
            {title}
          </h2>
        )}

        {children}
      </div>
    </div>
  );
};

export default Modal;
