import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdNotifications } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import axiosInstance from "../../api/axiosInstance";
import { clearAllAuth } from "../../utils/auth";

const Header = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const dropdownRef = useRef(null);

  const isUserLogin = localStorage.getItem('isUserLogin') === 'true';
  const [displayName, setDisplayName] = useState(
    localStorage.getItem('userName') || localStorage.getItem('doctorName') || 'User'
  );
  const currentUserRole = localStorage.getItem('userRole') || 'Doctor';

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const isUserLogin = localStorage.getItem('isUserLogin') === 'true';
        const normalizeUrl = (url) => {
          try {
            const apiOrigin = new URL(axiosInstance.defaults.baseURL).origin;
            const resolved = new URL(url, apiOrigin);
            const pageIsHttps = window.location.protocol === 'https:';
            if (resolved.hostname.includes('localhost') && !window.location.hostname.includes('localhost')) {
              return `${apiOrigin}${resolved.pathname}`;
            }
            if (pageIsHttps && resolved.protocol !== 'https:') {
              return `https://${resolved.host}${resolved.pathname}`;
            }
            return resolved.href;
          } catch (e) {
            return url;
          }
        };

        if (isUserLogin) {
          // Staff user: load their own avatar
          const res = await axiosInstance.get(`/user/me`);
          const user = res.data && res.data.user;
          if (user?.avatar) {
            setProfilePicture(normalizeUrl(user.avatar));
          }
        } else {
          // Doctor: load doctor avatar
          const doctorId = localStorage.getItem('doctorId');
          if (!doctorId) return;
          const res = await axiosInstance.get(`/doctor/${doctorId}`);
          const doctor = res.data && res.data.doctor;
          if (doctor?.avatar) {
            setProfilePicture(normalizeUrl(doctor.avatar));
          }
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
      }
    };

    fetchProfilePicture();
  }, []);

  // Listen for Settings page updates to refresh avatar/name without reload
  useEffect(() => {
    const normalizeUrl = (url) => {
      try {
        const apiOrigin = new URL(axiosInstance.defaults.baseURL).origin;
        const resolved = new URL(url, apiOrigin);
        const pageIsHttps = window.location.protocol === 'https:';
        if (resolved.hostname.includes('localhost') && !window.location.hostname.includes('localhost')) {
          return `${apiOrigin}${resolved.pathname}`;
        }
        if (pageIsHttps && resolved.protocol !== 'https:') {
          return `https://${resolved.host}${resolved.pathname}`;
        }
        return resolved.href;
      } catch (e) {
        return url;
      }
    };

    const handler = (e) => {
      const { avatar, name } = e.detail || {};
      if (avatar) setProfilePicture(normalizeUrl(avatar));
      if (name) setDisplayName(name);
    };
    window.addEventListener('profile-updated', handler);
    return () => window.removeEventListener('profile-updated', handler);
  }, []);

  const logoutHandler = async () => {
    try {
      if (isUserLogin) {
        await axiosInstance.post('/user/logout');
      } else {
        await axiosInstance.post('/doctor/logout');
      }
    } catch (e) {
      console.error('Logout error:', e);
    }
    
    // Clear all stored data using auth utility
    clearAllAuth();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">Saaro Health</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-600 transition">
            <IoMdNotifications size={20} />
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition"
            >
              {profilePicture ? (
                <img 
                  src={profilePicture} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    console.log('Avatar image failed to load:', profilePicture);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : null}
              <CgProfile size={20} className="text-gray-600" style={{ display: profilePicture ? 'none' : 'block' }} />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500 capitalize">{currentUserRole}</p>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    {profilePicture ? (
                      <img 
                        src={profilePicture} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          console.log('Avatar image failed to load in dropdown:', profilePicture);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <CgProfile size={20} className="text-gray-600" style={{ display: profilePicture ? 'none' : 'block' }} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-500 capitalize">{currentUserRole}</p>
                      {isUserLogin && (
                        <p className="text-xs text-gray-500">
                          Clinic: {localStorage.getItem('clinicName')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/settings');
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                >
                  Settings
                </button>
                
                <button
                  onClick={logoutHandler}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
