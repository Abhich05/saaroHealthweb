// components/ui/SearchBar.jsx
import React from 'react';
import { FiSearch } from 'react-icons/fi';

const SearchBar = ({ searchTerm, setSearchTerm, placeholder = "Search...", className = "" }) => {
  return (
    <div className={`relative w-full max-w mb-6 ${className}`}>
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={searchTerm}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 border rounded-xl bg-[#c5c7c9] bg-opacity-20 text-gray-700 focus:outline-none text-sm"
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
