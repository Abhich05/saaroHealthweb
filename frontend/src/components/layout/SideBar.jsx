import { useState, useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
import { FiSidebar } from "react-icons/fi";
import { motion } from "framer-motion";
import {
  PiCaretDown,
  PiCaretUp,
} from "react-icons/pi";
import { DoctorNameContext, UserContext } from "../../App";

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(() =>
    location.pathname.startsWith("/template-library") ||
    location.pathname.startsWith("/medicine-library") ||
    location.pathname.startsWith("/document-library")
  );
  const doctorName = useContext(DoctorNameContext);
  const user = useContext(UserContext);

  // Check if it's a user login
  const isUserLogin = localStorage.getItem('isUserLogin') === 'true';
  const userPermissions = isUserLogin ? JSON.parse(localStorage.getItem('userPermissions') || '{}') : null;

  // Filter navigation based on permissions
  const getFilteredNavLinks = () => {
    const allNavLinks = [
      { name: "Dashboard", icon: <img src="/dashboard.svg" alt="Dashboard" style={{ width: "20px", height: "20px" }} />, to: "/", permission: "dashboard" },
      { name: "Invoice", icon: <img src="/invoice.svg" alt="Invoice" style={{ width: "20px", height: "20px" }} />, to: "/invoice", permission: "invoice" },
      { name: "Patient Queue", icon: <img src="/patient-queue.svg" alt="Patient Queue" style={{ width: "20px", height: "20px" }} />, to: "/patient-queue", permission: "patientQueue" },
      { name: "Create Rx", icon: <img src="/create-rx.svg" alt="Create Rx" style={{ width: "20px", height: "20px" }} />, to: "/create-rx", permission: "createRx" },
      { name: "All Patients", icon: <img src="/all-patients.svg" alt="All Patients" style={{ width: "20px", height: "20px" }} />, to: "/all-patients", permission: "allPatients" },
      { name: "Appointments", icon: <img src="/appointments.svg" alt="Appointments" style={{ width: "20px", height: "20px" }} />, to: "/appointments", permission: "appointments" },
      { name: "IPD", icon: <img src="/ipd.svg" alt="IPD" style={{ width: "20px", height: "20px" }} />, to: "/ipd", permission: "ipd" },
      { name: "Messages", icon: <img src="/messages.svg" alt="Messages" style={{ width: "20px", height: "20px" }} />, to: "/messages", permission: "messages" },
      { name: "Social", icon: <img src="/social.svg" alt="Social" style={{ width: "20px", height: "20px" }} />, to: "/social", permission: "social" },
      { name: "Automation", icon: <img src="/automation.svg" alt="Automation" style={{ width: "20px", height: "20px" }} />, to: "/automation", permission: "automation" },
      { name: "More" },
      { name: "Library", icon: <img src="/library.svg" alt="Library" style={{ width: "20px", height: "20px" }} />, permission: "library" },
      { name: "User", icon: <img src="/user.svg" alt="User" style={{ width: "20px", height: "20px" }} />, to: "/user", permission: "settings" },
      { name: "Settings", icon: <img src="/automation.svg" alt="Settings" style={{ width: "20px", height: "20px" }} />, to: "/settings", permission: null }, // No permission required - accessible to all
    ];

    if (!isUserLogin) {
      // Doctor login - show all navigation
      return allNavLinks;
    }

    // User login - filter based on permissions
    return allNavLinks.filter(link => {
      if (link.name === "More") return true; // Always show "More" section
      if (!link.permission) return true; // Show items without permission requirement (like Settings)
      
      const hasPermission = userPermissions[link.permission] && 
        userPermissions[link.permission] !== 'none';
      return hasPermission;
    });
  };

  const navLinks = getFilteredNavLinks();

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        {!isOpen && (
          <button className="p-2 rounded-md bg-white shadow" onClick={() => setIsOpen(true)}>
            <FiSidebar size={20} />
          </button>
        )}
      </div>

      {/* Sidebar Mobile */}
      <motion.aside
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 z-40 h-full w-64 bg-white shadow-lg p-4 lg:hidden"
      >
        <div className="flex justify-between items-center mb-6">
          <img src="/saaro-health2.png" alt="Saaro Health Logo" className="h-30 w-auto object-contain -mb-20 -mt-20 -ml-5" />
          <button onClick={() => setIsOpen(false)}>
            <RxCross2 size={20} />
          </button>
        </div>
        <SidebarContent isLibraryOpen={isLibraryOpen} setIsLibraryOpen={setIsLibraryOpen} navLinks={navLinks} />
      </motion.aside>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col h-screen w-[250px] min-w-[250px] p-4 bg-white shadow-xl z-10 mr-2 overflow-y-auto">
        <div className="flex items-center mb-4">
          <img src="/saaro-health2.png" alt="Saaro Health Logo" className="h-30 w-auto object-contain -mb-20 -mt-20 -ml-5" />
        </div>
        <SidebarContent isLibraryOpen={isLibraryOpen} setIsLibraryOpen={setIsLibraryOpen} navLinks={navLinks} />
      </aside>
    </>
  );
};

const sidebarVariants = {
  open: { x: 0 },
  closed: { x: "-100%" },
};

const SidebarContent = ({ isLibraryOpen, setIsLibraryOpen, navLinks }) => {
  return (
    <nav className="space-y-1">
      {navLinks.map((link, index) => {
        if (link.name.toLowerCase() === "more") {
          return (
            <div
              key={`section-${index}`}
              className="mt-4 mb-2 px-3 text-sm font-semibold text-gray-400 uppercase"
              style={{ color: "#120D1C" }}
            >
              More
            </div>
          );
        }

        if (link.name.toLowerCase() === "library") {
          return (
            <div key="library">
              <button
                onClick={() => setIsLibraryOpen(!isLibraryOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-gray-700 rounded-lg hover:bg-[#e6ddfa] transition"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{link.icon}</span>
                  <span className="text-sm">Library</span>
                </div>
                {isLibraryOpen ? <PiCaretUp /> : <PiCaretDown />}
              </button>
              {isLibraryOpen && (
                <div className="ml-6 space-y-1 text-sm text-gray-600">
                  <NavLink
                    to="/template-library"
                    className={({ isActive }) =>
                      `block px-3 py-1 rounded hover:bg-gray-100 ${isActive ? "font-semibold bg-[#e6ddfa] text-black" : ""}`
                    }
                  >
                    Template
                  </NavLink>
                  <NavLink
                    to="/medicine-library"
                    className={({ isActive }) =>
                      `block px-3 py-1 rounded hover:bg-gray-100 ${isActive ? "font-semibold bg-[#e6ddfa] text-black" : ""}`
                    }
                  >
                    Medicine
                  </NavLink>
                  <NavLink
                    to="/document-library"
                    className={({ isActive }) =>
                      `block px-3 py-1 rounded hover:bg-gray-100 ${isActive ? "font-semibold bg-[#e6ddfa] text-black" : ""}`
                    }
                  >
                    Document
                  </NavLink>
                </div>
              )}
            </div>
          );
        }

        return (
          <NavLink
            key={link.name}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#e6ddfa] transition ${
                isActive ? "bg-[#e6ddfa] font-semibold text-black" : "text-gray-700"
              }`
            }
          >
            <span className="text-lg">{link.icon}</span>
            <span className="text-sm">{link.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default Sidebar;
