import React from "react";

const Button = ({ 
  children, 
  className = "", 
  onClick, 
  type = "button", 
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  ...props 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300';
      case 'outline':
        return 'bg-transparent text-purple-600 border-2 border-purple-600 hover:bg-purple-50';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700';
      case 'success':
        return 'bg-green-600 text-white hover:bg-green-700';
      case 'warning':
        return 'bg-yellow-500 text-white hover:bg-yellow-600';
      default:
        return 'bg-[#7047d1] text-white hover:bg-[#5a3bb8]';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      case 'xl':
        return 'px-8 py-4 text-xl';
      default:
        return 'px-4 py-2';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        rounded-2xl font-medium transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
