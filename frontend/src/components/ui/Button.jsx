import React from "react";

const Button = ({ children, className = "", onClick, type = "button", ...props }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-[#7047d1] text-white px-4 py-2 rounded-2xl ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
