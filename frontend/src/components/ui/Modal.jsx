import React from 'react';
import Button from './Button'

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full relative">
        <button onClick={onClose} className="absolute text-[#000000] bg-transparent top-2 right-6 text-2xl">&times;</button>
        {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default Modal;
