import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header2 = () => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center relative z-1 justify-between px-10 py-4 shadow-md bg-white">
      <div className="text-2xl font-bold">
        <img
          src="/saaro-health3.png"
          alt="Saaro Health Logo"
          className="h-6 w-auto object-contain"
        />
      </div>
      <nav className="flex items-center gap-6 text-sm">
        <a href="#" className="text-black hover:underline">About</a>
        <a href="#" className="text-black hover:underline">Features</a>
        <a href="#" className="text-black hover:underline">Pricing</a>
        <a href="#" className="text-black hover:underline">Contact</a>
        <button
          className="bg-[#7047d1] text-white px-4 py-1.5 rounded-md text-sm"
          onClick={() => navigate('/login')}
        >
          Login
        </button>
      </nav>
    </header>
  );
};

export default Header2;
