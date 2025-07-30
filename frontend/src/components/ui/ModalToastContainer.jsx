import React, { useState, useCallback } from 'react';
import ModalToast from './ModalToast';

const ModalToastContainer = ({ containerRef }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'error', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Expose addToast method to parent component
  React.useEffect(() => {
    if (containerRef && containerRef.current) {
      containerRef.current.showModalToast = addToast;
    }
    return () => {
      if (containerRef && containerRef.current) {
        delete containerRef.current.showModalToast;
      }
    };
  }, [addToast, containerRef]);

  return (
    <div className="absolute top-4 right-4 z-[60] space-y-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ transform: `translateY(${index * 80}px)` }}
          className="transition-transform duration-300"
        >
          <ModalToast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default ModalToastContainer; 