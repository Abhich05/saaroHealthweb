import React from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar: make sure it has full height */}
      <div className="h-auto">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-4 bg-transparent overflow-y-auto flex items-center justify-center">
          <div className="text-center bg-white rounded-2xl shadow-xl px-12 py-16 max-w-lg w-full border border-[#7042D9]">
            <img src="/saaro-health2.png" alt="Saaro Health Logo" className="mx-auto mb-6 w-40 h-40 object-contain" />
            <h1 className="text-7xl font-extrabold text-[#7042D9] mb-4 tracking-tight drop-shadow">404</h1>
            <h2 className="text-2xl font-semibold mb-2 text-[#322e45]">Page Not Found</h2>
            <p className="text-gray-600 mb-6">
              Sorry, the page you are looking for doesn’t exist or has been moved.
            </p>
            <Link
              to="/"
              className="inline-flex items-center bg-[#7042D9] text-white px-5 py-2.5 rounded-lg font-medium shadow hover:bg-[#6D28D9] transition"
            >
              <FiArrowLeft className="mr-2" /> Back to Home
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotFoundPage;
